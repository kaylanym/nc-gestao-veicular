'use strict';

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const crypto     = require('crypto');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

/* ── Validação de variáveis obrigatórias ── */
const REQUIRED_ENV = ['MP_ACCESS_TOKEN', 'MP_PUBLIC_KEY', 'BACKEND_URL', 'FRONTEND_URL'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[FATAL] Variável de ambiente "${key}" não definida. Configure o arquivo .env.`);
    process.exit(1);
  }
}

/* ── Mercado Pago SDK ── */
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 10000 },
});

const preferenceAPI = new Preference(mpClient);
const paymentAPI    = new Payment(mpClient);

/* ── Express ── */
const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: function (origin, callback) {
    // Permite qualquer localhost (desenvolvimento) e a URL de produção configurada
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin) || origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('CORS: origem não permitida — ' + origin));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/* Mantém o body bruto para validação de assinatura do webhook */
app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

/* ════════════════════════════════════════════════
   POST /api/create-preference
   Body: { servico, preco, placa, clienteId, clienteEmail, clienteNome }
   Retorna: { id, init_point }
════════════════════════════════════════════════ */
app.post('/api/create-preference', async (req, res) => {
  const { servico, preco, placa, clienteId, clienteEmail, clienteNome } = req.body;

  if (!servico || !preco || !placa) {
    return res.status(400).json({ erro: 'Campos obrigatórios: servico, preco, placa.' });
  }

  if (typeof preco !== 'number' || preco <= 0) {
    return res.status(400).json({ erro: 'Preço inválido.' });
  }

  try {
    const externalReference = `${clienteId || 'guest'}_${Date.now()}`;

    const preference = await preferenceAPI.create({
      body: {
        items: [
          {
            id:          servico,
            title:       servico,
            description: `Placa: ${placa.toUpperCase()}`,
            quantity:    1,
            unit_price:  preco,
            currency_id: 'BRL',
          },
        ],

        payer: clienteEmail
          ? { name: clienteNome || '', email: clienteEmail }
          : undefined,

        /* Redirecionamentos pós-pagamento
           Em produção o FRONTEND_URL deve ser uma URL pública (não localhost) */
        ...(() => {
          const isLocal = (process.env.FRONTEND_URL || '').includes('localhost');
          if (isLocal) return {};
          return {
            back_urls: {
              success: `${process.env.FRONTEND_URL}/pagamento/sucesso`,
              failure: `${process.env.FRONTEND_URL}/pagamento/falha`,
              pending: `${process.env.FRONTEND_URL}/pagamento/pendente`,
            },
            auto_return: 'approved',
          };
        })(),

        /* Webhook de notificações */
        notification_url: `${process.env.BACKEND_URL}/api/webhook`,

        /* Referência para identificar o pedido no webhook */
        external_reference: externalReference,

        /* Expiração da preferência: 30 minutos */
        expires: true,
        expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(),

        statement_descriptor: 'NC GESTAO VEICULAR',
      },
    });

    return res.status(201).json({
      preferenceId:    preference.id,
      init_point:      preference.init_point,       // produção
      sandbox_init_point: preference.sandbox_init_point, // testes
      externalReference,
    });
  } catch (err) {
    console.error('[create-preference] Erro MP:', err);
    return res.status(502).json({ erro: 'Erro ao criar preferência de pagamento.' });
  }
});

/* ════════════════════════════════════════════════
   POST /api/webhook
   Recebe notificações do Mercado Pago (IPN / Webhooks)
════════════════════════════════════════════════ */
app.post('/api/webhook', async (req, res) => {
  /* ── Validação de assinatura (segurança) ── */
  if (process.env.MP_WEBHOOK_SECRET) {
    const xSignature  = req.headers['x-signature']  || '';
    const xRequestId  = req.headers['x-request-id'] || '';
    const rawBody     = req.body; // Buffer por causa do express.raw acima

    const parts = {};
    xSignature.split(',').forEach(part => {
      const [k, v] = part.trim().split('=');
      if (k && v) parts[k] = v;
    });

    const manifest = `id:${req.query['data.id']};request-id:${xRequestId};ts:${parts.ts};`;
    const expected = crypto
      .createHmac('sha256', process.env.MP_WEBHOOK_SECRET)
      .update(manifest)
      .digest('hex');

    if (expected !== parts.v1) {
      console.warn('[webhook] Assinatura inválida — requisição rejeitada.');
      return res.status(401).json({ erro: 'Assinatura inválida.' });
    }
  }

  const { type, data } = typeof req.body === 'string' || Buffer.isBuffer(req.body)
    ? JSON.parse(req.body.toString())
    : req.body;

  /* Responde 200 imediatamente para o MP não retentar */
  res.sendStatus(200);

  if (type !== 'payment') return;

  try {
    const payment = await paymentAPI.get({ id: data.id });

    console.log('[webhook] Pagamento recebido:', {
      id:        payment.id,
      status:    payment.status,
      ref:       payment.external_reference,
      valor:     payment.transaction_amount,
      metodo:    payment.payment_method_id,
    });

    if (payment.status === 'approved') {
      /* ── Liberar consulta de documento ── */
      await liberarConsulta(payment);
    }

  } catch (err) {
    console.error('[webhook] Erro ao processar pagamento:', err);
  }
});

/* ════════════════════════════════════════════════
   Lógica de negócio: liberar consulta após pagamento aprovado
════════════════════════════════════════════════ */
async function liberarConsulta(payment) {
  const { external_reference, id: paymentId, transaction_amount } = payment;

  /*
   * external_reference = "{clienteId}_{timestamp}" (definido em create-preference)
   * Aqui você persiste o pagamento no Supabase e marca o pedido como "pago".
   *
   * Exemplo com Supabase JS (descomente e ajuste conforme sua tabela):
   *
   * const { createClient } = require('@supabase/supabase-js');
   * const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
   *
   * await supabase
   *   .from('pedidos')
   *   .update({ status: 'pago', mp_payment_id: String(paymentId) })
   *   .eq('mp_external_reference', external_reference);
   */

  console.log(`[liberarConsulta] Pagamento ${paymentId} aprovado — ref: ${external_reference} — R$ ${transaction_amount}`);
}

/* ════════════════════════════════════════════════
   Retorna a public key para o frontend (sem expor o access token)
════════════════════════════════════════════════ */
app.get('/api/mp-public-key', (_req, res) => {
  res.json({ publicKey: process.env.MP_PUBLIC_KEY });
});

/* ── Health check ── */
app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`✅  Backend NC Gestão Veicular rodando na porta ${PORT}`);
  console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL}`);
  console.log(`   BACKEND_URL:  ${process.env.BACKEND_URL}`);
});

/* ═══════════════════════════════════════════════
   NC Gestão Veicular — Dashboard JS
   ═══════════════════════════════════════════════ */

var WPP_NUMBER = '5511999999999'; // Substitua pelo número real

/* URL do seu backend Node.js — altere conforme o ambiente */
var BACKEND_URL = 'https://ncgestaoveicular.app.br';

/* Cache do cliente logado — preenchido em carregarUsuario() */
var _clienteCache = null;

/* Páginas atuais por seção */
var _pagAtual = { pedidos: 1, historico: 1, faturas: 1 };
var POR_PAGINA = 10;

/* Gera HTML de paginação e retorna slice da lista */
function aplicarPaginacao(lista, secao, renderFn) {
  var total = lista.length;
  var totalPags = Math.ceil(total / POR_PAGINA) || 1;
  _pagAtual[secao] = Math.min(_pagAtual[secao] || 1, totalPags);
  var pag = _pagAtual[secao];
  var inicio = (pag - 1) * POR_PAGINA;
  var slice = lista.slice(inicio, inicio + POR_PAGINA);

  var btns = '';
  btns += '<button class="pag-btn"' + (pag === 1 ? ' disabled' : '') + ' onclick="_pagAtual[\'' + secao + '\']=' + (pag - 1) + ';' + renderFn + '">‹</button>';
  for (var i = 1; i <= totalPags; i++) {
    if (totalPags > 7 && i > 2 && i < totalPags - 1 && Math.abs(i - pag) > 1) {
      if (i === 3 || i === totalPags - 2) btns += '<span class="pag-info">…</span>';
      continue;
    }
    btns += '<button class="pag-btn' + (i === pag ? ' ativo' : '') + '" onclick="_pagAtual[\'' + secao + '\']=' + i + ';' + renderFn + '">' + i + '</button>';
  }
  btns += '<button class="pag-btn"' + (pag === totalPags ? ' disabled' : '') + ' onclick="_pagAtual[\'' + secao + '\']=' + (pag + 1) + ';' + renderFn + '">›</button>';

  var paginacaoHtml = total > POR_PAGINA
    ? '<div class="paginacao">' + btns + '<span class="pag-info">Página ' + pag + ' de ' + totalPags + '</span></div>'
    : '';

  return { slice: slice, paginacaoHtml: paginacaoHtml };
}

/* ── Preços CRLV-E Imediato por estado ── */
var CRLV_ESTADOS = [
  { uf: 'AC', nome: 'Acre',         preco: 35.90 },
  { uf: 'AP', nome: 'Amapá',        preco: 14.90 },
  { uf: 'BA', nome: 'Bahia',        preco: 35.90 },
  { uf: 'GO', nome: 'Goiás',        preco: 35.90 },
  { uf: 'MA', nome: 'Maranhão',     preco: 14.90 },
  { uf: 'MG', nome: 'Minas Gerais', preco: 19.90 },
  { uf: 'PI', nome: 'Piauí',        preco: 29.90 },
  { uf: 'PR', nome: 'Paraná',       preco: 25.90 },
  { uf: 'RR', nome: 'Roraima',      preco: 24.90 },
  { uf: 'SE', nome: 'Sergipe',      preco: 29.90 },
  { uf: 'SP', nome: 'São Paulo',    preco: 29.90 },
  { uf: 'TO', nome: 'Tocantins',    preco: 14.90 },
];

/* ── Serviços ── */
var SERVICOS = [
  /* CRLV-E Imediato — emissão até 15 minutos */
  { id: 'crlv-ac', cat: 'crlv', nome: 'CRLV-E Acre',         desc: 'Emissão imediata — até 15 minutos', states: 'AC', preco:  35.90, icon: '🚗', tipo: 'placa' },
  { id: 'crlv-ap', cat: 'crlv', nome: 'CRLV-E Amapá',        desc: 'Emissão imediata — até 15 minutos', states: 'AP', preco:  14.90, icon: '🚗', tipo: 'placa' },
  { id: 'crlv-ba', cat: 'crlv', nome: 'CRLV-E Bahia',        desc: 'Emissão imediata — até 15 minutos', states: 'BA', preco:  35.90, icon: '🚗', tipo: 'placa' },
  { id: 'crlv-go', cat: 'crlv', nome: 'CRLV-E Goiás',        desc: 'Emissão imediata — até 15 minutos', states: 'GO', preco:  35.90, icon: '🚗', tipo: 'placa' },
  { id: 'crlv-ma', cat: 'crlv', nome: 'CRLV-E Maranhão',     desc: 'Emissão imediata — até 15 minutos', states: 'MA', preco:  14.90, icon: '🚗', tipo: 'placa' },
  { id: 'crlv-mg', cat: 'crlv', nome: 'CRLV-E Minas Gerais', desc: 'Emissão imediata — até 15 minutos', states: 'MG', preco:  19.90, icon: '🚗', tipo: 'placa' },
  { id: 'crlv-pi', cat: 'crlv', nome: 'CRLV-E Piauí',        desc: 'Emissão imediata — até 15 minutos', states: 'PI', preco:  29.90, icon: '🚗', tipo: 'placa' },
  { id: 'crlv-pr', cat: 'crlv', nome: 'CRLV-E Paraná',       desc: 'Emissão imediata — até 15 minutos', states: 'PR', preco:  25.90, icon: '🚗', tipo: 'placa' },
  { id: 'crlv-rr', cat: 'crlv', nome: 'CRLV-E Roraima',      desc: 'Emissão imediata — até 15 minutos', states: 'RR', preco:  24.90, icon: '🚗', tipo: 'placa' },
  { id: 'crlv-se', cat: 'crlv', nome: 'CRLV-E Sergipe',      desc: 'Emissão imediata — até 15 minutos', states: 'SE', preco:  29.90, icon: '🚗', tipo: 'placa' },
  { id: 'crlv-sp', cat: 'crlv', nome: 'CRLV-E São Paulo',    desc: 'Emissão imediata — até 15 minutos', states: 'SP', preco:  29.90, icon: '🚗', tipo: 'placa' },
  { id: 'crlv-to', cat: 'crlv', nome: 'CRLV-E Tocantins',    desc: 'Emissão imediata — até 15 minutos', states: 'TO', preco:  14.90, icon: '🚗', tipo: 'placa' },

  /* CRLV-E Agendado — entrega em até 72h úteis via WhatsApp */
  { id: 'crlv-ag-rj1', cat: 'crlv-ag', nome: 'CRLV-E Rio de Janeiro — 1ª Via',       desc: 'Agendado — entrega em até 72h úteis via WhatsApp', states: 'RJ', preco:  29.90, icon: '📅', tipo: 'placa', wpp: true, badge: 'ag' },
  { id: 'crlv-ag-rj2', cat: 'crlv-ag', nome: 'CRLV-E Rio de Janeiro — 2ª Via',       desc: 'Reemissão agendada — entrega em até 72h úteis via WhatsApp', states: 'RJ', preco: 129.90, icon: '📅', tipo: 'placa', wpp: true, badge: 'ag' },
  { id: 'crlv-ag-al',  cat: 'crlv-ag', nome: 'CRLV-E Alagoas',                        desc: 'Agendado — entrega em até 72h úteis via WhatsApp', states: 'AL', preco:  34.90, icon: '📅', tipo: 'placa', wpp: true, badge: 'ag' },
  { id: 'crlv-ag-am',  cat: 'crlv-ag', nome: 'CRLV-E Amazonas',                       desc: 'Agendado — entrega em até 72h úteis via WhatsApp', states: 'AM', preco:  79.90, icon: '📅', tipo: 'placa', wpp: true, badge: 'ag' },
  { id: 'crlv-ag-ce',  cat: 'crlv-ag', nome: 'CRLV-E Ceará',                          desc: 'Agendado — entrega em até 72h úteis via WhatsApp', states: 'CE', preco:  69.90, icon: '📅', tipo: 'placa', wpp: true, badge: 'ag' },
  { id: 'crlv-ag-df',  cat: 'crlv-ag', nome: 'CRLV-E Distrito Federal',               desc: 'Agendado — entrega em até 72h úteis via WhatsApp', states: 'DF', preco:  69.90, icon: '📅', tipo: 'placa', wpp: true, badge: 'ag' },
  { id: 'crlv-ag-es',  cat: 'crlv-ag', nome: 'CRLV-E Espírito Santo',                 desc: 'Agendado — entrega em até 72h úteis via WhatsApp', states: 'ES', preco:  29.90, icon: '📅', tipo: 'placa', wpp: true, badge: 'ag' },
  { id: 'crlv-ag-mt',  cat: 'crlv-ag', nome: 'CRLV-E Mato Grosso',                    desc: 'Agendado — entrega em até 72h úteis via WhatsApp', states: 'MT', preco:  34.90, icon: '📅', tipo: 'placa', wpp: true, badge: 'ag' },
  { id: 'crlv-ag-pb',  cat: 'crlv-ag', nome: 'CRLV-E Paraíba',                        desc: 'Agendado — entrega em até 72h úteis via WhatsApp', states: 'PB', preco:  59.90, icon: '📅', tipo: 'placa', wpp: true, badge: 'ag' },
  { id: 'crlv-ag-rn',  cat: 'crlv-ag', nome: 'CRLV-E Rio Grande do Norte',            desc: 'Agendado — entrega em até 72h úteis via WhatsApp', states: 'RN', preco:  69.90, icon: '📅', tipo: 'placa', wpp: true, badge: 'ag' },
  { id: 'crlv-ag-rs',  cat: 'crlv-ag', nome: 'CRLV-E Rio Grande do Sul',              desc: 'Agendado — entrega em até 72h úteis via WhatsApp', states: 'RS', preco: 129.90, icon: '📅', tipo: 'placa', wpp: true, badge: 'ag' },
  { id: 'crlv-ag-ro',  cat: 'crlv-ag', nome: 'CRLV-E Rondônia',                       desc: 'Agendado — entrega em até 72h úteis via WhatsApp', states: 'RO', preco:  39.90, icon: '📅', tipo: 'placa', wpp: true, badge: 'ag' },
  { id: 'crlv-ag-sc',  cat: 'crlv-ag', nome: 'CRLV-E Santa Catarina',                 desc: 'Agendado — entrega em até 72h úteis via WhatsApp', states: 'SC', preco:  79.90, icon: '📅', tipo: 'placa', wpp: true, badge: 'ag' },

  /* ATPV-E — emissão em até 2 horas */
  { id: 'atpv-es', cat: 'atpv', nome: 'ATPV-E Espírito Santo',      desc: 'Emissão em até 2 horas', states: 'ES', preco:  80.00, icon: '📄', tipo: 'placa' },
  { id: 'atpv-mg', cat: 'atpv', nome: 'ATPV-E Minas Gerais',        desc: 'Emissão em até 2 horas', states: 'MG', preco: 100.00, icon: '📄', tipo: 'placa' },
  { id: 'atpv-ba', cat: 'atpv', nome: 'ATPV-E Bahia',               desc: 'Emissão em até 2 horas', states: 'BA', preco: 110.00, icon: '📄', tipo: 'placa' },
  { id: 'atpv-sc', cat: 'atpv', nome: 'ATPV-E Santa Catarina',      desc: 'Emissão em até 2 horas', states: 'SC', preco: 130.00, icon: '📄', tipo: 'placa' },
  { id: 'atpv-al', cat: 'atpv', nome: 'ATPV-E Alagoas',             desc: 'Emissão em até 2 horas', states: 'AL', preco: 150.00, icon: '📄', tipo: 'placa' },
  { id: 'atpv-rj', cat: 'atpv', nome: 'ATPV-E Rio de Janeiro',      desc: 'Emissão em até 2 horas', states: 'RJ', preco: 130.00, icon: '📄', tipo: 'placa' },
  { id: 'atpv-rs', cat: 'atpv', nome: 'ATPV-E Rio Grande do Sul',   desc: 'Emissão em até 2 horas', states: 'RS', preco: 150.00, icon: '📄', tipo: 'placa' },
  { id: 'atpv-pr', cat: 'atpv', nome: 'ATPV-E Paraná',              desc: 'Emissão em até 2 horas', states: 'PR', preco: 130.00, icon: '📄', tipo: 'placa' },
  { id: 'atpv-ce', cat: 'atpv', nome: 'ATPV-E Ceará',               desc: 'Emissão em até 2 horas', states: 'CE', preco: 200.00, icon: '📄', tipo: 'placa' },

  /* Débitos */
  { id: 'painel-debitos-consulta', cat: 'debitos', nome: 'Painel de Débitos — Consulta',
    desc: 'Consulte multas, IPVA, licenciamento e pendências do veículo.',
    states: '', preco: 10.90, icon: '🔍', tipo: 'placa', emBreve: true },
  { id: 'painel-debitos-pagamento', cat: 'debitos', nome: 'Painel de Débitos — Pagamento',
    desc: 'Pague todos os débitos do seu veículo em um único lugar.',
    states: '', preco: 39.90, icon: '💳', tipo: 'placa', emBreve: true },

  /* Boletos */
  { id: 'boleto-multa', cat: 'boletos', nome: 'Boleto de Multa',
    desc: 'Emissão de boleto de multa de trânsito.', states: '', preco: 19.90, icon: '📋', tipo: 'placa', emBreve: true },
  { id: 'boleto-ipva', cat: 'boletos', nome: 'Boleto de IPVA',
    desc: 'Emissão de boleto de IPVA para pagamento.', states: '', preco: 19.90, icon: '📋', tipo: 'placa', emBreve: true },
  { id: 'boleto-licenciamento', cat: 'boletos', nome: 'Licenciamento',
    desc: 'Emissão de boleto de licenciamento anual.', states: '', preco: 19.90, icon: '📋', tipo: 'placa', emBreve: true },

  /* Código de Segurança */
  { id: 'codigo-seg-crlv', cat: 'codigo-seg', nome: 'Código de Segurança CRLV-E',
    desc: 'Geração e validação do código de segurança para documentos CRLV-E.',
    states: 'Todo o Brasil', preco: 19.90, icon: '🔐', tipo: 'placa' },
  { id: 'codigo-seg-atpv', cat: 'codigo-seg', nome: 'Código de Segurança ATPV-E',
    desc: 'Geração e validação do código de segurança para documentos ATPV-E.',
    states: 'Todo o Brasil', preco: 19.90, icon: '🔐', tipo: 'placa' },

  /* Comunicado de Venda */
  { id: 'com-venda', cat: 'com-venda', nome: 'Comunicado de Venda',
    desc: 'Registre a transferência de propriedade do veículo junto ao DETRAN.',
    states: 'Todo o Brasil', preco: 80.00, icon: '📝', tipo: 'com-venda' },
];

/* ── Tabela de valores agrupada ── */
var TABELA_GRUPOS = [
  { label: 'CRLV-E Imediato',  ids: ['crlv-ac','crlv-ap','crlv-ba','crlv-go','crlv-ma','crlv-mg','crlv-pi','crlv-pr','crlv-rr','crlv-se','crlv-sp','crlv-to'] },
  { label: 'CRLV-E Agendado',  ids: ['crlv-ag-rj1','crlv-ag-rj2','crlv-ag-al','crlv-ag-am','crlv-ag-ce','crlv-ag-df','crlv-ag-es','crlv-ag-mt','crlv-ag-pb','crlv-ag-rn','crlv-ag-rs','crlv-ag-ro','crlv-ag-sc'] },
  { label: 'ATPV-E',           ids: ['atpv-es','atpv-mg','atpv-ba','atpv-sc','atpv-al','atpv-rj','atpv-rs','atpv-pr','atpv-ce'] },
  { label: 'Débitos',          ids: ['painel-debitos-consulta','painel-debitos-pagamento'] },
  { label: 'Boletos',          ids: ['boleto-multa','boleto-ipva','boleto-licenciamento'] },
  { label: 'Código de Segurança', ids: ['codigo-seg-crlv','codigo-seg-atpv'] },
];

/* ── Estado atual ── */
var catAtiva = 'todos';
var catPedidoAtiva = 'todos';
var servicoSelecionado = null;

/* ── Init ── */
document.addEventListener('DOMContentLoaded', function () {
  carregarUsuario();
  initNav();
  initBanner();
  initSbToggle();
  renderServicos('todos');
  initBusca();
  initTabs();
  initPedidosTabs();
  renderTabelaValores();
  initModal();
  initComunicado();
  initSaldo();
  initModalPagamento();
  configurarWpp();
  initPerfil();
});

/* ── Usuário ── */
async function carregarUsuario() {
  var c = await getClienteAtual();
  if (!c) { window.location.href = 'index.html'; return; }
  _clienteCache = c;
  var nome = c.nomeCompleto || 'Cliente';
  document.getElementById('header-nome').textContent = nome;
  document.getElementById('perfil-nome').textContent = nome;
  document.getElementById('perfil-email').textContent = c.email || '—';
  document.getElementById('perfil-tel').textContent = c.telefone || '—';
  document.getElementById('perfil-end').textContent = c.endereco || '—';
  var senhaEl = document.getElementById('perfil-senha-atual');
  if (senhaEl) senhaEl.value = c.senha || '';
  atualizarStats();
  atualizarSaldoBadges(c.saldo || 0);
  initCpfPerfil(c);
  if (c.isAdmin) {
    var linkAdmin = document.getElementById('link-painel-admin');
    if (linkAdmin) linkAdmin.style.display = '';
  }
}

function initCpfPerfil(cliente) {
  var valEl  = document.getElementById('perfil-cpf-val');
  var inp    = document.getElementById('perfil-cpf-input');
  var btn    = document.getElementById('perfil-cpf-btn');
  if (!valEl || !inp || !btn) return;

  if (cliente.cpf) {
    valEl.textContent = cliente.cpf;
    btn.style.display = 'none';
  } else {
    valEl.textContent = '—';
    btn.textContent = 'Adicionar CPF';
  }

  btn.addEventListener('click', async function() {
    if (inp.style.display === 'none') {
      inp.style.display = 'inline-block';
      inp.focus();
      btn.textContent = 'Salvar';
      return;
    }
    var cpf = inp.value.replace(/\D/g, '');
    if (cpf.length !== 11) {
      mostrarToast('CPF inválido. Digite os 11 dígitos.', 'erro');
      return;
    }
    var cpfFmt = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    var cl = await getClienteAtual();
    if (!cl) return;
    var { error } = await _supabase.from('clientes').update({ cpf: cpfFmt }).eq('id', cl.id);
    if (error) { mostrarToast('Erro ao salvar CPF.', 'erro'); return; }
    valEl.textContent = cpfFmt;
    inp.style.display = 'none';
    btn.style.display = 'none';
    mostrarToast('CPF salvo com sucesso!', 'sucesso');
  });
}

/* ── Stats ── */
async function atualizarStats() {
  var pedidos = await getPedidosDoCliente();
  var el = document.getElementById('stat-pedidos');
  if (el) el.textContent = pedidos.length;
  mostrarAlertaNegados(pedidos);
}

/* ── Alerta de pedidos recusados ── */
function mostrarAlertaNegados(pedidos) {
  var negados = pedidos.filter(function (p) { return p.status === 'negado' || p.status === 'pagamento_negado'; });
  var banner = document.getElementById('banner-negados');
  if (!banner) return;
  if (negados.length === 0) { banner.style.display = 'none'; return; }

  var lista = negados.map(function (p) {
    var motivo = p.observacao_admin ? ': <em>' + p.observacao_admin + '</em>' : '';
    return '<li><strong>' + (p.servico || 'Pedido') + '</strong>' + motivo + '</li>';
  }).join('');

  banner.innerHTML =
    '<div style="display:flex;align-items:flex-start;gap:12px">' +
      '<span style="font-size:1.3rem;line-height:1">❌</span>' +
      '<div style="flex:1">' +
        '<strong style="display:block;margin-bottom:4px">Você tem ' + negados.length + ' pedido(s) recusado(s):</strong>' +
        '<ul style="margin:0;padding-left:16px;font-size:.85rem">' + lista + '</ul>' +
        '<span style="font-size:.8rem;opacity:.8">Acesse "Meus Pedidos" para ver os detalhes.</span>' +
      '</div>' +
      '<button onclick="this.parentElement.parentElement.style.display=\'none\'" style="background:none;border:none;cursor:pointer;font-size:1.1rem;color:inherit;opacity:.7;padding:0 4px">✕</button>' +
    '</div>';
  banner.style.display = 'block';
}

/* ── Navegação sidebar ── */
function initNav() {
  var links = document.querySelectorAll('.sb-link[data-section]');
  links.forEach(function (link) {
    link.addEventListener('click', function () {
      var sec = link.getAttribute('data-section');
      links.forEach(function (l) { l.classList.remove('active'); });
      link.classList.add('active');
      document.querySelectorAll('.dash-section').forEach(function (s) { s.classList.remove('active'); });
      var alvo = document.getElementById('section-' + sec);
      if (alvo) {
        alvo.classList.add('active');
        if (sec === 'fipe') initFipe();
        else if (sec === 'saldo') { carregarSaldo(); carregarHistoricoTransacoes(); }
        else if (sec === 'faturas') carregarFaturas();
        else if (sec !== 'novo-pedido') renderPedidosFiltrados(sec);
      }
      if (window.innerWidth < 769) fecharSidebar();
    });
  });
}

/* ── Faturas ── */
async function carregarFaturas() {
  var secEl = document.getElementById('section-faturas');
  if (!secEl) return;

  var HEADER = '<div class="sec-header"><h2>Faturas</h2><p>Histórico de pagamentos realizados na plataforma.</p></div>';
  secEl.innerHTML = HEADER + '<div style="text-align:center;padding:40px;color:#888">Carregando...</div>';

  var cliente = _clienteCache || await getClienteAtual();
  if (!cliente) {
    secEl.innerHTML = HEADER + '<div class="card" style="text-align:center;padding:40px;color:#888">Sessão expirada. Faça login novamente.</div>';
    return;
  }

  var res = await _supabase
    .from('pedidos')
    .select('*')
    .eq('cliente_id', cliente.id)
    .gt('preco', 0)
    .order('criado_em', { ascending: false });

  if (res.error) {
    secEl.innerHTML = HEADER + '<div class="card" style="text-align:center;padding:40px;color:#ef4444">Erro ao carregar faturas. Tente novamente.</div>';
    return;
  }

  var data = res.data || [];

  if (data.length === 0) {
    secEl.innerHTML = HEADER +
      '<div style="background:#fff;border-radius:14px;box-shadow:0 1px 4px rgba(0,0,0,.08);text-align:center;padding:48px 24px">' +
        '<div style="font-size:2.5rem;margin-bottom:12px">🧾</div>' +
        '<div style="font-weight:600;font-size:15px;margin-bottom:6px">Nenhuma fatura ainda</div>' +
        '<div style="color:#888;font-size:13px">Suas faturas aparecerão aqui após realizar um pedido pago.</div>' +
      '</div>';
    return;
  }

  var STATUS_LABEL = { aguardando: 'Aguardando', aceito: 'Em andamento', negado: 'Recusado', concluido: 'Concluído', aguardando_pagamento: 'Ag. Pagamento', pagamento_negado: 'Pag. Recusado' };

  var total = data.reduce(function(s, p) { return s + parseFloat(p.preco || 0); }, 0);
  var totalFmt = 'R$ ' + total.toFixed(2).replace('.', ',');

  var cardStyle = 'background:#fff;border-radius:14px;box-shadow:0 1px 4px rgba(0,0,0,.08);';

  var pagF = aplicarPaginacao(data, 'faturas', 'carregarFaturas()');
  var itensPag = pagF.slice.map(function(p) {
    var preco = 'R$ ' + parseFloat(p.preco).toFixed(2).replace('.', ',');
    var dataFmt = p.criado_em ? new Date(p.criado_em).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—';
    var status = STATUS_LABEL[p.status] || p.status || 'Aguardando';
    var placaStr = p.placa ? '<span>Placa: <strong>' + p.placa + '</strong></span> &nbsp;·&nbsp; ' : '';
    var docBtn = p.arquivo_url
      ? '<a href="' + p.arquivo_url + '" target="_blank" style="display:inline-flex;align-items:center;gap:5px;font-size:.75rem;color:#f97316;font-weight:600;text-decoration:none;background:#fff7ed;border:1px solid #fdba74;border-radius:6px;padding:3px 10px;margin-top:6px">📄 Ver documento</a>'
      : '';
    return '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:14px 0;border-bottom:1px solid #eee">' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-weight:600;font-size:13.5px;margin-bottom:3px">' + (p.servico || '—') + '</div>' +
        '<div style="font-size:11.5px;color:#888">' + placaStr + dataFmt + '</div>' +
        docBtn +
      '</div>' +
      '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px;flex-shrink:0">' +
        '<div style="font-weight:700;font-size:14px;color:#111">' + preco + '</div>' +
        '<span style="background:#fff7ed;color:#c2410c;border:1px solid #fdba74;border-radius:6px;padding:2px 10px;font-size:.72rem;font-weight:600;white-space:nowrap">' + status + '</span>' +
      '</div>' +
    '</div>';
  }).join('');

  secEl.innerHTML = HEADER +
    '<div style="' + cardStyle + 'margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;padding:14px 20px">' +
      '<span style="font-size:13px;color:#888">' + data.length + ' fatura(s) encontrada(s)</span>' +
      '<span style="font-weight:700;font-size:15px;color:#111">Total: ' + totalFmt + '</span>' +
    '</div>' +
    '<div style="' + cardStyle + 'padding:0 20px">' + itensPag + pagF.paginacaoHtml + '</div>';
}

/* ── Banner ── */
function initBanner() {
  var btn = document.getElementById('banner-close');
  if (btn) btn.addEventListener('click', function () {
    var b = document.getElementById('dash-banner');
    if (b) b.style.display = 'none';
  });
}

/* ── Sidebar toggle mobile ── */
function initSbToggle() {
  var btn = document.getElementById('sb-toggle');
  if (btn) btn.addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('open');
  });
}
function fecharSidebar() {
  document.getElementById('sidebar').classList.remove('open');
}

/* ── Tabs de categoria ── */
function initTabs() {
  var tabs = document.querySelectorAll('.srv-tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      catAtiva = tab.getAttribute('data-cat');
      renderServicos(catAtiva);
    });
  });
}

/* ── Busca ── */
function initBusca() {
  var inp = document.getElementById('busca-servico');
  if (!inp) return;
  inp.addEventListener('input', function () {
    var q = inp.value.trim().toLowerCase();
    renderServicos(catAtiva, q);
  });
}

/* ── Ícones SVG por categoria ── */
var ICONES_CAT = {
  'crlv':       { bg: '#fff7ed', color: '#c2410c', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></svg>' },
  'crlv-ag':    { bg: '#f5f3ff', color: '#7c3aed', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/></svg>' },
  'atpv':       { bg: '#fdf4ff', color: '#9333ea', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' },
  'debitos':    { bg: '#fff7ed', color: '#ea580c', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>' },
  'boletos':    { bg: '#f0fdf4', color: '#16a34a', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>' },
  'codigo-seg': { bg: '#fef9ec', color: '#d97706', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' },
  'despachante':{ bg: '#f8fafc', color: '#475569', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
  'com-venda':  { bg: '#f0fdf4', color: '#15803d', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' },
};
function getIconHtml(cat) {
  var ic = ICONES_CAT[cat] || ICONES_CAT['despachante'];
  return '<div style="width:40px;height:40px;border-radius:10px;background:' + ic.bg + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;color:' + ic.color + '">' + ic.svg + '</div>';
}

/* ── Render serviços ── */
function renderServicos(cat, query) {
  var grid = document.getElementById('servicos-grid');
  if (!grid) return;
  query = query || '';

  var lista = SERVICOS.filter(function (s) {
    var catOk = cat === 'todos' || s.cat === cat || (cat === 'crlv' && s.cat === 'crlv-ag');
    var q = query.toLowerCase();
    var nomeLower = s.nome.toLowerCase();
    var statesLower = (s.states || '').toLowerCase();
    var descLower = (s.desc || '').toLowerCase();
    var buscaOk = !q || nomeLower.includes(q) || statesLower.includes(q) || descLower.includes(q);
    return catOk && buscaOk;
  });

  if (lista.length === 0) {
    grid.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b;">Nenhum serviço encontrado.</div>';
    return;
  }

  grid.innerHTML = lista.map(function (s, i) {
    var delay = (i * 0.045).toFixed(3);
    var precoStr = s.preco === 0 ? '<span class="srv-card-price free">Grátis</span>'
      : '<span class="srv-card-price">R$ ' + s.preco.toFixed(2).replace('.', ',') + '</span>';

    var badgeHtml = '';
    if (s.emBreve)            badgeHtml = '<span class="srv-badge badge-breve">Em breve</span>';
    else if (s.badge === 'new')    badgeHtml = '<span class="srv-badge badge-new">Novo</span>';
    else if (s.badge === 'free')   badgeHtml = '<span class="srv-badge badge-free">Grátis</span>';
    else if (s.badge === 'online') badgeHtml = '<span class="srv-badge badge-online">Online</span>';
    else if (s.badge === 'ag')     badgeHtml = '<span class="srv-badge badge-ag">Agendado</span>';
    else if (s.badge === 'wpp')    badgeHtml = '<span class="srv-badge badge-wpp">WhatsApp</span>';

    var statesHtml = s.states ? '<div class="srv-card-states">' + s.states + '</div>' : '';

    if (s.emBreve) {
      return '<div class="srv-card srv-card--breve" data-id="' + s.id + '" style="animation-delay:' + delay + 's">' +
        getIconHtml(s.cat) +
        '<div class="srv-card-body">' +
          '<div class="srv-card-name">' + s.nome + ' ' + badgeHtml + '</div>' +
          '<div class="srv-card-sub">' + s.desc + '</div>' +
          statesHtml +
        '</div>' +
        '<div class="srv-card-right">' +
          precoStr +
          '<button class="btn-consultar btn-consultar--breve" disabled>Em breve</button>' +
        '</div>' +
      '</div>';
    }

    return '<div class="srv-card" data-id="' + s.id + '" style="animation-delay:' + delay + 's">' +
      getIconHtml(s.cat) +
      '<div class="srv-card-body">' +
        '<div class="srv-card-name">' + s.nome + ' ' + badgeHtml + '</div>' +
        '<div class="srv-card-sub">' + s.desc + '</div>' +
        statesHtml +
      '</div>' +
      '<div class="srv-card-right">' +
        precoStr +
        '<button class="btn-consultar" data-id="' + s.id + '">Consultar</button>' +
      '</div>' +
    '</div>';
  }).join('');

  grid.querySelectorAll('.btn-consultar:not(.btn-consultar--breve)').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-id');
      var srv = SERVICOS.find(function (s) { return s.id === id; });
      if (srv) abrirModal(srv);
    });
  });
}

/* ── Impedimentos por categoria ── */
var IMPEDIMENTOS = {
  crlv: ['Intenção / Comunicação de Venda','Veículo Baixado','UF atual do veículo diferente do estado selecionado','Restrições administrativas','Existência de multas ativas','Bloqueios diversos'],
  'crlv-ag': ['Intenção / Comunicação de Venda','Veículo Baixado','UF atual do veículo diferente do estado selecionado','Restrições administrativas','Existência de multas ativas','Bloqueios diversos'],
  atpv: ['Veículo com restrição judicial','Gravame financeiro ativo','Comunicação de venda registrada','Veículo Baixado ou sinistrado','Bloqueios administrativos']
};

/* ── Step inline ── */
function initModal() {
  document.getElementById('pedido-step-back').addEventListener('click', fecharStep);
  document.getElementById('pedido-btn-back2').addEventListener('click', fecharStep);
  document.getElementById('pedido-btn-solicitar').addEventListener('click', confirmarPedido);
}

function abrirModal(srv) {
  servicoSelecionado = srv;

  if (srv.tipo === 'contato') {
    var msg = encodeURIComponent('Olá! Tenho interesse no serviço: ' + srv.nome + '. Poderia me ajudar?');
    window.open('https://wa.me/' + WPP_NUMBER + '?text=' + msg, '_blank');
    return;
  }

  if (srv.tipo === 'com-venda') {
    abrirComunicadoVenda();
    return;
  }

  /* Impedimentos */
  var impCard = document.getElementById('imp-card');
  var impList = document.getElementById('imp-list');
  var imps = IMPEDIMENTOS[srv.cat];
  if (imps && imps.length) {
    impCard.style.display = '';
    impList.innerHTML = imps.map(function(i){ return '<li>' + i + '</li>'; }).join('');
  } else {
    impCard.style.display = 'none';
  }

  document.getElementById('step-icon').textContent = srv.icon || '🚗';
  document.getElementById('step-titulo').textContent = srv.nome;
  var preco = srv.preco === 0 ? 'Grátis' : 'R$ ' + srv.preco.toFixed(2).replace('.', ',');
  document.getElementById('step-preco').textContent = preco;

  var btnLabel = srv.cat === 'atpv' ? 'Solicitar ATPV-E'
    : (srv.cat === 'crlv' || srv.cat === 'crlv-ag') ? 'Solicitar CRLV-E'
    : 'Confirmar';
  document.getElementById('step-btn-label').textContent = btnLabel;

  var fields = document.getElementById('step-fields');

  if (srv.cat === 'crlv') {
    fields.innerHTML =
      stepInput('step-placa',   'Placa',                'ABC-1234 ou BRA2E19', 'text', 8, true) +
      stepInput('step-renavam', 'Renavam',               'Renavam',             'numeric', 11, false) +
      stepInput('step-cpf',     'Documento CPF ou CNPJ', 'CPF ou CNPJ',        'text', 18, false);
  } else if (srv.cat === 'crlv-ag') {
    fields.innerHTML =
      stepInput('step-placa',   'Placa',                'ABC-1234 ou BRA2E19', 'text', 8, true) +
      stepInput('step-renavam', 'Renavam',               'Renavam',             'numeric', 11, false) +
      stepInput('step-cpf',     'Documento CPF ou CNPJ', 'CPF ou CNPJ',        'text', 18, false);
  } else if (srv.cat === 'atpv') {
    fields.innerHTML =
      stepInput('step-placa',   'Placa',                'ABC-1234 ou BRA2E19', 'text', 8, true) +
      stepInput('step-renavam', 'Renavam',               'Renavam',             'numeric', 11, false) +
      stepInput('step-cpf',     'Documento CPF ou CNPJ', 'CPF ou CNPJ',        'text', 18, false);
  } else if (srv.cat === 'debitos' || srv.cat === 'boletos') {
    fields.innerHTML =
      stepInput('step-placa', 'Placa', 'ABC-1234', 'text', 8, true) +
      stepSelect('step-uf', 'Estado (UF)', gerarOptions());
  } else if (srv.cat === 'codigo-seg') {
    fields.innerHTML =
      stepInput('step-placa', 'Placa do Veículo', 'ABC-1234 ou BRA2E19', 'text', 8, true);
  } else {
    fields.innerHTML =
      stepInput('step-placa', 'Placa', 'ABC-1234', 'text', 8, true);
  }

  document.querySelector('.servicos-section').style.display = 'none';
  var step = document.getElementById('pedido-step');
  step.style.display = 'block';
  step.scrollIntoView({ behavior: 'smooth', block: 'start' });
  initEstadoPicker();
}

/* ── Seletor visual de estado CRLV-E ── */
function estadoPicker(ufPreSel) {
  var html = '<div class="step-field"><label>Selecione o Estado:</label>' +
    '<div class="estado-picker" id="estado-picker">';
  CRLV_ESTADOS.forEach(function(e) {
    var sel = e.uf === ufPreSel ? ' selected' : '';
    html += '<button type="button" class="estado-item' + sel + '" data-uf="' + e.uf + '" data-preco="' + e.preco + '">' +
      '<span class="estado-uf">' + e.uf + '</span>' +
      '<span class="estado-nome">' + e.nome + '</span>' +
      '<span class="estado-preco">R$ ' + e.preco.toFixed(2).replace('.', ',') + '</span>' +
    '</button>';
  });
  html += '</div><input type="hidden" id="step-estado" value="' + (ufPreSel || '') + '"></div>';
  return html;
}

function initEstadoPicker() {
  var picker = document.getElementById('estado-picker');
  if (!picker) return;
  picker.addEventListener('click', function(e) {
    var btn = e.target.closest('.estado-item');
    if (!btn) return;
    picker.querySelectorAll('.estado-item').forEach(function(b){ b.classList.remove('selected'); });
    btn.classList.add('selected');
    document.getElementById('step-estado').value = btn.dataset.uf;
    /* Atualiza o preço exibido no header */
    var novoPreco = parseFloat(btn.dataset.preco);
    servicoSelecionado = Object.assign({}, servicoSelecionado, { preco: novoPreco });
    var el = document.getElementById('step-preco');
    if (el) el.textContent = 'R$ ' + novoPreco.toFixed(2).replace('.', ',');
  });
}

function stepInput(id, label, ph, mode, max, upper) {
  return '<div class="step-field"><label for="' + id + '">' + label + '<span class="req">*</span></label>' +
    '<input type="text" id="' + id + '" placeholder="' + ph + '"' +
    (mode === 'numeric' ? ' inputmode="numeric"' : '') +
    (max ? ' maxlength="' + max + '"' : '') +
    (upper ? ' style="text-transform:uppercase"' : '') +
    '></div>';
}
function stepInputOpcional(id, label, ph, mode, max) {
  return '<div class="step-field"><label for="' + id + '">' + label + '</label>' +
    '<input type="text" id="' + id + '" placeholder="' + ph + '"' +
    (mode === 'numeric' ? ' inputmode="numeric"' : '') +
    (max ? ' maxlength="' + max + '"' : '') +
    '></div>';
}
function stepSelect(id, label, opts) {
  return '<div class="step-field"><label for="' + id + '">' + label + '<span class="req">*</span></label>' +
    '<select id="' + id + '">' + opts + '</select></div>';
}
function gerarOptionsEstado(states) {
  var ufs = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];
  return '<option value="">Selecione o Estado...</option>' + ufs.map(function(u){
    return '<option value="' + u + '">' + u + '</option>';
  }).join('');
}
function gerarOptions() {
  var ufs = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];
  return '<option value="">Selecione...</option>' + ufs.map(function(u){ return '<option value="' + u + '">' + u + '</option>'; }).join('');
}

function fecharStep() {
  document.getElementById('pedido-step').style.display = 'none';
  document.querySelector('.servicos-section').style.display = '';
  servicoSelecionado = null;
}

/* ── Validação visual de campo ── */
function erroStep(id, msg) {
  var el = document.getElementById(id);
  if (!el) return false;
  el.classList.add('campo-erro');
  el.addEventListener('input', function limpar() {
    el.classList.remove('campo-erro');
    el.removeEventListener('input', limpar);
    var erroBox = document.getElementById('step-form-erro');
    if (erroBox) erroBox.style.display = 'none';
  }, { once: true });
  var erroBox = document.getElementById('step-form-erro');
  if (erroBox) { erroBox.textContent = msg; erroBox.style.display = 'block'; }
  el.focus();
  return true;
}

async function confirmarPedido() {
  if (!servicoSelecionado) return;
  var srv = servicoSelecionado;

  /* Limpa erros anteriores */
  document.querySelectorAll('.campo-erro').forEach(function(el){ el.classList.remove('campo-erro'); });
  var erroBox = document.getElementById('step-form-erro');
  if (erroBox) erroBox.style.display = 'none';

  var placa   = ((document.getElementById('step-placa')   || {}).value || '').trim().toUpperCase();
  var renavam = ((document.getElementById('step-renavam') || {}).value || '').trim();
  var cpf     = ((document.getElementById('step-cpf')     || {}).value || '').trim();
  var uf      = ((document.getElementById('step-uf')      || {}).value || '').trim();
  var estado  = ((document.getElementById('step-estado')  || {}).value || '').trim();

  /* Validações com feedback visual */
  if (!placa && erroStep('step-placa', 'Informe a placa do veículo. Campo obrigatório.')) return;
  if ((srv.cat === 'crlv' || srv.cat === 'crlv-ag' || srv.cat === 'atpv') && !renavam && erroStep('step-renavam', 'Informe o RENAVAM do veículo. Campo obrigatório.')) return;
  if ((srv.cat === 'crlv' || srv.cat === 'crlv-ag' || srv.cat === 'atpv') && !cpf    && erroStep('step-cpf',     'Informe o CPF ou CNPJ do titular. Campo obrigatório.')) return;
  if ((srv.cat === 'debitos' || srv.cat === 'boletos') && !uf && erroStep('step-uf', 'Selecione o estado (UF). Campo obrigatório.')) return;

  var pedido = {
    id: Date.now(),
    servico: srv.nome,
    cat: srv.cat,
    placa: placa,
    renavam: renavam || undefined,
    cpf: cpf || undefined,
    uf: uf || estado || srv.states || undefined,
    preco: srv.preco,
    data: new Date().toLocaleDateString('pt-BR'),
    status: 'aguardando'
  };

  /* Serviços via WhatsApp: não geram checkout MP */
  if (srv.wpp) {
    var wppMsg = encodeURIComponent('Pedido: ' + srv.nome + ' | Placa: ' + placa);
    fecharStep();
    window.open('https://wa.me/' + WPP_NUMBER + '?text=' + wppMsg, '_blank');
    return;
  }

  var btn = document.getElementById('pedido-btn-solicitar');
  var btnTextoOriginal = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Aguarde...';

  try {
    var cliente = await getClienteAtual();
    if (!cliente) {
      mostrarToast('Sessão expirada. Faça login novamente.', 'erro');
      return;
    }

    /* 1. Salva o pedido no Supabase com status "aguardando_pagamento" */
    var salvamento = await salvarPedido(pedido, cliente.id);
    if (salvamento.error || !salvamento.data) {
      if (erroBox) { erroBox.textContent = 'Erro ao registrar pedido: ' + (salvamento.error ? salvamento.error.message : 'Tente novamente.'); erroBox.style.display = 'block'; }
      return;
    }
    var pedidoId = salvamento.data.id;

    /* 2. Pergunta como o cliente quer pagar (só exibe modal se houver preço) */
    var escolha = null;
    if (srv.preco > 0) {
      btn.disabled = false;
      btn.textContent = btnTextoOriginal;
      await carregarSaldo();
      escolha = await abrirModalPagamento(srv.nome, srv.preco);
      btn.disabled = true;
      btn.textContent = 'Aguarde...';

      if (!escolha) {
        /* Usuário fechou o modal — cancela pedido */
        await _supabase.from('pedidos').delete().eq('id', pedidoId);
        return;
      }
    }

    /* 3a. Pagar com saldo da plataforma */
    if (escolha === 'saldo') {
      await carregarSaldo();
      if (saldoAtual < srv.preco) {
        var erroModalEl = document.getElementById('pagto-modal-erro');
        if (erroModalEl) {
          erroModalEl.textContent = 'Saldo insuficiente (' + formatarReais(saldoAtual) + '). Recarregue ou pague via Mercado Pago.';
          erroModalEl.style.display = 'block';
        }
        fecharModalPagamento(null);
        await _supabase.from('pedidos').delete().eq('id', pedidoId);
        return;
      }

      /* Débita saldo */
      var saldoAntes  = saldoAtual;
      var saldoDepois = saldoAntes - srv.preco;

      await _supabase.from('clientes').update({ saldo: saldoDepois }).eq('id', cliente.id);
      await _supabase.from('transacoes_saldo').insert({
        cliente_id:      cliente.id,
        tipo:            'debito',
        valor:           srv.preco,
        descricao:       'Pagamento: ' + srv.nome,
        pedido_id:       pedidoId,
        saldo_anterior:  saldoAntes,
        saldo_posterior: saldoDepois,
      });

      /* Atualiza pedido para "aguardando" direto */
      await _supabase.from('pedidos').update({
        status:            'aguardando',
        mp_payment_status: 'saldo_plataforma',
      }).eq('id', pedidoId);

      atualizarSaldoBadges(saldoDepois);
      fecharStep();
      mostrarToast('Pedido pago com saldo! Aguarde o processamento.', 'sucesso');
      return;
    }

    /* 3b. Pagar via Mercado Pago */
    var resposta = await fetch(BACKEND_URL + '/api/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        servico:       srv.nome,
        preco:         srv.preco,
        placa:         placa,
        clienteId:     cliente.id,
        clienteEmail:  cliente.email  || '',
        clienteNome:   cliente.nomeCompleto || '',
        pedidoId:      pedidoId,
      }),
    });

    if (!resposta.ok) {
      var err = await resposta.json().catch(function() { return {}; });
      if (erroBox) { erroBox.textContent = err.erro || 'Erro ao iniciar pagamento. Tente novamente.'; erroBox.style.display = 'block'; }
      return;
    }

    var dados = await resposta.json();
    fecharStep();
    window.location.href = dados.sandbox_init_point || dados.init_point;

  } catch (e) {
    console.error('[confirmarPedido]', e);
    if (erroBox) { erroBox.textContent = 'Erro inesperado. Verifique sua conexão e tente novamente.'; erroBox.style.display = 'block'; }
  } finally {
    btn.disabled = false;
    btn.textContent = btnTextoOriginal;
  }
}

/* ── Delegação de clique para botão repagar ── */
document.addEventListener('click', function(e) {
  var btn = e.target.closest('[data-repagar-id]');
  if (btn) {
    e.preventDefault();
    e.stopPropagation();
    repagarPedido(btn.getAttribute('data-repagar-id'));
  }
});

/* ── Repagar pedido expirado/recusado ── */
async function repagarPedido(pedidoId) {
  try {
    var cliente = _clienteCache || await getClienteAtual();
    if (!cliente) { mostrarToast('Sessão expirada. Faça login novamente.', 'erro'); return; }

    var { data: pedido, error: errPedido } = await _supabase
      .from('pedidos')
      .select('*')
      .eq('id', pedidoId)
      .single();

    if (errPedido || !pedido) {
      mostrarToast('Pedido não encontrado.', 'erro');
      return;
    }

    var preco = parseFloat(pedido.preco || 0);
    if (preco <= 0) {
      mostrarToast('Este pedido não possui valor para pagamento.', 'erro');
      return;
    }

    await carregarSaldo();
    var escolha = await abrirModalPagamento(pedido.servico || 'Serviço', preco);
    if (!escolha) return;

    if (escolha === 'saldo') {
      await carregarSaldo();
      if (saldoAtual < preco) {
        mostrarToast('Saldo insuficiente (' + formatarReais(saldoAtual) + '). Recarregue ou pague via Mercado Pago.', 'erro');
        return;
      }

      var saldoAntes  = saldoAtual;
      var saldoDepois = saldoAntes - preco;

      await _supabase.from('clientes').update({ saldo: saldoDepois }).eq('id', cliente.id);
      await _supabase.from('transacoes_saldo').insert({
        cliente_id:      cliente.id,
        tipo:            'debito',
        valor:           preco,
        descricao:       'Pagamento: ' + (pedido.servico || 'Serviço'),
        pedido_id:       pedidoId,
        saldo_anterior:  saldoAntes,
        saldo_posterior: saldoDepois,
      });

      await _supabase.from('pedidos').update({
        status:            'aguardando',
        mp_payment_status: 'saldo_plataforma',
      }).eq('id', pedidoId);

      atualizarSaldoBadges(saldoDepois);
      mostrarToast('Pedido pago com saldo! Aguarde o processamento.', 'sucesso');
      renderPedidosUnificados();
      return;
    }

    var resposta = await fetch(BACKEND_URL + '/api/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        servico:       pedido.servico || 'Serviço',
        preco:         preco,
        placa:         pedido.placa || 'N/A',
        clienteId:     cliente.id,
        clienteEmail:  cliente.email  || '',
        clienteNome:   cliente.nomeCompleto || '',
        pedidoId:      pedidoId,
      }),
    });

    if (!resposta.ok) {
      var err = await resposta.json().catch(function() { return {}; });
      mostrarToast(err.erro || 'Erro ao gerar novo pagamento. Tente novamente.', 'erro');
      return;
    }

    var dados = await resposta.json();
    window.location.href = dados.sandbox_init_point || dados.init_point;

  } catch (e) {
    console.error('[repagarPedido]', e);
    mostrarToast('Erro inesperado. Verifique sua conexão e tente novamente.', 'erro');
  }
}

/* ── Toast de notificação ── */
function mostrarToast(msg, tipo) {
  var toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.cssText = [
    'position:fixed', 'bottom:28px', 'left:50%', 'transform:translateX(-50%)',
    'background:' + (tipo === 'sucesso' ? '#0d9488' : '#ef4444'),
    'color:#fff', 'padding:14px 24px', 'border-radius:12px',
    'font-size:.9rem', 'font-weight:500', 'z-index:9999',
    'box-shadow:0 8px 32px rgba(0,0,0,.18)', 'max-width:90vw',
    'text-align:center', 'transition:opacity .4s'
  ].join(';');
  document.body.appendChild(toast);
  setTimeout(function() { toast.style.opacity = '0'; setTimeout(function() { toast.remove(); }, 400); }, 4000);
}

/* ── FIPE: detecta se o iframe foi bloqueado ── */
function initFipe() {
  var iframe = document.getElementById('fipe-iframe');
  var blocked = document.getElementById('fipe-blocked');
  if (!iframe || !blocked) return;

  /* Tenta detectar bloqueio via onerror ou timeout */
  var timeout = setTimeout(function () {
    try {
      /* Se o contentDocument for acessível e vazio, provavelmente foi bloqueado */
      var doc = iframe.contentDocument || iframe.contentWindow.document;
      if (!doc || doc.body.innerHTML === '') {
        blocked.classList.add('visible');
      }
    } catch (e) {
      /* cross-origin = site carregou mas bloqueou embed — mostra fallback */
      blocked.classList.add('visible');
    }
  }, 4000);

  iframe.addEventListener('load', function () {
    clearTimeout(timeout);
    try {
      var doc = iframe.contentDocument || iframe.contentWindow.document;
      if (!doc || doc.body.innerHTML === '') blocked.classList.add('visible');
    } catch (e) {
      blocked.classList.add('visible');
    }
  });
}

/* ── Estado ativo dos filtros de pedidos ── */
var statusPedidoAtivo = 'todos';

/* ── Tabs de pedidos ── */
function initPedidosTabs() {
  /* Abas de categoria */
  var tabs = document.querySelectorAll('#ped-tabs .srv-tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      catPedidoAtiva = tab.getAttribute('data-pedcat');
      renderPedidosUnificados();
    });
  });

  /* Botões de status */
  var statusBtns = document.querySelectorAll('#ped-status-filtro .ped-status-btn');
  statusBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      statusBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      statusPedidoAtivo = btn.getAttribute('data-pedstatus');
      renderPedidosUnificados();
    });
  });
}

/* ── Render pedidos unificados com abas ── */
async function renderPedidosUnificados() {
  var el = document.getElementById('pedidos-unificados-lista');
  if (!el) return;
  el.innerHTML = '<div style="padding:32px;text-align:center;color:#94a3b8;font-size:13px;">Carregando pedidos...</div>';

  var cat    = catPedidoAtiva  || 'todos';
  var status = statusPedidoAtivo || 'todos';

  var todos = await getPedidosDoCliente();
  var lista = todos;

  /* Filtro por categoria — crlv inclui agendados */
  if (cat !== 'todos') {
    lista = lista.filter(function (p) {
      if (cat === 'crlv') return p.categoria === 'crlv' || p.categoria === 'crlv-ag';
      return p.categoria === cat;
    });
  }

  /* Filtro por status */
  if (status !== 'todos') {
    lista = lista.filter(function (p) { return (p.status || 'aguardando') === status; });
  }

  if (lista.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="es-icon">📂</div><div class="es-title">Nenhum pedido</div><div class="es-text">Você ainda não realizou pedidos nesta categoria.</div></div>';
    return;
  }

  var pag = aplicarPaginacao(lista, 'pedidos', 'renderPedidosUnificados()');
  var listaPag = pag.slice;

  el.innerHTML = listaPag.map(function (p) {
    var cat = p.categoria || 'despachante';
    var preco = (!p.preco || p.preco === 0) ? 'Grátis' : 'R$ ' + parseFloat(p.preco).toFixed(2).replace('.', ',');
    var ic = ICONES_CAT[cat] || ICONES_CAT['despachante'];
    var iconHtml = '<div style="width:40px;height:40px;border-radius:10px;background:' + ic.bg + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;color:' + ic.color + '">' + ic.svg + '</div>';
    var data = p.criado_em ? new Date(p.criado_em).toLocaleDateString('pt-BR') : '—';
    var statusLabel = { aguardando: 'Aguardando', aceito: 'Aceito', negado: 'Recusado', concluido: 'Concluído', aguardando_pagamento: 'Ag. Pagamento', pagamento_negado: 'Pagamento Recusado' }[p.status] || (p.status || 'aguardando');
    var statusCor = '#f97316';
    var arquivoHtml = p.arquivo_url
      ? '<a href="' + p.arquivo_url + '" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:5px;margin-top:6px;font-size:.78rem;color:#0d9488;font-weight:600;text-decoration:none;background:#f0fdfa;border:1px solid #99f6e4;border-radius:6px;padding:3px 10px">📄 Ver documento</a>'
      : '';
    var recusaHtml = '';
    if (p.status === 'negado') {
      var motivo = p.observacao_admin ? p.observacao_admin : 'Nenhum motivo informado pelo administrador.';
      recusaHtml = '<div style="margin-top:8px;padding:8px 12px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;font-size:.8rem;color:#991b1b;line-height:1.45">' +
        '<strong style="display:block;margin-bottom:2px">❌ Pedido recusado</strong>' +
        '<span style="color:#b91c1c">' + motivo + '</span>' +
      '</div>';
    } else if (p.status === 'pagamento_negado') {
      recusaHtml = '<div style="margin-top:8px;padding:8px 12px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;font-size:.8rem;color:#991b1b;line-height:1.45">' +
        '<strong style="display:block;margin-bottom:2px">💳 Pagamento recusado</strong>' +
        '<span style="color:#b91c1c">Seu pagamento não foi aprovado. Clique abaixo para tentar novamente.</span>' +
      '</div>';
    } else if (p.status === 'aguardando_pagamento') {
      recusaHtml = '<div style="margin-top:8px;padding:8px 12px;background:#fff7ed;border:1px solid #fdba74;border-radius:8px;font-size:.8rem;color:#c2410c;line-height:1.45">' +
        '<strong style="display:block;margin-bottom:2px">⏳ Aguardando confirmação do pagamento</strong>' +
        '<span style="color:#ea580c">Se o pagamento expirou, clique abaixo para gerar um novo.</span>' +
      '</div>';
    } else if (p.observacao_admin) {
      recusaHtml = '<div style="font-size:.78rem;color:#64748b;margin-top:4px">📝 ' + p.observacao_admin + '</div>';
    }
    var repagarBtn = (p.status === 'pagamento_negado' || p.status === 'aguardando_pagamento')
      ? '<div style="padding:0 20px 13px"><button data-repagar-id="' + p.id + '" style="width:100%;padding:10px 14px;background:#f97316;color:#fff;border:none;border-radius:8px;font-size:.85rem;font-weight:700;cursor:pointer;font-family:inherit;transition:background .15s;position:relative;z-index:2">' +
        (p.status === 'pagamento_negado' ? '🔄 Pagar novamente' : '🔄 Gerar novo pagamento') + '</button></div>'
      : '';
    return '<div style="border-bottom:1px solid var(--border)">' +
      '<div class="srv-card" style="border-bottom:none">' +
        iconHtml +
        '<div class="srv-card-body">' +
          '<div class="srv-card-name">' + (p.servico || '—') + '</div>' +
          '<div class="srv-card-sub">' + (p.placa ? 'Placa: ' + p.placa : '') + (p.uf ? ' &nbsp;·&nbsp; ' + p.uf : '') + ' &nbsp;·&nbsp; ' + data + '</div>' +
          arquivoHtml +
          recusaHtml +
        '</div>' +
        '<div class="srv-card-right">' +
          '<span class="srv-card-price">' + preco + '</span>' +
          '<span class="pedido-status-badge" style="background:' + statusCor + '20;color:' + statusCor + ';border:1px solid ' + statusCor + '40;border-radius:6px;padding:2px 10px;font-size:.75rem;font-weight:600">' + statusLabel + '</span>' +
        '</div>' +
      '</div>' +
      repagarBtn +
    '</div>';
  }).join('') + pag.paginacaoHtml;
}

/* ── Render pedidos filtrados por seção ── */
async function renderPedidosFiltrados(sec) {
  if (sec === 'pedidos') {
    renderPedidosUnificados();
    return;
  }

  if (sec !== 'historico') return;

  var el = document.getElementById('historico-lista');
  if (!el) return;
  el.innerHTML = '<div style="padding:32px;text-align:center;color:#94a3b8;font-size:13px;">Carregando histórico...</div>';

  var todos = await getPedidosDoCliente();
  var lista = todos.filter(function (p) { return p.status === 'concluido'; });

  if (lista.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="es-icon">✅</div><div class="es-title">Nenhum pedido concluído</div><div class="es-text">Seus pedidos finalizados aparecerão aqui.</div></div>';
    return;
  }

  var pag = aplicarPaginacao(lista, 'historico', 'renderPedidosFiltrados(\'historico\')');
  var listaPag = pag.slice;

  el.innerHTML = listaPag.map(function (p) {
    var preco = (!p.preco || p.preco === 0) ? 'Grátis' : 'R$ ' + parseFloat(p.preco).toFixed(2).replace('.', ',');
    var data = p.criado_em ? new Date(p.criado_em).toLocaleDateString('pt-BR') : '—';
    var statusLabel = { aguardando: 'Aguardando', aceito: 'Aceito', negado: 'Recusado', concluido: 'Concluído', aguardando_pagamento: 'Ag. Pagamento', pagamento_negado: 'Pagamento Recusado' }[p.status] || (p.status || 'Aguardando');
    var statusCor = '#f97316';
    var recusaInfo = (p.status === 'negado' && p.observacao_admin)
      ? '<div style="font-size:.75rem;color:#b91c1c;margin-top:3px">Motivo: ' + p.observacao_admin + '</div>'
      : '';
    var repagarBtn = (p.status === 'pagamento_negado' || p.status === 'aguardando_pagamento')
      ? '<button data-repagar-id="' + p.id + '" style="margin-top:4px;padding:5px 12px;background:#f97316;color:#fff;border:none;border-radius:6px;font-size:.72rem;font-weight:700;cursor:pointer;font-family:inherit">🔄 Pagar novamente</button>'
      : '';
    return '<div class="pedido-item">' +
      '<div class="pedido-status-dot" style="background:' + statusCor + '"></div>' +
      '<div class="pedido-item-body">' +
        '<div class="pedido-item-name">' + (p.servico || '—') + '</div>' +
        '<div class="pedido-item-meta">' + (p.placa ? 'Placa: ' + p.placa + ' &nbsp;·&nbsp; ' : '') + data + '</div>' +
        recusaInfo +
      '</div>' +
      '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">' +
        '<div class="pedido-item-price">' + preco + '</div>' +
        '<span style="background:' + statusCor + '20;color:' + statusCor + ';border:1px solid ' + statusCor + '40;border-radius:6px;padding:2px 8px;font-size:.72rem;font-weight:600;white-space:nowrap">' + statusLabel + '</span>' +
        repagarBtn +
      '</div>' +
    '</div>';
  }).join('') + pag.paginacaoHtml;
}

/* ── Tabela de valores ── */
function renderTabelaValores() {
  var el = document.getElementById('tabela-valores-content');
  if (!el) return;
  var srvMap = {};
  SERVICOS.forEach(function (s) { srvMap[s.id] = s; });

  el.innerHTML = TABELA_GRUPOS.map(function (g) {
    var rows = g.ids.map(function (id) {
      var s = srvMap[id];
      if (!s) return '';
      var preco = s.preco === 0 ? 'Grátis' : 'R$ ' + s.preco.toFixed(2).replace('.', ',');
      return '<div class="tabela-row"><span>' + s.nome + '</span><span class="tabela-row-price">' + preco + '</span></div>';
    }).join('');
    return '<div class="tabela-group-title">' + g.label + '</div>' + rows;
  }).join('');
}

/* ── WhatsApp suporte ── */
function configurarWpp() {
  var link = document.getElementById('link-suporte');
  if (link) link.href = 'https://wa.me/' + WPP_NUMBER + '?text=' + encodeURIComponent('Olá! Preciso de suporte na plataforma NC Gestão Veicular.');
}

/* ── Perfil — olhinho e troca de senha ── */
function initPerfil() {
  /* Olhinho genérico: troca type e alterna os SVGs olho-off / olho-on */
  function toggleOlho(input, btn) {
    var visivel = input.type === 'text';
    input.type = visivel ? 'password' : 'text';
    var off = btn.querySelector('.olho-off');
    var on  = btn.querySelector('.olho-on');
    if (off) off.style.display = visivel ? '' : 'none';
    if (on)  on.style.display  = visivel ? 'none' : '';
  }

  /* Olhinho do campo "Senha atual" (readonly) */
  var olhoAtual = document.getElementById('perfil-olho-atual');
  var inputAtual = document.getElementById('perfil-senha-atual');
  if (olhoAtual && inputAtual) {
    olhoAtual.addEventListener('click', function () { toggleOlho(inputAtual, olhoAtual); });
  }

  /* Olhinhos dos campos editáveis (nova senha / confirmar) */
  document.querySelectorAll('.perfil-olho[data-target]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var inp = document.getElementById(btn.getAttribute('data-target'));
      if (inp) toggleOlho(inp, btn);
    });
  });

  /* Botão salvar nova senha */
  var btnSalvar = document.getElementById('perfil-btn-salvar-senha');
  if (!btnSalvar) return;

  btnSalvar.addEventListener('click', async function () {
    var nova      = (document.getElementById('perfil-nova-senha').value || '').trim();
    var confirmar = (document.getElementById('perfil-confirmar-senha').value || '').trim();
    var msg       = document.getElementById('perfil-senha-msg');

    msg.style.display = 'none';
    msg.className = 'perfil-senha-msg';

    if (!nova || nova.length < 6) {
      exibirMsgSenha(msg, 'erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (nova !== confirmar) {
      exibirMsgSenha(msg, 'erro', 'As senhas não coincidem. Verifique e tente novamente.');
      return;
    }

    btnSalvar.disabled = true;
    btnSalvar.textContent = 'Salvando...';

    /* Atualiza no Supabase Auth */
    var resAuth = await _supabase.auth.updateUser({ password: nova });

    if (resAuth.error) {
      btnSalvar.disabled = false;
      btnSalvar.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Salvar nova senha';
      exibirMsgSenha(msg, 'erro', 'Erro ao salvar: ' + resAuth.error.message);
      return;
    }

    /* Atualiza na tabela clientes */
    var cliente = await getClienteAtual();
    if (cliente) {
      await _supabase.from('clientes').update({ senha: nova }).eq('id', cliente.id);
      /* Atualiza o campo exibido no perfil */
      var senhaEl = document.getElementById('perfil-senha-atual');
      if (senhaEl) { senhaEl.value = nova; senhaEl.type = 'password'; }
      var off = olhoAtual && olhoAtual.querySelector('.olho-off');
      var on  = olhoAtual && olhoAtual.querySelector('.olho-on');
      if (off) off.style.display = '';
      if (on)  on.style.display  = 'none';
    }

    document.getElementById('perfil-nova-senha').value = '';
    document.getElementById('perfil-confirmar-senha').value = '';
    btnSalvar.disabled = false;
    btnSalvar.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Salvar nova senha';
    exibirMsgSenha(msg, 'sucesso', 'Senha alterada com sucesso!');
  });
}

function exibirMsgSenha(el, tipo, texto) {
  el.textContent = texto;
  el.className = 'perfil-senha-msg ' + tipo;
  el.style.display = 'block';
}

/* ═══════════════════════════════════════════════
   SALDO E RECARGA
   ═══════════════════════════════════════════════ */

var saldoAtual = 0;
var recargaAtiva = null;
var saldoPollingTimer = null;

function formatarReais(v) {
  return 'R$ ' + parseFloat(v || 0).toFixed(2).replace('.', ',');
}

function atualizarSaldoBadges(valor) {
  saldoAtual = parseFloat(valor || 0);
  var fmt = formatarReais(saldoAtual);
  var badge = document.getElementById('sb-saldo-badge');
  if (badge) badge.textContent = fmt;
  var display = document.getElementById('saldo-valor-display');
  if (display) display.textContent = fmt;
  var pagtoDisp = document.getElementById('pagto-saldo-disp');
  if (pagtoDisp) pagtoDisp.textContent = fmt;
  var statSaldo = document.getElementById('stat-saldo');
  if (statSaldo) statSaldo.textContent = fmt;
}

async function carregarSaldo() {
  var cliente = await getClienteAtual();
  if (!cliente) return;
  var { data } = await _supabase
    .from('clientes')
    .select('saldo')
    .eq('id', cliente.id)
    .single();
  atualizarSaldoBadges(data?.saldo || 0);
}

async function carregarHistoricoTransacoes() {
  var cliente = await getClienteAtual();
  if (!cliente) return;
  var lista = document.getElementById('saldo-historico-lista');
  if (!lista) return;

  var { data } = await _supabase
    .from('transacoes_saldo')
    .select('*')
    .eq('cliente_id', cliente.id)
    .order('criado_em', { ascending: false })
    .limit(20);

  if (!data || data.length === 0) {
    lista.innerHTML = '<div class="saldo-historico-vazio">Nenhuma transação ainda.</div>';
    return;
  }

  lista.innerHTML = data.map(function(t) {
    var isCredito = t.tipo === 'credito';
    var sinal = isCredito ? '+' : '−';
    var cor   = isCredito ? '#16a34a' : '#ef4444';
    var desc  = t.descricao || (isCredito ? 'Recarga' : 'Pagamento de serviço');
    var data_ = t.criado_em ? new Date(t.criado_em).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
    return '<div class="saldo-transacao">' +
      '<div class="saldo-transacao-left">' +
        '<div class="saldo-transacao-desc">' + desc + '</div>' +
        '<div class="saldo-transacao-data">' + data_ + '</div>' +
      '</div>' +
      '<div class="saldo-transacao-valor" style="color:' + cor + '">' + sinal + ' ' + formatarReais(t.valor) + '</div>' +
    '</div>';
  }).join('');
}

function initSaldo() {
  carregarSaldo();

  var btnAbrir = document.getElementById('saldo-btn-abrir');
  if (btnAbrir) btnAbrir.addEventListener('click', function() {
    document.getElementById('saldo-recarga-box').style.display = 'block';
    document.getElementById('saldo-pix-box').style.display = 'none';
    document.getElementById('saldo-recarga-erro').style.display = 'none';
    document.getElementById('saldo-valor-input').value = '';
    document.querySelectorAll('.saldo-valor-btn').forEach(function(b) { b.classList.remove('active'); });
  });

  /* Valores rápidos */
  document.querySelectorAll('.saldo-valor-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.saldo-valor-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      document.getElementById('saldo-valor-input').value = btn.getAttribute('data-valor');
    });
  });

  var btnGerar = document.getElementById('saldo-btn-gerar-pix');
  if (btnGerar) btnGerar.addEventListener('click', gerarPixRecarga);

  var btnNova = document.getElementById('saldo-pix-nova-btn');
  if (btnNova) btnNova.addEventListener('click', function() {
    document.getElementById('saldo-pix-box').style.display = 'none';
    document.getElementById('saldo-recarga-box').style.display = 'block';
    document.getElementById('saldo-valor-input').value = '';
    document.querySelectorAll('.saldo-valor-btn').forEach(function(b) { b.classList.remove('active'); });
    if (saldoPollingTimer) { clearInterval(saldoPollingTimer); saldoPollingTimer = null; }
  });

  var btnCopiar = document.getElementById('saldo-pix-copia-btn');
  if (btnCopiar) btnCopiar.addEventListener('click', function() {
    var inp = document.getElementById('saldo-pix-copia');
    if (!inp || !inp.value) return;
    navigator.clipboard.writeText(inp.value).then(function() {
      btnCopiar.textContent = '✔ Copiado!';
      setTimeout(function() { btnCopiar.textContent = 'Copiar'; }, 2000);
    });
  });
}

async function gerarPixRecarga() {
  var erroEl = document.getElementById('saldo-recarga-erro');
  erroEl.style.display = 'none';

  var valorStr = document.getElementById('saldo-valor-input').value;
  var valor = parseFloat(valorStr);
  if (!valor || valor <= 0) {
    erroEl.textContent = 'Informe um valor válido para recarregar.';
    erroEl.style.display = 'block';
    return;
  }

  var btn = document.getElementById('saldo-btn-gerar-pix');
  var orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '⏳ Gerando PIX...';

  try {
    var cliente = await getClienteAtual();
    if (!cliente) { mostrarToast('Sessão expirada. Faça login novamente.', 'erro'); return; }

    /* Cria registro de recarga no Supabase */
    var { data: recarga, error: errRec } = await _supabase
      .from('recargas')
      .insert({ cliente_id: cliente.id, valor: valor, status: 'pendente' })
      .select('id')
      .single();

    if (errRec || !recarga) {
      erroEl.textContent = 'Erro ao registrar recarga. Tente novamente.';
      erroEl.style.display = 'block';
      return;
    }

    recargaAtiva = recarga.id;

    /* Solicita PIX ao backend */
    var resp = await fetch(BACKEND_URL + '/api/criar-pix-recarga', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valor:        valor,
        clienteId:    cliente.id,
        clienteEmail: cliente.email || '',
        clienteNome:  cliente.nomeCompleto || '',
        clienteCpf:   cliente.cpf || '',
        recargaId:    recarga.id,
      }),
    });

    if (!resp.ok) {
      var err = await resp.json().catch(function() { return {}; });
      var msgErro = err.erro || 'Erro ao gerar PIX. Tente novamente.';
      if (!cliente.cpf) msgErro = 'CPF não cadastrado. Acesse seu Perfil e adicione seu CPF antes de recarregar.';
      erroEl.textContent = msgErro;
      erroEl.style.display = 'block';
      return;
    }

    var pix = await resp.json();

    /* Salva payment_id na recarga */
    await _supabase.from('recargas').update({
      mp_payment_id: String(pix.paymentId),
      pix_copia_cola: pix.copiaECola,
      pix_expira_em: pix.expiracao,
    }).eq('id', recarga.id);

    /* Exibe QR Code */
    document.getElementById('saldo-recarga-box').style.display = 'none';
    document.getElementById('saldo-pix-box').style.display = 'block';
    document.getElementById('saldo-pix-valor-label').textContent = 'Valor: ' + formatarReais(valor);
    document.getElementById('saldo-pix-copia').value = pix.copiaECola || '';

    var qrImg = document.getElementById('saldo-pix-qr');
    if (pix.qrCode) {
      qrImg.src = 'data:image/png;base64,' + pix.qrCode;
      qrImg.style.display = 'block';
    } else {
      qrImg.style.display = 'none';
    }

    /* Polling: verifica se saldo foi creditado a cada 5s por até 10min */
    if (saldoPollingTimer) clearInterval(saldoPollingTimer);
    var tentativas = 0;
    saldoPollingTimer = setInterval(async function() {
      tentativas++;
      var { data: rec } = await _supabase
        .from('recargas')
        .select('status')
        .eq('id', recargaAtiva)
        .single();
      if (rec && rec.status === 'pago') {
        clearInterval(saldoPollingTimer);
        saldoPollingTimer = null;
        await carregarSaldo();
        await carregarHistoricoTransacoes();
        mostrarToast('Saldo de ' + formatarReais(valor) + ' creditado com sucesso!', 'sucesso');
        document.getElementById('saldo-pix-box').style.display = 'none';
        document.getElementById('saldo-recarga-box').style.display = 'none';
      }
      if (tentativas >= 120) { clearInterval(saldoPollingTimer); saldoPollingTimer = null; }
    }, 5000);

  } catch (e) {
    console.error('[gerarPixRecarga]', e);
    erroEl.textContent = 'Erro inesperado. Verifique sua conexão.';
    erroEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.innerHTML = orig;
  }
}

/* ═══════════════════════════════════════════════
   MODAL DE ESCOLHA DE PAGAMENTO
   ═══════════════════════════════════════════════ */

var pagtoResolve = null;

function initModalPagamento() {
  document.getElementById('pagto-modal-close').addEventListener('click', function() {
    fecharModalPagamento(null);
  });
  document.getElementById('pagto-modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) fecharModalPagamento(null);
  });
  document.getElementById('pagto-opcao-saldo').addEventListener('click', function() {
    fecharModalPagamento('saldo');
  });
  document.getElementById('pagto-opcao-mp').addEventListener('click', function() {
    fecharModalPagamento('mp');
  });
}

function abrirModalPagamento(nomeServico, valor) {
  document.getElementById('pagto-modal-servico').textContent = nomeServico;
  document.getElementById('pagto-modal-valor').textContent = formatarReais(valor);
  document.getElementById('pagto-modal-erro').style.display = 'none';
  document.getElementById('pagto-saldo-disp').textContent = formatarReais(saldoAtual);

  /* Destaca opção de saldo se suficiente */
  var opcaoSaldo = document.getElementById('pagto-opcao-saldo');
  if (saldoAtual >= valor) {
    opcaoSaldo.classList.remove('pagto-opcao--sem-saldo');
  } else {
    opcaoSaldo.classList.add('pagto-opcao--sem-saldo');
  }

  document.getElementById('pagto-modal-overlay').style.display = 'flex';

  return new Promise(function(resolve) { pagtoResolve = resolve; });
}

function fecharModalPagamento(escolha) {
  document.getElementById('pagto-modal-overlay').style.display = 'none';
  if (pagtoResolve) { pagtoResolve(escolha); pagtoResolve = null; }
}

/* ═══════════════════════════════════════════════
   COMUNICADO DE VENDA
   ═══════════════════════════════════════════════ */

function abrirComunicadoVenda() {
  document.querySelector('.servicos-section').style.display = 'none';
  var wrap = document.getElementById('cv-form-wrap');
  wrap.style.display = 'flex';
  wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function fecharComunicadoVenda() {
  document.getElementById('cv-form-wrap').style.display = 'none';
  document.querySelector('.servicos-section').style.display = '';
  servicoSelecionado = null;
}

function limparComunicado() {
  var ids = [
    'cv-vend-cpf','cv-vend-nome','cv-data-venda','cv-valor-venda',
    'cv-comp-cpf','cv-comp-nome','cv-cep','cv-logradouro','cv-numero',
    'cv-bairro','cv-complemento','cv-cidade-comp','cv-cidade-auto','cv-uf',
    'cv-placa','cv-renavam','cv-ano-fab','cv-ano-mod',
    'cv-crv-num','cv-crv-seg','cv-crv-via','cv-crv-data'
  ];
  ids.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = id === 'cv-crv-via' ? '1' : '';
  });
  ['cv-vend-tipo','cv-comp-sol','cv-comp-tipo'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.selectedIndex = 0;
  });
  var ufEl = document.getElementById('cv-crv-uf');
  if (ufEl) ufEl.value = 'SP';
  var erroEl = document.getElementById('cv-erro');
  if (erroEl) erroEl.style.display = 'none';
  document.querySelectorAll('#cv-form-wrap .campo-erro').forEach(function(el) {
    el.classList.remove('campo-erro');
  });
}

function initComunicado() {
  var back = document.getElementById('cv-back-btn');
  if (back) back.addEventListener('click', fecharComunicadoVenda);

  var limpar = document.getElementById('cv-btn-limpar');
  if (limpar) limpar.addEventListener('click', limparComunicado);

  var enviar = document.getElementById('cv-btn-enviar');
  if (enviar) enviar.addEventListener('click', enviarComunicado);

  /* Accordion */
  document.querySelectorAll('.cv-sec-toggle').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var sec = btn.getAttribute('data-sec');
      var body = document.getElementById('cv-sec-body-' + sec);
      if (!body) return;
      var collapsed = body.classList.toggle('collapsed');
      btn.textContent = collapsed ? '+' : '−';
    });
  });
  document.querySelectorAll('.cv-sec-header').forEach(function(hdr) {
    hdr.addEventListener('click', function(e) {
      if (e.target.classList.contains('cv-sec-toggle')) return;
      var sec = hdr.getAttribute('data-sec');
      var body = document.getElementById('cv-sec-body-' + sec);
      var btn  = hdr.querySelector('.cv-sec-toggle');
      if (!body) return;
      var collapsed = body.classList.toggle('collapsed');
      if (btn) btn.textContent = collapsed ? '+' : '−';
    });
  });

  /* Botões de copiar */
  document.querySelectorAll('.cv-copy-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var targetId = btn.getAttribute('data-target');
      var el = document.getElementById(targetId);
      if (!el || !el.value) return;
      navigator.clipboard.writeText(el.value).then(function() {
        btn.classList.add('copiado');
        var original = btn.innerHTML;
        btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>';
        setTimeout(function() {
          btn.classList.remove('copiado');
          btn.innerHTML = original;
        }, 1500);
      });
    });
  });

  /* CEP auto-fill */
  var cepEl = document.getElementById('cv-cep');
  if (cepEl) {
    cepEl.addEventListener('input', function() {
      var cep = cepEl.value.replace(/\D/g, '');
      if (cep.length === 8) buscarCep(cep);
    });
  }

  /* Máscaras */
  aplicarMascaraCv('cv-vend-cpf', mascaraCpfCnpj);
  aplicarMascaraCv('cv-comp-cpf', mascaraCpfCnpj);
  aplicarMascaraCv('cv-data-venda', mascaraData);
  aplicarMascaraCv('cv-crv-data', mascaraData);
  aplicarMascaraCv('cv-cep', mascaraCep);
}

function aplicarMascaraCv(id, fn) {
  var el = document.getElementById(id);
  if (el) el.addEventListener('input', function() { el.value = fn(el.value); });
}
function mascaraCpfCnpj(v) {
  v = v.replace(/\D/g, '');
  if (v.length <= 11) {
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    v = v.replace(/^(\d{2})(\d)/, '$1.$2');
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
    v = v.replace(/(\d{4})(\d)/, '$1-$2');
  }
  return v;
}
function mascaraData(v) {
  v = v.replace(/\D/g, '');
  v = v.replace(/(\d{2})(\d)/, '$1/$2');
  v = v.replace(/(\d{2})(\d)/, '$1/$2');
  return v.substring(0, 10);
}
function mascaraCep(v) {
  v = v.replace(/\D/g, '');
  v = v.replace(/(\d{5})(\d)/, '$1-$2');
  return v.substring(0, 9);
}

async function buscarCep(cep) {
  try {
    var r = await fetch('https://viacep.com.br/ws/' + cep + '/json/');
    var d = await r.json();
    if (d.erro) return;
    var set = function(id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; };
    set('cv-logradouro', d.logradouro);
    set('cv-bairro', d.bairro);
    set('cv-cidade-auto', d.localidade);
    set('cv-uf', d.uf);
    set('cv-cidade-comp', d.localidade);
  } catch (e) { /* falha silenciosa */ }
}

function cvVal(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function cvErroCampo(id, msg) {
  var el = document.getElementById(id);
  if (el) el.classList.add('campo-erro');
  var erroEl = document.getElementById('cv-erro');
  if (erroEl) { erroEl.textContent = msg; erroEl.style.display = 'block'; }
  if (el) el.focus();
  return true;
}

async function enviarComunicado() {
  /* Limpa erros anteriores */
  document.querySelectorAll('#cv-form-wrap .campo-erro').forEach(function(el) { el.classList.remove('campo-erro'); });
  var erroEl = document.getElementById('cv-erro');
  if (erroEl) erroEl.style.display = 'none';

  /* Validações obrigatórias */
  if (!cvVal('cv-vend-cpf'))   { cvErroCampo('cv-vend-cpf',  'CPF do vendedor é obrigatório.'); return; }
  if (!cvVal('cv-vend-nome'))  { cvErroCampo('cv-vend-nome', 'Nome do vendedor é obrigatório.'); return; }
  if (!cvVal('cv-data-venda')) { cvErroCampo('cv-data-venda','Data da venda é obrigatória.'); return; }
  if (!cvVal('cv-valor-venda')){ cvErroCampo('cv-valor-venda','Valor da venda é obrigatório.'); return; }
  if (!cvVal('cv-comp-cpf'))   { cvErroCampo('cv-comp-cpf',  'CPF do comprador é obrigatório.'); return; }
  if (!cvVal('cv-comp-nome'))  { cvErroCampo('cv-comp-nome', 'Nome do comprador é obrigatório.'); return; }
  if (!cvVal('cv-cep'))        { cvErroCampo('cv-cep',       'CEP é obrigatório.'); return; }
  if (!cvVal('cv-numero'))     { cvErroCampo('cv-numero',    'Número do endereço é obrigatório.'); return; }
  if (!cvVal('cv-placa'))      { cvErroCampo('cv-placa',     'Placa do veículo é obrigatória.'); return; }
  if (!cvVal('cv-renavam'))    { cvErroCampo('cv-renavam',   'RENAVAM é obrigatório.'); return; }
  if (!cvVal('cv-ano-fab'))    { cvErroCampo('cv-ano-fab',   'Ano de fabricação é obrigatório.'); return; }
  if (!cvVal('cv-ano-mod'))    { cvErroCampo('cv-ano-mod',   'Ano do modelo é obrigatório.'); return; }
  if (!cvVal('cv-crv-num'))    { cvErroCampo('cv-crv-num',   'Número do CRV é obrigatório.'); return; }
  if (!cvVal('cv-crv-seg'))    { cvErroCampo('cv-crv-seg',   'Código de segurança do CRV é obrigatório.'); return; }
  if (!cvVal('cv-crv-data'))   { cvErroCampo('cv-crv-data',  'Data de emissão do CRV é obrigatória.'); return; }
  if (!cvVal('cv-crv-uf'))     { cvErroCampo('cv-crv-uf',    'UF de emissão do CRV é obrigatória.'); return; }

  var btn = document.getElementById('cv-btn-enviar');
  var original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '⏳ Aguarde...';

  try {
    var cliente = await getClienteAtual();
    if (!cliente) { mostrarToast('Sessão expirada. Faça login novamente.', 'erro'); return; }

    /* 1. Salva pedido principal */
    var pedidoPayload = {
      cliente_id: cliente.id,
      servico: 'Comunicado de Venda',
      categoria: 'com-venda',
      placa: cvVal('cv-placa').toUpperCase(),
      renavam: cvVal('cv-renavam'),
      cpf_cnpj: cvVal('cv-vend-cpf'),
      uf: cvVal('cv-crv-uf'),
      preco: 80.00,
      status: 'aguardando_pagamento',
      criado_em: new Date().toISOString(),
    };
    var { data: pedidoData, error: pedidoErr } = await _supabase
      .from('pedidos').insert(pedidoPayload).select('id').single();
    if (pedidoErr || !pedidoData) {
      if (erroEl) { erroEl.textContent = 'Erro ao registrar pedido. Tente novamente.'; erroEl.style.display = 'block'; }
      return;
    }
    var pedidoId = pedidoData.id;

    /* 2. Salva dados completos do comunicado */
    await _supabase.from('comunicado_vendas').insert({
      pedido_id: pedidoId,
      cliente_id: cliente.id,
      vendedor_cpf: cvVal('cv-vend-cpf'),
      vendedor_tipo_pessoa: cvVal('cv-vend-tipo'),
      vendedor_nome: cvVal('cv-vend-nome'),
      data_venda: cvVal('cv-data-venda'),
      valor_venda: cvVal('cv-valor-venda'),
      comprador_solicitante: cvVal('cv-comp-sol'),
      comprador_tipo_pessoa: cvVal('cv-comp-tipo'),
      comprador_cpf: cvVal('cv-comp-cpf'),
      comprador_nome: cvVal('cv-comp-nome'),
      cep: cvVal('cv-cep'),
      logradouro: cvVal('cv-logradouro'),
      numero: cvVal('cv-numero'),
      bairro: cvVal('cv-bairro'),
      complemento: cvVal('cv-complemento'),
      cidade_comprador: cvVal('cv-cidade-comp'),
      cidade_auto: cvVal('cv-cidade-auto'),
      uf_comprador: cvVal('cv-uf'),
      veiculo_placa: cvVal('cv-placa').toUpperCase(),
      veiculo_renavam: cvVal('cv-renavam'),
      ano_fabricacao: cvVal('cv-ano-fab'),
      ano_modelo: cvVal('cv-ano-mod'),
      crv_numero: cvVal('cv-crv-num'),
      crv_codigo_seg: cvVal('cv-crv-seg'),
      crv_numero_via: cvVal('cv-crv-via') || '1',
      crv_data_emissao: cvVal('cv-crv-data'),
      crv_uf_emissao: cvVal('cv-crv-uf'),
    });

    /* 3. Cria preferência MP e redireciona */
    var resposta = await fetch(BACKEND_URL + '/api/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        servico: 'Comunicado de Venda',
        preco: 80.00,
        placa: cvVal('cv-placa').toUpperCase(),
        clienteId: cliente.id,
        clienteEmail: cliente.email || '',
        clienteNome: cliente.nomeCompleto || '',
        pedidoId: pedidoId,
      }),
    });

    if (!resposta.ok) {
      var err = await resposta.json().catch(function() { return {}; });
      if (erroEl) { erroEl.textContent = err.erro || 'Erro ao iniciar pagamento.'; erroEl.style.display = 'block'; }
      return;
    }

    var dados = await resposta.json();
    fecharComunicadoVenda();
    window.location.href = dados.sandbox_init_point || dados.init_point;

  } catch (e) {
    console.error('[enviarComunicado]', e);
    if (erroEl) { erroEl.textContent = 'Erro inesperado. Verifique sua conexão.'; erroEl.style.display = 'block'; }
  } finally {
    btn.disabled = false;
    btn.innerHTML = original;
  }
}

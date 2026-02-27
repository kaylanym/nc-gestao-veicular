/* ═══════════════════════════════════════════════
   NC Gestão Veicular — Dashboard JS
   ═══════════════════════════════════════════════ */

var WPP_NUMBER = '5511999999999'; // Substitua pelo número real

/* URL do seu backend Node.js — altere conforme o ambiente */
var BACKEND_URL = 'https://ncgestaoveicular.app.br';

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

  /* Despachante */
  { id: 'desp-transferencia', cat: 'despachante', nome: 'Transferência Veicular',
    desc: 'Serviço completo de transferência via despachante credenciado.',
    states: 'Todo o Brasil', preco: 0, icon: '👤', tipo: 'contato', badge: 'wpp' },
];

/* ── Tabela de valores agrupada ── */
var TABELA_GRUPOS = [
  { label: 'CRLV-E Imediato',  ids: ['crlv-ac','crlv-ap','crlv-ba','crlv-go','crlv-ma','crlv-mg','crlv-pi','crlv-pr','crlv-rr','crlv-se','crlv-sp','crlv-to'] },
  { label: 'CRLV-E Agendado',  ids: ['crlv-ag-rj1','crlv-ag-rj2','crlv-ag-al','crlv-ag-am','crlv-ag-ce','crlv-ag-df','crlv-ag-es','crlv-ag-mt','crlv-ag-pb','crlv-ag-rn','crlv-ag-rs','crlv-ag-ro','crlv-ag-sc'] },
  { label: 'ATPV-E',           ids: ['atpv-es','atpv-mg','atpv-ba','atpv-sc','atpv-al','atpv-rj','atpv-rs','atpv-pr','atpv-ce'] },
  { label: 'Débitos',          ids: ['painel-debitos-consulta','painel-debitos-pagamento'] },
  { label: 'Boletos',          ids: ['boleto-multa','boleto-ipva','boleto-licenciamento'] },
  { label: 'Código de Segurança', ids: ['codigo-seg-crlv','codigo-seg-atpv'] },
  { label: 'Despachante',      ids: ['desp-transferencia'] },
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
  configurarWpp();
  initPerfil();
});

/* ── Usuário ── */
async function carregarUsuario() {
  var c = await getClienteAtual();
  if (!c) { window.location.href = 'index.html'; return; }
  var nome = c.nomeCompleto || 'Cliente';
  document.getElementById('header-nome').textContent = nome;
  document.getElementById('perfil-nome').textContent = nome;
  document.getElementById('perfil-email').textContent = c.email || '—';
  document.getElementById('perfil-tel').textContent = c.telefone || '—';
  document.getElementById('perfil-end').textContent = c.endereco || '—';
  var senhaEl = document.getElementById('perfil-senha-atual');
  if (senhaEl) senhaEl.value = c.senha || '';
  atualizarStats();
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
  var negados = pedidos.filter(function (p) { return p.status === 'negado'; });
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
        else if (sec !== 'novo-pedido') renderPedidosFiltrados(sec);
      }
      if (window.innerWidth < 769) fecharSidebar();
    });
  });
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
  'crlv':       { bg: '#eff6ff', color: '#1d4ed8', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></svg>' },
  'crlv-ag':    { bg: '#f5f3ff', color: '#7c3aed', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/></svg>' },
  'atpv':       { bg: '#fdf4ff', color: '#9333ea', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' },
  'debitos':    { bg: '#fff7ed', color: '#ea580c', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>' },
  'boletos':    { bg: '#f0fdf4', color: '#16a34a', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>' },
  'codigo-seg': { bg: '#fef9ec', color: '#d97706', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' },
  'despachante':{ bg: '#f8fafc', color: '#475569', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
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
    var catOk = cat === 'todos' || s.cat === cat;
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
      estadoPicker(srv.uf || '') +
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
  if (srv.cat === 'crlv' && !estado) {
    var picker = document.getElementById('estado-picker');
    if (picker) picker.classList.add('campo-erro');
    if (erroBox) { erroBox.textContent = 'Selecione o estado do veículo.'; erroBox.style.display = 'block'; }
    return;
  }
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
    uf: uf || estado || undefined,
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
    pedido.status = 'aguardando_pagamento';
    var salvamento = await salvarPedido(pedido, cliente.id);
    if (salvamento.error) {
      if (erroBox) { erroBox.textContent = 'Erro ao registrar pedido: ' + salvamento.error.message; erroBox.style.display = 'block'; }
      return;
    }

    /* 2. Solicita preferência de pagamento ao backend */
    var resposta = await fetch(BACKEND_URL + '/api/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        servico:       srv.nome,
        preco:         srv.preco,
        placa:         placa,
        clienteId:     cliente.id,
        clienteEmail:  cliente.email  || '',
        clienteNome:   cliente.nome   || '',
      }),
    });

    if (!resposta.ok) {
      var err = await resposta.json().catch(function() { return {}; });
      if (erroBox) { erroBox.textContent = err.erro || 'Erro ao iniciar pagamento. Tente novamente.'; erroBox.style.display = 'block'; }
      return;
    }

    var dados = await resposta.json();

    /* 3. Redireciona para o Checkout Pro */
    fecharStep();
    window.location.href = dados.init_point;

  } catch (e) {
    console.error('[confirmarPedido]', e);
    if (erroBox) { erroBox.textContent = 'Erro inesperado. Verifique sua conexão e tente novamente.'; erroBox.style.display = 'block'; }
  } finally {
    btn.disabled = false;
    btn.textContent = btnTextoOriginal;
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

  /* Filtro por categoria */
  if (cat !== 'todos') {
    lista = lista.filter(function (p) { return p.categoria === cat; });
  }

  /* Filtro por status */
  if (status !== 'todos') {
    lista = lista.filter(function (p) { return (p.status || 'aguardando') === status; });
  }

  if (lista.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="es-icon">📂</div><div class="es-title">Nenhum pedido</div><div class="es-text">Você ainda não realizou pedidos nesta categoria.</div></div>';
    return;
  }

  el.innerHTML = lista.map(function (p) {
    var cat = p.categoria || 'despachante';
    var preco = (!p.preco || p.preco === 0) ? 'Grátis' : 'R$ ' + parseFloat(p.preco).toFixed(2).replace('.', ',');
    var ic = ICONES_CAT[cat] || ICONES_CAT['despachante'];
    var iconHtml = '<div style="width:40px;height:40px;border-radius:10px;background:' + ic.bg + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;color:' + ic.color + '">' + ic.svg + '</div>';
    var data = p.criado_em ? new Date(p.criado_em).toLocaleDateString('pt-BR') : '—';
    var statusLabel = { aguardando: 'Aguardando', aceito: 'Aceito', negado: 'Recusado', concluido: 'Concluído' }[p.status] || (p.status || 'aguardando');
    var statusCor = { aguardando: '#f59e0b', aceito: '#3b82f6', negado: '#ef4444', concluido: '#10b981' }[p.status] || '#f59e0b';
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
    } else if (p.observacao_admin) {
      recusaHtml = '<div style="font-size:.78rem;color:#64748b;margin-top:4px">📝 ' + p.observacao_admin + '</div>';
    }
    return '<div class="srv-card">' +
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
    '</div>';
  }).join('');
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

  var lista = await getPedidosDoCliente();

  if (lista.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="es-icon">📂</div><div class="es-title">Nenhum pedido</div><div class="es-text">Você ainda não realizou pedidos nesta categoria.</div></div>';
    return;
  }

  el.innerHTML = lista.map(function (p) {
    var preco = (!p.preco || p.preco === 0) ? 'Grátis' : 'R$ ' + parseFloat(p.preco).toFixed(2).replace('.', ',');
    var data = p.criado_em ? new Date(p.criado_em).toLocaleDateString('pt-BR') : '—';
    var statusLabel = { aguardando: 'Aguardando', aceito: 'Aceito', negado: 'Recusado', concluido: 'Concluído' }[p.status] || (p.status || 'Aguardando');
    var statusCor = { aguardando: '#f59e0b', aceito: '#3b82f6', negado: '#ef4444', concluido: '#10b981' }[p.status] || '#f59e0b';
    var recusaInfo = (p.status === 'negado' && p.observacao_admin)
      ? '<div style="font-size:.75rem;color:#b91c1c;margin-top:3px">Motivo: ' + p.observacao_admin + '</div>'
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
      '</div>' +
    '</div>';
  }).join('');
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

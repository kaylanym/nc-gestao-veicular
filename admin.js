/* ═══════════════════════════════════════════════
   NC Gestão Veicular — Admin JS
   ═══════════════════════════════════════════════ */

var pedidoAtual = null;
var todosClientes = [];

/* ── Paginação ── */
var _pagAdm = { pendentes: 1, todos: 1 };
var POR_PAG_ADM = 10;

function aplicarPaginacaoAdm(lista, secao, renderFn) {
  var total = lista.length;
  var totalPags = Math.ceil(total / POR_PAG_ADM) || 1;
  _pagAdm[secao] = Math.min(_pagAdm[secao] || 1, totalPags);
  var pag = _pagAdm[secao];
  var inicio = (pag - 1) * POR_PAG_ADM;
  var slice = lista.slice(inicio, inicio + POR_PAG_ADM);

  var btns = '';
  btns += '<button class="pag-btn"' + (pag === 1 ? ' disabled' : '') + ' onclick="_pagAdm[\'' + secao + '\']=' + (pag - 1) + ';' + renderFn + '">‹</button>';
  for (var i = 1; i <= totalPags; i++) {
    if (totalPags > 7 && i > 2 && i < totalPags - 1 && Math.abs(i - pag) > 1) {
      if (i === 3 || i === totalPags - 2) btns += '<span class="pag-info">…</span>';
      continue;
    }
    btns += '<button class="pag-btn' + (i === pag ? ' ativo' : '') + '" onclick="_pagAdm[\'' + secao + '\']=' + i + ';' + renderFn + '">' + i + '</button>';
  }
  btns += '<button class="pag-btn"' + (pag === totalPags ? ' disabled' : '') + ' onclick="_pagAdm[\'' + secao + '\']=' + (pag + 1) + ';' + renderFn + '">›</button>';

  var paginacaoHtml = total > POR_PAG_ADM
    ? '<div class="paginacao">' + btns + '<span class="pag-info">Página ' + pag + ' de ' + totalPags + '</span></div>'
    : '';

  return { slice: slice, paginacaoHtml: paginacaoHtml };
}

var CAT_CORES = {
  'crlv':       { bg: '#fff7ed', color: '#c2410c' },
  'crlv-ag':    { bg: '#fff7ed', color: '#ea580c' },
  'atpv':       { bg: '#fff7ed', color: '#c2410c' },
  'debitos':    { bg: '#fff7ed', color: '#ea580c' },
  'boletos':    { bg: '#fff7ed', color: '#ea580c' },
  'codigo-seg': { bg: '#fff7ed', color: '#c2410c' },
  'com-venda':  { bg: '#fff7ed', color: '#c2410c' },
};

/* ─── Init ─── */
document.addEventListener('DOMContentLoaded', async function () {
  var cliente = await getClienteAtual();
  if (!cliente || !cliente.isAdmin) {
    window.location.href = 'dashboard.html';
    return;
  }
  document.getElementById('adm-header-user').textContent = cliente.nomeCompleto || 'Admin';

  initNav();
  initToggle();
  initModal();
  initCatTabs();
  await carregarClientes();
  await renderSecao('pedidos-pendentes');
});

/* ─── Protege acesso admin ─── */
function protegerAdmin() {
  _supabase.auth.getSession().then(function (res) {
    if (!res.data || !res.data.session) window.location.href = 'index.html';
  });
}

/* ─── Navegação sidebar ─── */
function initNav() {
  document.querySelectorAll('.adm-link[data-sec]').forEach(function (link) {
    link.addEventListener('click', async function () {
      document.querySelectorAll('.adm-link').forEach(function (l) { l.classList.remove('active'); });
      link.classList.add('active');
      var sec = link.getAttribute('data-sec');
      document.querySelectorAll('.adm-section').forEach(function (s) { s.classList.remove('active'); });
      var el = document.getElementById('sec-' + sec);
      if (el) el.classList.add('active');
      if (window.innerWidth < 769) document.getElementById('adm-sidebar').classList.remove('open');
      await renderSecao(sec);
    });
  });
}

function initToggle() {
  var btn = document.getElementById('adm-toggle');
  if (btn) btn.addEventListener('click', function () {
    document.getElementById('adm-sidebar').classList.toggle('open');
  });
}

/* ─── Roteador de seções ─── */
async function renderSecao(sec) {
  if (sec === 'pedidos-pendentes') await renderPedidos('aguardando', 'lista-pendentes');
  else if (sec === 'todos-pedidos') await renderTodosPedidos();
  else if (sec === 'historico-admin') await renderPedidosHistorico();
  else if (sec === 'clientes-admin') await renderClientes();
  else if (sec === 'novo-pedido-admin') await initNovoPedido();
  else if (sec === 'kanban') { initKanbanFiltro(); await renderKanban(); }
}

/* ─── Abas de categoria ─── */
function initCatTabs() {
  /* Pendentes */
  var tabsPend = document.querySelectorAll('#tabs-pendentes .adm-cat-tab');
  tabsPend.forEach(function(tab) {
    tab.addEventListener('click', async function() {
      tabsPend.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var cat = tab.getAttribute('data-cat');
      await renderPedidosFiltradosCat('aguardando', 'lista-pendentes', cat);
    });
  });

  /* Todos — abas de categoria */
  var tabsTodos = document.querySelectorAll('#tabs-todos .adm-cat-tab');
  tabsTodos.forEach(function(tab) {
    tab.addEventListener('click', async function() {
      tabsTodos.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      await aplicarFiltrosTodos();
    });
  });
}

/* ─── Busca todos os pedidos com dados do cliente ─── */
async function getTodosPedidos(filtroStatus, filtroCategoria) {
  var query = _supabase
    .from('pedidos')
    .select('*, clientes(id, nome_completo, email)')
    .order('criado_em', { ascending: false });
  if (filtroStatus) query = query.eq('status', filtroStatus);
  if (filtroCategoria) {
    if (filtroCategoria === 'crlv') {
      query = query.in('categoria', ['crlv', 'crlv-ag']);
    } else {
      query = query.eq('categoria', filtroCategoria);
    }
  }
  var res = await query;
  return res.data || [];
}

/* ─── Render pedidos pendentes ─── */
async function renderPedidos(status, elId) {
  var el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = '<div class="adm-empty"><div class="adm-empty-ico">⏳</div><div class="adm-empty-text">Carregando...</div></div>';

  var lista = await getTodosPedidos(status);

  var badge = document.getElementById('badge-pendentes');
  if (badge && status === 'aguardando') {
    badge.textContent = lista.length;
    badge.setAttribute('data-count', lista.length);
  }

  if (lista.length === 0) {
    el.innerHTML = '<div class="adm-empty"><div class="adm-empty-ico">📂</div><div class="adm-empty-title">Nenhum pedido ' + (status === 'aguardando' ? 'pendente' : '') + '</div><div class="adm-empty-text">Tudo em dia por aqui.</div></div>';
    return;
  }

  el.innerHTML = lista.map(function (p) { return renderCardPedido(p); }).join('');
  bindBotoesDetalhe(el);
}

/* ─── Render pedidos com filtro de categoria ─── */
async function renderPedidosFiltradosCat(status, elId, categoria) {
  var el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = '<div class="adm-empty"><div class="adm-empty-text">Carregando...</div></div>';
  var lista = await getTodosPedidos(status || null, categoria || null);
  if (lista.length === 0) {
    el.innerHTML = '<div class="adm-empty"><div class="adm-empty-ico">📂</div><div class="adm-empty-title">Nenhum pedido encontrado</div></div>';
    return;
  }
  var pag = aplicarPaginacaoAdm(lista, 'pendentes', 'renderPedidosFiltradosCat(\'' + (status||'') + '\',\'' + elId + '\',\'' + (categoria||'') + '\')');
  el.innerHTML = pag.slice.map(function(p) { return renderCardPedido(p); }).join('') + pag.paginacaoHtml;
  bindBotoesDetalhe(el);
}

/* ─── Filtro unificado "Todos os Pedidos" ─── */
async function aplicarFiltrosTodos(resetPag) {
  if (resetPag !== false) _pagAdm.todos = 1;
  var status  = (document.getElementById('filtro-status') || {}).value || null;
  var cat     = ((document.querySelector('#tabs-todos .adm-cat-tab.active') || {}).getAttribute('data-cat')) || null;
  var q       = ((document.getElementById('filtro-busca') || {}).value || '').toLowerCase().trim();

  var el = document.getElementById('lista-todos');
  if (el) el.innerHTML = '<div class="adm-empty"><div class="adm-empty-text">Carregando...</div></div>';

  var todos = await getTodosPedidos(status || null, cat || null);

  if (q) {
    todos = todos.filter(function (p) {
      return (p.servico || '').toLowerCase().includes(q)
        || (p.placa || '').toLowerCase().includes(q)
        || ((p.clientes && p.clientes.nome_completo) || '').toLowerCase().includes(q);
    });
  }

  renderListaFiltrada(todos);
}

var todosFiltrosIniciados = false;

async function renderTodosPedidos() {
  /* Vincula os controles UMA VEZ */
  if (!todosFiltrosIniciados) {
    todosFiltrosIniciados = true;

    var selStatus = document.getElementById('filtro-status');
    var inpBusca  = document.getElementById('filtro-busca');
    if (selStatus) selStatus.addEventListener('change', aplicarFiltrosTodos);
    if (inpBusca)  inpBusca.addEventListener('input',  aplicarFiltrosTodos);
  }

  /* Reseta os controles e carrega tudo */
  var selStatus = document.getElementById('filtro-status');
  var inpBusca  = document.getElementById('filtro-busca');
  if (selStatus) selStatus.value = '';
  if (inpBusca)  inpBusca.value  = '';

  /* Marca a aba "Todos" como ativa */
  var tabsTodos = document.querySelectorAll('#tabs-todos .adm-cat-tab');
  tabsTodos.forEach(function(t) { t.classList.remove('active'); });
  var tabTodos = document.querySelector('#tabs-todos .adm-cat-tab[data-cat=""]');
  if (tabTodos) tabTodos.classList.add('active');

  await aplicarFiltrosTodos();
}

function renderListaFiltrada(lista) {
  var el = document.getElementById('lista-todos');
  if (!el) return;
  if (lista.length === 0) {
    el.innerHTML = '<div class="adm-empty"><div class="adm-empty-ico">🔍</div><div class="adm-empty-title">Nenhum resultado</div></div>';
    return;
  }
  var pag = aplicarPaginacaoAdm(lista, 'todos', 'aplicarFiltrosTodos()');
  el.innerHTML = pag.slice.map(function (p) { return renderCardPedido(p); }).join('') + pag.paginacaoHtml;
  bindBotoesDetalhe(el);
}

/* ─── Kanban ─── */
var KANBAN_COLUNAS = [
  { status: 'aguardando', label: 'Aguardando' },
  { status: 'aceito',     label: 'Aceito' },
  { status: 'concluido',  label: 'Concluído' },
  { status: 'negado',     label: 'Recusado' }
];

var kanbanFiltroAtivo = { de: null, ate: null };
var kanbanCatAtiva    = '';
var kanbanFiltroIniciado = false;

function calcularPeriodo(periodo) {
  var hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  var de = new Date();
  de.setHours(0, 0, 0, 0);

  if (periodo === 'hoje') {
    return { de: de, ate: hoje };
  }
  if (periodo === 'semana') {
    var diaSemana = de.getDay();
    de.setDate(de.getDate() - diaSemana);
    return { de: de, ate: hoje };
  }
  if (periodo === 'mes') {
    de.setDate(1);
    return { de: de, ate: hoje };
  }
  if (periodo === '3meses') {
    de.setMonth(de.getMonth() - 3);
    de.setDate(1);
    return { de: de, ate: hoje };
  }
  return { de: null, ate: null };
}

function initKanbanFiltro() {
  if (kanbanFiltroIniciado) return;
  kanbanFiltroIniciado = true;

  var btns = document.querySelectorAll('.kanban-filtro-btn');
  var inputDe  = document.getElementById('kanban-de');
  var inputAte = document.getElementById('kanban-ate');
  var btnFiltrar = document.getElementById('kanban-btn-filtrar');
  var btnLimpar  = document.getElementById('kanban-btn-limpar');

  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      btns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      var periodo = btn.getAttribute('data-periodo');
      var range = calcularPeriodo(periodo);
      kanbanFiltroAtivo = range;

      if (inputDe)  inputDe.value  = '';
      if (inputAte) inputAte.value = '';
      if (btnLimpar) btnLimpar.style.display = 'none';

      renderKanban();
    });
  });

  if (btnFiltrar) {
    btnFiltrar.addEventListener('click', function () {
      var de  = inputDe  && inputDe.value  ? new Date(inputDe.value  + 'T00:00:00') : null;
      var ate = inputAte && inputAte.value ? new Date(inputAte.value + 'T23:59:59') : null;
      if (!de && !ate) return;

      btns.forEach(function (b) { b.classList.remove('active'); });
      kanbanFiltroAtivo = { de: de, ate: ate };
      if (btnLimpar) btnLimpar.style.display = '';
      renderKanban();
    });
  }

  if (btnLimpar) {
    btnLimpar.addEventListener('click', function () {
      if (inputDe)  inputDe.value  = '';
      if (inputAte) inputAte.value = '';
      kanbanFiltroAtivo = { de: null, ate: null };
      btnLimpar.style.display = 'none';
      var primBtn = document.querySelector('.kanban-filtro-btn[data-periodo="tudo"]');
      if (primBtn) primBtn.classList.add('active');
      renderKanban();
    });
  }

  /* Filtro de categoria */
  var catBtns = document.querySelectorAll('#kanban-cat-btns .kanban-cat-btn');
  catBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      catBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      kanbanCatAtiva = btn.getAttribute('data-kancat');
      renderKanban();
    });
  });
}

async function renderKanban() {
  KANBAN_COLUNAS.forEach(function(col) {
    var el = document.getElementById('kanban-cards-' + col.status);
    if (el) el.innerHTML = '<div class="kanban-loading">Carregando…</div>';
  });

  var res = await _supabase
    .from('pedidos')
    .select('*, clientes(id, nome_completo, email)')
    .order('criado_em', { ascending: false });
  var todos = (res.data || []).filter(function (p) {
    /* Filtro de período */
    if (kanbanFiltroAtivo.de || kanbanFiltroAtivo.ate) {
      var criado = p.criado_em ? new Date(p.criado_em) : null;
      if (!criado) return false;
      if (kanbanFiltroAtivo.de  && criado < kanbanFiltroAtivo.de)  return false;
      if (kanbanFiltroAtivo.ate && criado > kanbanFiltroAtivo.ate) return false;
    }
    /* Filtro de categoria */
    if (kanbanCatAtiva && p.categoria !== kanbanCatAtiva) return false;
    return true;
  });

  KANBAN_COLUNAS.forEach(function(col) {
    var cards = document.getElementById('kanban-cards-' + col.status);
    var countEl = document.getElementById('kanban-count-' + col.status);
    if (!cards) return;

    var lista = todos.filter(function(p) {
      return (p.status || 'aguardando') === col.status;
    });

    if (countEl) countEl.textContent = lista.length;

    if (lista.length === 0) {
      cards.innerHTML = '<div class="kanban-empty">Nenhum pedido</div>';
      return;
    }

    cards.innerHTML = lista.map(function(p) {
      var cliente = (p.clientes && p.clientes.nome_completo) || '—';
      var servico = p.servico || '—';
      var placa   = p.placa   || '—';
      var preco   = p.preco != null ? 'R$ ' + Number(p.preco).toFixed(2).replace('.', ',') : '—';
      var data    = p.criado_em ? new Date(p.criado_em).toLocaleDateString('pt-BR') : '';
      var temArq  = !!p.arquivo_url;

      return '<div class="kanban-card" data-id="' + p.id + '">' +
        '<div class="kanban-card-servico">' + servico + '</div>' +
        '<div class="kanban-card-cliente">👤 ' + cliente + '</div>' +
        '<div class="kanban-card-placa">🚗 ' + placa + (p.uf ? ' &nbsp;·&nbsp; ' + p.uf : '') + '</div>' +
        '<div class="kanban-card-footer">' +
          '<span class="kanban-card-preco">' + preco + '</span>' +
          '<span class="kanban-card-data">' + data + '</span>' +
          (temArq ? '<span class="kanban-card-arq" title="Documento anexado">📄</span>' : '') +
        '</div>' +
        '<button class="kanban-card-btn" data-id="' + p.id + '">Ver detalhes →</button>' +
      '</div>';
    }).join('');

    cards.querySelectorAll('.kanban-card-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        abrirModal(btn.getAttribute('data-id'), todos);
      });
    });
  });
}

/* ─── Histórico (aceitos + concluídos) ─── */
async function renderPedidosHistorico() {
  var el = document.getElementById('lista-historico-admin');
  if (!el) return;
  el.innerHTML = '<div class="adm-empty"><div class="adm-empty-text">Carregando...</div></div>';

  var res = await _supabase
    .from('pedidos')
    .select('*, clientes(id, nome_completo, email)')
    .in('status', ['aceito', 'concluido', 'negado'])
    .order('criado_em', { ascending: false });

  var lista = res.data || [];
  if (lista.length === 0) {
    el.innerHTML = '<div class="adm-empty"><div class="adm-empty-ico">📋</div><div class="adm-empty-title">Nenhum histórico ainda</div></div>';
    return;
  }
  el.innerHTML = lista.map(function (p) { return renderCardPedido(p); }).join('');
  bindBotoesDetalhe(el);
}

/* ─── Render clientes ─── */
async function carregarClientes() {
  var res = await _supabase.from('clientes').select('id, nome_completo, email, telefone, criado_em, is_admin').order('criado_em', { ascending: false });
  todosClientes = res.data || [];
}

function renderClientesTabela(lista) {
  var el = document.getElementById('lista-clientes-admin');
  if (!el) return;
  if (lista.length === 0) {
    el.innerHTML = '<div class="adm-empty"><div class="adm-empty-ico">🔍</div><div class="adm-empty-title">Nenhum cliente encontrado</div></div>';
    return;
  }
  el.innerHTML = '<div class="adm-table-wrap"><table class="adm-table"><thead><tr><th>Nome</th><th>E-mail</th><th>Telefone</th><th>Cadastro</th><th>Perfil</th></tr></thead><tbody>' +
    lista.map(function (c) {
      var data = c.criado_em ? new Date(c.criado_em).toLocaleDateString('pt-BR') : '—';
      var isAdmin = !!c.is_admin;
      return '<tr>' +
        '<td>' + (c.nome_completo || '—') + '</td>' +
        '<td>' + (c.email || '—') + '</td>' +
        '<td>' + (c.telefone || '—') + '</td>' +
        '<td>' + data + '</td>' +
        '<td>' +
          '<select class="clientes-role-select" data-id="' + c.id + '" data-nome="' + (c.nome_completo || 'Cliente') + '">' +
            '<option value="cliente"' + (!isAdmin ? ' selected' : '') + '>Cliente</option>' +
            '<option value="admin"'   + ( isAdmin ? ' selected' : '') + '>Admin</option>' +
          '</select>' +
        '</td>' +
      '</tr>';
    }).join('') +
  '</tbody></table></div>';

  el.querySelectorAll('.clientes-role-select').forEach(function (sel) {
    sel.addEventListener('change', async function () {
      var clienteId = sel.getAttribute('data-id');
      var nome      = sel.getAttribute('data-nome');
      var novoAdmin = sel.value === 'admin';
      var msg = document.getElementById('clientes-role-msg');

      sel.disabled = true;
      var res = await _supabase.from('clientes').update({ is_admin: novoAdmin }).eq('id', clienteId);
      sel.disabled = false;

      if (res.error) {
        if (msg) { msg.style.display = 'block'; msg.style.background = '#fef2f2'; msg.style.color = '#991b1b'; msg.textContent = '❌ Erro ao atualizar perfil de ' + nome + ': ' + res.error.message; }
      } else {
        var idx = todosClientes.findIndex(function (c) { return c.id === clienteId; });
        if (idx !== -1) todosClientes[idx].is_admin = novoAdmin;
        if (msg) {
          msg.style.display = 'block';
          msg.style.background = '#f0fdf4';
          msg.style.color = '#15803d';
          msg.textContent = '✓ Perfil de ' + nome + ' atualizado para ' + (novoAdmin ? 'Admin' : 'Cliente') + '.';
          setTimeout(function () { msg.style.display = 'none'; }, 4000);
        }
      }
    });
  });
}

var clientesBuscaIniciada = false;

async function renderClientes() {
  await carregarClientes();

  if (!clientesBuscaIniciada) {
    clientesBuscaIniciada = true;
    var input = document.getElementById('clientes-busca');
    if (input) {
      input.addEventListener('input', function () {
        var q = input.value.trim().toLowerCase();
        var filtrado = todosClientes.filter(function (c) {
          return (c.nome_completo || '').toLowerCase().includes(q) ||
                 (c.email || '').toLowerCase().includes(q);
        });
        renderClientesTabela(filtrado);
      });
    }
  }

  renderClientesTabela(todosClientes);
}

/* ─── Init Novo Pedido ─── */
async function initNovoPedido() {
  await carregarClientes();
  var sel = document.getElementById('np-cliente');
  if (!sel) return;
  sel.innerHTML = '<option value="">Selecione o cliente</option>' +
    todosClientes.map(function (c) {
      return '<option value="' + c.id + '">' + (c.nome_completo || c.email) + '</option>';
    }).join('');

  var btn = document.getElementById('np-btn-salvar');
  if (btn._bound) return;
  btn._bound = true;

  btn.addEventListener('click', async function () {
    var clienteId = document.getElementById('np-cliente').value;
    var servico   = document.getElementById('np-servico').value;
    var placa     = document.getElementById('np-placa').value.trim().toUpperCase();
    var uf        = document.getElementById('np-uf').value;
    var renavam   = document.getElementById('np-renavam').value.trim();
    var cpf       = document.getElementById('np-cpf').value.trim();
    var preco     = parseFloat(document.getElementById('np-preco').value || '0');
    var status    = document.getElementById('np-status').value;
    var obs       = document.getElementById('np-obs').value.trim();
    var msg       = document.getElementById('np-msg');

    msg.style.display = 'none';
    if (!clienteId) return mostrarMsg(msg, 'erro', 'Selecione um cliente.');
    if (!servico)   return mostrarMsg(msg, 'erro', 'Selecione o serviço.');
    if (!placa)     return mostrarMsg(msg, 'erro', 'Informe a placa.');

    var nomeServico = document.getElementById('np-servico').selectedOptions[0].text;
    btn.disabled = true; btn.textContent = 'Salvando...';

    var res = await _supabase.from('pedidos').insert({
      cliente_id: clienteId,
      servico: nomeServico,
      categoria: servico,
      placa: placa || null,
      uf: uf || null,
      renavam: renavam || null,
      cpf_cnpj: cpf || null,
      preco: preco,
      status: status,
      observacao_admin: obs || null,
      external_reference: 'admin-' + Date.now(),
    });

    btn.disabled = false;
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg> Adicionar Pedido';

    if (res.error) {
      mostrarMsg(msg, 'erro', 'Erro ao salvar: ' + res.error.message);
    } else {
      mostrarMsg(msg, 'sucesso', 'Pedido adicionado com sucesso!');
      document.getElementById('np-placa').value = '';
      document.getElementById('np-renavam').value = '';
      document.getElementById('np-cpf').value = '';
      document.getElementById('np-preco').value = '';
      document.getElementById('np-obs').value = '';
    }
  });
}

/* ─── Render card ─── */
function renderCardPedido(p) {
  var cat = p.categoria || 'crlv';
  var cor = CAT_CORES[cat] || CAT_CORES['crlv'];
  var preco = (!p.preco || p.preco == 0) ? 'Grátis' : 'R$ ' + parseFloat(p.preco).toFixed(2).replace('.', ',');
  var data = p.criado_em ? new Date(p.criado_em).toLocaleDateString('pt-BR') : '—';
  var clienteNome = (p.clientes && p.clientes.nome_completo) ? p.clientes.nome_completo : '—';
  var statusCls = 'status-' + (p.status || 'aguardando');
  var statusLabel = { aguardando: 'Aguardando', aceito: 'Aceito', negado: 'Negado', concluido: 'Concluído', aguardando_pagamento: 'Ag. Pagamento', pagamento_negado: 'Pgto. Negado' }[p.status] || p.status;

  return '<div class="pedido-adm-card" data-id="' + p.id + '">' +
    '<div class="pedido-adm-cat-ico" style="background:' + cor.bg + ';color:' + cor.color + '">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
    '</div>' +
    '<div class="pedido-adm-body">' +
      '<div class="pedido-adm-nome">' + (p.servico || '—') + '</div>' +
      '<div class="pedido-adm-meta">' +
        (p.placa ? '<span>Placa: <b>' + p.placa + '</b></span>' : '') +
        (p.uf ? '<span>UF: ' + p.uf + '</span>' : '') +
        '<span>' + data + '</span>' +
      '</div>' +
      '<span class="pedido-adm-cliente-nome">👤 ' + clienteNome + '</span>' +
    '</div>' +
    '<div class="pedido-adm-right">' +
      '<div style="text-align:right">' +
        '<div class="pedido-adm-preco">' + preco + '</div>' +
        '<span class="status-badge ' + statusCls + '">' + statusLabel + '</span>' +
      '</div>' +
      '<button class="adm-btn-detalhe" data-id="' + p.id + '">Ver</button>' +
    '</div>' +
  '</div>';
}

function bindBotoesDetalhe(container) {
  container.querySelectorAll('.adm-btn-detalhe').forEach(function (btn) {
    btn.addEventListener('click', async function () {
      var id = btn.getAttribute('data-id');
      await abrirModal(id);
    });
  });
}

/* ─── Modal detalhe ─── */
function initModal() {
  document.getElementById('adm-modal-close').addEventListener('click', fecharModal);
  document.getElementById('adm-overlay').addEventListener('click', function (e) {
    if (e.target === this) fecharModal();
  });
  document.getElementById('modal-btn-aceitar').addEventListener('click', function () { atualizarStatus('aceito'); });
  document.getElementById('modal-btn-negar').addEventListener('click', function () { atualizarStatus('negado'); });
  document.getElementById('modal-btn-concluir').addEventListener('click', function () { atualizarStatus('concluido'); });
  document.getElementById('modal-btn-salvar-arquivo').addEventListener('click', salvarArquivo);
  document.getElementById('modal-btn-excluir').addEventListener('click', deletarPedido);
  initUploadArquivo();
}

/* ─── Upload de arquivo para Supabase Storage ─── */
function initUploadArquivo() {
  var fileInput   = document.getElementById('modal-arquivo-file');
  var trigger     = document.getElementById('adm-upload-trigger');
  var uploadArea  = document.getElementById('adm-upload-area');
  var placeholder = document.getElementById('adm-upload-placeholder');
  var preview     = document.getElementById('adm-upload-preview');
  var previewNome = document.getElementById('adm-upload-nome');
  var remover     = document.getElementById('adm-upload-remover');
  var btnSalvar   = document.getElementById('modal-btn-upload-salvar');

  if (!fileInput) return;

  function selecionarArquivo(file) {
    if (!file) return;
    previewNome.textContent = file.name + ' (' + (file.size / 1024).toFixed(0) + ' KB)';
    placeholder.style.display = 'none';
    preview.style.display = 'flex';
    btnSalvar.style.display = 'block';
    fileInput._arquivoSelecionado = file;
  }

  trigger.addEventListener('click', function () { fileInput.click(); });

  fileInput.addEventListener('change', function () {
    selecionarArquivo(fileInput.files[0]);
  });

  uploadArea.addEventListener('dragover', function (e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });
  uploadArea.addEventListener('dragleave', function () {
    uploadArea.classList.remove('drag-over');
  });
  uploadArea.addEventListener('drop', function (e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    var file = e.dataTransfer.files[0];
    if (file) selecionarArquivo(file);
  });

  remover.addEventListener('click', function () {
    fileInput.value = '';
    fileInput._arquivoSelecionado = null;
    placeholder.style.display = '';
    preview.style.display = 'none';
    btnSalvar.style.display = 'none';
  });

  btnSalvar.addEventListener('click', async function () {
    var file = fileInput._arquivoSelecionado;
    if (!file || !pedidoAtual) return;

    btnSalvar.disabled = true;
    btnSalvar.textContent = '⏳ Enviando…';

    var ext  = file.name.split('.').pop();
    var path = 'pedidos/' + pedidoAtual.id + '_' + Date.now() + '.' + ext;

    var { data: upData, error: upErr } = await _supabase.storage
      .from('documentos-pedidos')
      .upload(path, file, { upsert: true });

    if (upErr) {
      btnSalvar.disabled = false;
      btnSalvar.textContent = '⬆ Enviar arquivo';
      mostrarErroModal('Erro ao enviar arquivo: ' + upErr.message);
      return;
    }

    var { data: urlData } = _supabase.storage
      .from('documentos-pedidos')
      .getPublicUrl(path);

    var publicUrl = urlData.publicUrl;

    /* salva a URL no campo de texto e dispara o save */
    document.getElementById('modal-arquivo-url').value = publicUrl;
    await salvarArquivo();

    btnSalvar.disabled = false;
    btnSalvar.textContent = '⬆ Enviar arquivo';
    fileInput.value = '';
    fileInput._arquivoSelecionado = null;
    placeholder.style.display = '';
    preview.style.display = 'none';
    btnSalvar.style.display = 'none';
  });
}

async function abrirModal(pedidoId) {
  var res = await _supabase
    .from('pedidos')
    .select('*, clientes(id, nome_completo, email, telefone)')
    .eq('id', pedidoId)
    .single();

  if (res.error || !res.data) return;
  pedidoAtual = res.data;
  var p = pedidoAtual;

  var statusLabel = { aguardando: 'Aguardando', aceito: 'Aceito', negado: 'Negado', concluido: 'Concluído', aguardando_pagamento: 'Aguardando Pagamento', pagamento_negado: 'Pagamento Negado' }[p.status] || p.status;
  var statusCls = 'status-' + (p.status || 'aguardando');
  var preco = (!p.preco || p.preco == 0) ? 'Grátis' : 'R$ ' + parseFloat(p.preco).toFixed(2).replace('.', ',');
  var data = p.criado_em ? new Date(p.criado_em).toLocaleDateString('pt-BR') : '—';
  var clienteNome = (p.clientes && p.clientes.nome_completo) || '—';
  var clienteEmail = (p.clientes && p.clientes.email) || '—';
  var clienteTel = (p.clientes && p.clientes.telefone) || '—';

  /* Bloqueia o botão "Aceitar" se o pagamento não foi confirmado */
  var pagamentoPendente = p.status === 'aguardando_pagamento' || p.status === 'pagamento_negado';
  var btnAceitar = document.getElementById('modal-btn-aceitar');
  if (btnAceitar) {
    btnAceitar.disabled = pagamentoPendente;
    btnAceitar.title = pagamentoPendente ? 'Não é possível aceitar: pagamento não confirmado.' : '';
  }

  var avisoPagemento = '';
  if (p.status === 'aguardando_pagamento') {
    avisoPagemento = '<div style="margin-bottom:12px;padding:10px 14px;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;font-size:.82rem;color:#6d28d9">' +
      '⏳ <strong>Aguardando confirmação do pagamento</strong> — o pedido só pode ser aceito após o pagamento ser aprovado pelo Mercado Pago.</div>';
  } else if (p.status === 'pagamento_negado') {
    avisoPagemento = '<div style="margin-bottom:12px;padding:10px 14px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;font-size:.82rem;color:#991b1b">' +
      '💳 <strong>Pagamento recusado pelo Mercado Pago</strong> — não é possível aceitar este pedido. O cliente deve realizar um novo pedido.</div>';
  }

  document.getElementById('modal-titulo').textContent = p.servico || 'Pedido';
  document.getElementById('adm-modal-body').innerHTML =
    avisoPagemento +
    row('Status', '<span class="status-badge ' + statusCls + '">' + statusLabel + '</span>') +
    row('Cliente', clienteNome) +
    row('E-mail', clienteEmail) +
    row('Telefone', clienteTel) +
    row('Placa', p.placa || '—') +
    row('UF', p.uf || '—') +
    row('RENAVAM', p.renavam || '—') +
    row((p.categoria === 'codigo-seg' ? 'Nome do Proprietário' : 'CPF/CNPJ'), p.cpf_cnpj || '—') +
    row('Valor', preco) +
    row('Data', data) +
    (p.observacao_admin ? row('Observação', p.observacao_admin) : '');

  /* Arquivo */
  var arquivoAtual = document.getElementById('modal-arquivo-atual');
  var arquivoInput = document.getElementById('modal-arquivo-url');
  arquivoInput.value = p.arquivo_url || '';
  if (p.arquivo_url) {
    arquivoAtual.style.display = 'block';
    arquivoAtual.innerHTML = 'Arquivo atual: <a href="' + p.arquivo_url + '" target="_blank" rel="noopener">' + p.arquivo_url + '</a>';
  } else {
    arquivoAtual.style.display = 'none';
  }

  /* Observação */
  document.getElementById('modal-obs').value = p.observacao_admin || '';

  document.getElementById('adm-overlay').style.display = 'flex';
}

function fecharModal() {
  document.getElementById('adm-overlay').style.display = 'none';
  pedidoAtual = null;
}

function row(lbl, val) {
  return '<div class="adm-modal-row"><span class="adm-modal-lbl">' + lbl + '</span><span class="adm-modal-val">' + val + '</span></div>';
}

function mostrarErroModal(msg) {
  var el = document.getElementById('modal-erro');
  if (el) { el.innerHTML = msg; el.style.display = 'block'; }
}
function limparErroModal() {
  var el = document.getElementById('modal-erro');
  if (el) { el.style.display = 'none'; el.textContent = ''; }
}

async function atualizarStatus(novoStatus) {
  console.log('[Admin] atualizarStatus:', novoStatus, '| pedidoAtual:', pedidoAtual);

  limparErroModal();

  if (!pedidoAtual) {
    mostrarErroModal('Pedido não carregado. Feche e reabra o modal.');
    return;
  }

  var btnMap = { aceito: 'modal-btn-aceitar', negado: 'modal-btn-negar', concluido: 'modal-btn-concluir' };
  var btnEl = document.getElementById(btnMap[novoStatus]);
  if (btnEl) { btnEl.disabled = true; btnEl.textContent = 'Salvando...'; }

  var obs = document.getElementById('modal-obs').value.trim();

  var res = await _supabase.from('pedidos').update({
    status: novoStatus,
    observacao_admin: obs || null,
  }).eq('id', pedidoAtual.id);

  console.log('[Admin] Resultado update:', JSON.stringify(res));

  if (btnEl) {
    var labels = { aceito: '✓ Aceitar', negado: '✕ Recusar', concluido: '⬆ Concluir' };
    btnEl.disabled = false;
    btnEl.textContent = labels[novoStatus] || novoStatus;
  }

  if (res.error) {
    mostrarErroModal('Erro Supabase: ' + res.error.message + ' (code: ' + res.error.code + ')');
    return;
  }

  /* Verifica se o banco realmente atualizou (detecta bloqueio por RLS) */
  var check = await _supabase.from('pedidos').select('status').eq('id', pedidoAtual.id).single();
  console.log('[Admin] Status no banco apos update:', check.data && check.data.status);

  if (!check.data || check.data.status !== novoStatus) {
    mostrarErroModal(
      '⚠️ O banco nao atualizou o status (era "' + (check.data && check.data.status) + '", esperava "' + novoStatus + '").<br><br>' +
      'Provavel causa: <b>politica RLS do Supabase</b> bloqueando updates do admin.<br>' +
      'Solucao: va em <b>Supabase Dashboard → Table Editor → pedidos → Policies</b> e desative o RLS ou adicione uma policy que permita admins atualizarem qualquer pedido.'
    );
    return;
  }

  fecharModal();
  await atualizarTodasAsSecoes();
}

/* Atualiza badge + seção ativa */
async function atualizarTodasAsSecoes() {
  /* Badge de pendentes — busca simples da contagem */
  var resBadge = await _supabase.from('pedidos').select('id').eq('status', 'aguardando');
  var badge = document.getElementById('badge-pendentes');
  if (badge) {
    var qtd = (resBadge.data || []).length;
    badge.textContent = qtd;
    badge.setAttribute('data-count', qtd);
  }

  /* Re-renderiza a seção ativa */
  var secAtiva = document.querySelector('.adm-link.active');
  if (secAtiva) await renderSecao(secAtiva.getAttribute('data-sec'));
}

async function salvarArquivo() {
  if (!pedidoAtual) return;
  var url = document.getElementById('modal-arquivo-url').value.trim();
  var btnSalvar = document.getElementById('modal-btn-salvar-arquivo');
  if (btnSalvar) { btnSalvar.disabled = true; btnSalvar.textContent = 'Salvando…'; }

  var updateData = { arquivo_url: url || null };
  /* Auto-avança para "Aceito" ao anexar arquivo quando ainda está aguardando */
  if (url && (pedidoAtual.status === 'aguardando' || !pedidoAtual.status)) {
    updateData.status = 'aceito';
  }

  var res = await _supabase.from('pedidos').update(updateData).eq('id', pedidoAtual.id);

  if (btnSalvar) { btnSalvar.disabled = false; btnSalvar.textContent = 'Salvar Arquivo'; }

  if (res.error) {
    alert('Erro ao salvar arquivo: ' + res.error.message);
    return;
  }

  if (updateData.status) pedidoAtual.status = updateData.status;
  pedidoAtual.arquivo_url = url;

  var arquivoAtual = document.getElementById('modal-arquivo-atual');
  if (url) {
    arquivoAtual.style.display = 'block';
    arquivoAtual.innerHTML = '✅ Arquivo salvo: <a href="' + url + '" target="_blank" rel="noopener">' + url + '</a>';
  } else {
    arquivoAtual.style.display = 'none';
  }

  /* Atualiza status no modal visualmente */
  if (updateData.status) {
    var statusLabel = { aguardando: 'Aguardando', aceito: 'Aceito', negado: 'Negado', concluido: 'Concluído' }[updateData.status] || updateData.status;
    var statusCls = 'status-' + updateData.status;
    var rowStatus = document.querySelector('#adm-modal-body .adm-modal-row:first-child .adm-modal-val');
    if (rowStatus) rowStatus.innerHTML = '<span class="status-badge ' + statusCls + '">' + statusLabel + '</span>';
  }

  await atualizarTodasAsSecoes();
}

async function deletarPedido() {
  if (!pedidoAtual) return;
  if (!confirm('Excluir este pedido permanentemente? Esta ação não pode ser desfeita.')) return;
  var res = await _supabase.from('pedidos').delete().eq('id', pedidoAtual.id);
  if (res.error) { alert('Erro ao excluir: ' + res.error.message); return; }
  fecharModal();
  await atualizarTodasAsSecoes();
}

async function limparTodosPedidos() {
  if (!confirm('⚠️ Isso irá EXCLUIR TODOS os pedidos permanentemente.\n\nTem certeza?')) return;
  await _supabase.from('pedidos').delete().not('id', 'is', null);
  await renderSecao('todos-pedidos');
  var badge = document.getElementById('badge-pendentes');
  if (badge) { badge.textContent = '0'; badge.setAttribute('data-count', '0'); }
}

function mostrarMsg(el, tipo, txt) {
  el.textContent = txt;
  el.className = 'adm-msg ' + tipo;
  el.style.display = 'block';
}

/**
 * NC Gestão Veicular - Lógica compartilhada
 * Autenticação via Supabase Auth + dados no banco Supabase
 */

/* ── Retorna o cliente logado (busca no Supabase) ── */
async function getClienteAtual() {
  var sessao = await _supabase.auth.getSession();
  if (!sessao.data || !sessao.data.session) return null;
  var userId = sessao.data.session.user.id;
  var res = await _supabase
    .from('clientes')
    .select('id, nome_completo, email, telefone, endereco, senha, is_admin, auth_user_id')
    .eq('auth_user_id', userId)
    .single();
  if (res.error || !res.data) return null;
  return {
    id: res.data.id,
    nomeCompleto: res.data.nome_completo,
    email: res.data.email,
    telefone: res.data.telefone,
    endereco: res.data.endereco,
    senha: res.data.senha || '',
    isAdmin: res.data.is_admin === true,
  };
}

/* ── Logout ── */
function logout() {
  _supabase.auth.signOut().then(function() {
    window.location.href = 'index.html';
  });
}

/* ── Protege páginas que exigem login ──
   Chame protegerPagina() no topo do script de qualquer página privada */
function protegerPagina() {
  _supabase.auth.getSession().then(function(res) {
    if (!res.data || !res.data.session) {
      window.location.href = 'index.html';
    }
  });
}

/* ── Protege o painel admin ── */
function protegerAdmin() {
  _supabase.auth.getSession().then(function(res) {
    if (!res.data || !res.data.session) {
      window.location.href = 'index.html';
    }
  });
}

/* ── Salva pedido no Supabase ── */
async function salvarPedido(pedido, clienteId) {
  var res = await _supabase.from('pedidos').insert({
    cliente_id: clienteId,
    servico: pedido.servico,
    categoria: pedido.cat,
    placa: pedido.placa || null,
    renavam: pedido.renavam || null,
    cpf_cnpj: pedido.cpf || null,
    uf: pedido.uf || null,
    preco: pedido.preco,
    status: 'aguardando',
    external_reference: String(pedido.id),
  });
  return res;
}

/* ── Busca pedidos do cliente logado ── */
async function getPedidosDoCliente() {
  var cliente = await getClienteAtual();
  if (!cliente) return [];
  var res = await _supabase
    .from('pedidos')
    .select('*')
    .eq('cliente_id', cliente.id)
    .order('criado_em', { ascending: false });
  return res.data || [];
}

/* ── Registra emissão (compatibilidade com servicos.js) ── */
function registrarEmissao(estado, valor, clienteId) {
  getClienteAtual().then(function(cliente) {
    if (!cliente) return;
    _supabase.from('pedidos').insert({
      cliente_id: cliente.id,
      servico: 'CRLV-E ' + estado,
      categoria: 'crlv',
      uf: estado,
      preco: parseFloat(String(valor).replace(',', '.')),
      status: 'aguardando',
    });
  });
}

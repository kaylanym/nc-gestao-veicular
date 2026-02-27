/**
 * NC Gestão Veicular - Página de Serviços
 * Configure o número do WhatsApp abaixo (apenas números, com DDI 55).
 */
var NC_WHATSAPP_NUMERO = '5500000000000';

function whatsappUrl(mensagem) {
  var texto = encodeURIComponent(mensagem);
  return 'https://wa.me/' + NC_WHATSAPP_NUMERO + '?text=' + texto;
}

// CRLV-E até 15 min - dados do documento
var CRLV_IMEDIATO = [
  { sigla: 'AC', nome: 'Acre', valor: '35.90' },
  { sigla: 'AP', nome: 'Amapá', valor: '14.90' },
  { sigla: 'BA', nome: 'Bahia', valor: '35.90' },
  { sigla: 'GO', nome: 'Goiás', valor: '35.90' },
  { sigla: 'MA', nome: 'Maranhão', valor: '14.90' },
  { sigla: 'MG', nome: 'Minas Gerais', valor: '19.90' },
  { sigla: 'PR', nome: 'Paraná', valor: '25.90' },
  { sigla: 'PI', nome: 'Piauí', valor: '29.90' },
  { sigla: 'RR', nome: 'Roraima', valor: '24.90' },
  { sigla: 'SP', nome: 'São Paulo', valor: '29.90' },
  { sigla: 'SE', nome: 'Sergipe', valor: '29.90' },
  { sigla: 'TO', nome: 'Tocantins', valor: '14.90' }
];

function renderEstadosSimbolos() {
  document.querySelectorAll('.estados-simbolos[data-estados]').forEach(function (el) {
    var siglas = el.getAttribute('data-estados').split(',');
    el.innerHTML = siglas.map(function (s) {
      return '<span class="estado-simbolo" title="' + s + '">' + s + '</span>';
    }).join('');
  });
}

function renderCrlvImediato() {
  var container = document.getElementById('lista-crlv-imediato');
  if (!container) return;
  container.innerHTML = CRLV_IMEDIATO.map(function (e) {
    var valorBr = 'R$ ' + e.valor.replace('.', ',');
    return '<div class="estado-item">' +
      '<span class="nome">CRLV-E ' + e.nome + '</span>' +
      '<span class="preco">' + valorBr + '</span>' +
      '<button type="button" class="btn btn-primary btn-emitir" data-estado="' + e.nome + '" data-valor="' + e.valor + '">Emitir</button>' +
      '</div>';
  }).join('');

  var aviso = document.getElementById('aviso-15min');
  container.querySelectorAll('.btn-emitir').forEach(function (btn) {
    btn.addEventListener('click', function () {
      registrarEmissao(btn.getAttribute('data-estado'), btn.getAttribute('data-valor'));
      if (aviso) {
        aviso.classList.add('visible');
        aviso.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });
}

function renderAtpv() {
  var itens = [
    { nome: 'ATPV-E Espírito Santo', valor: '100,00' },
    { nome: 'ATPV-E Minas Gerais', valor: '100,00' },
    { nome: 'ATPV-E Bahia', valor: '110,00' },
    { nome: 'ATPV-E Santa Catarina', valor: '130,00' },
    { nome: 'ATPV-E Alagoas', valor: '150,00' },
    { nome: 'ATPV-E Rio de Janeiro', valor: '130,00' },
    { nome: 'ATPV-E Rio Grande do Sul', valor: '150,00' },
    { nome: 'ATPV-E Paraná', valor: '130,00' },
    { nome: 'ATPV-E Ceará', valor: '200,00' }
  ];
  var container = document.getElementById('lista-atpv');
  if (!container) return;
  container.innerHTML = itens.map(function (e) {
    return '<div class="estado-item">' +
      '<span class="nome">' + e.nome + '</span>' +
      '<span class="preco">R$ ' + e.valor + '</span>' +
      '</div>';
  }).join('');
}

function initCrlvAgendado() {
  var select = document.getElementById('estado-crlv-ag');
  var placa = document.getElementById('placa-crlv-ag');
  var msgEntrega = document.getElementById('msg-entrega-agendado');
  var linkWhats = document.getElementById('link-whatsapp-crlv-ag');

  function atualizar() {
    var opt = select.options[select.selectedIndex];
    if (!opt || !opt.value) {
      msgEntrega.style.display = 'none';
      linkWhats.style.display = 'none';
      return;
    }
    var valor = opt.getAttribute('data-valor');
    var texto = opt.text;
    msgEntrega.style.display = 'block';
    msgEntrega.innerHTML = 'Documento: <strong>' + texto + '</strong>. O prazo de entrega será informado após confirmação via WhatsApp.';
    linkWhats.style.display = 'inline-block';
    var placaVal = (placa && placa.value) ? placa.value.trim() : '';
    var msg = 'Olá! Gostaria de solicitar: ' + texto + '.';
    if (placaVal) msg += ' Placa: ' + placaVal + '.';
    linkWhats.href = whatsappUrl(msg);
  }

  if (select) select.addEventListener('change', atualizar);
  if (placa) placa.addEventListener('input', atualizar);
}

function initAtpvWhatsapp() {
  var select = document.getElementById('estado-atpv');
  var link = document.getElementById('link-whatsapp-atpv');
  if (!select || !link) return;
  select.addEventListener('change', function () {
    var opt = select.options[select.selectedIndex];
    if (!opt || !opt.value) {
      link.style.display = 'none';
      return;
    }
    var texto = opt.text;
    link.href = whatsappUrl('Olá! Gostaria de emitir: ' + texto + '.');
    link.style.display = 'inline-block';
  });
}

function initMultasIpvaWhatsapp() {
  var tipo = document.getElementById('tipo-emissao');
  var placa = document.getElementById('placa-multas');
  var estado = document.getElementById('estado-multas');
  var link = document.getElementById('link-whatsapp-debitos');
  if (!tipo || !link) return;
  function atualizar() {
    if (tipo.value !== 'debitos') {
      link.style.display = 'none';
      return;
    }
    var p = (placa && placa.value) ? placa.value.trim() : '';
    var e = (estado && estado.value) ? estado.options[estado.selectedIndex].text : '';
    var msg = 'Olá! Gostaria de selecionar débitos para emissão.';
    if (p) msg += ' Placa: ' + p + '.';
    if (e) msg += ' Estado: ' + e + '.';
    link.href = whatsappUrl(msg);
    link.style.display = 'inline-block';
  }
  tipo.addEventListener('change', atualizar);
  if (placa) placa.addEventListener('input', atualizar);
  if (estado) estado.addEventListener('change', atualizar);
}

function initFormularios() {
  var formDebitos = document.getElementById('form-consulta-debitos');
  if (formDebitos) {
    formDebitos.addEventListener('submit', function (e) {
      e.preventDefault();
      var placa = document.getElementById('placa-debitos').value.trim();
      var estado = document.getElementById('estado-debitos');
      var estadoTexto = estado ? estado.options[estado.selectedIndex].text : '';
      if (!placa || !estado || !estado.value) {
        alert('Preencha placa e estado.');
        return;
      }
      var msg = whatsappUrl('Olá! Consulta de débitos. Placa: ' + placa + ', Estado: ' + estadoTexto + '. Valor R$ 10,90.');
      window.open(msg, '_blank');
    });
  }

  var formFipe = document.getElementById('form-fipe');
  if (formFipe) {
    formFipe.addEventListener('submit', function (e) {
      e.preventDefault();
      var placa = document.getElementById('placa-fipe').value.trim();
      if (!placa) {
        alert('Informe a placa.');
        return;
      }
      // Aqui integraria com API Fipe
      alert('Consulta Fipe (placa ' + placa + ') será realizada. Em produção, integrar com API.');
    });
  }

  var formBase = document.getElementById('form-base-estadual');
  if (formBase) {
    formBase.addEventListener('submit', function (e) {
      e.preventDefault();
      var placa = document.getElementById('placa-base').value.trim();
      var estado = document.getElementById('estado-base');
      var estadoTexto = estado ? estado.options[estado.selectedIndex].text : '';
      if (!placa || !estado || !estado.value) {
        alert('Preencha placa e estado.');
        return;
      }
      var msg = whatsappUrl('Olá! Consulta base estadual. Placa: ' + placa + ', Estado: ' + estadoTexto + '. Valor R$ 5,00.');
      window.open(msg, '_blank');
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  renderEstadosSimbolos();
  renderCrlvImediato();
  renderAtpv();
  initCrlvAgendado();
  initAtpvWhatsapp();
  initMultasIpvaWhatsapp();
  initFormularios();
});

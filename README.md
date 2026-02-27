# NC Gestão Veicular — Plataforma Web

Plataforma de emissões de documentos e pagamentos veiculares.

## Conteúdo do app

- **Página inicial**: simples, com área para a logo NC Gestão Veicular e o texto *"Uma plataforma de emissões de documentos e pagamentos veiculares"*.
- **Cadastro do cliente**: Nome completo, endereço, telefone (WhatsApp), e-mail.
- **Área do cliente**: Pagamentos, valor na plataforma e serviços já selecionados.
- **Serviços**: Emissão de CRLV-E para Acre, Amapá, Bahia e Goiás (valores conforme solicitado). Após solicitar emissão, é exibido aviso de que em até 15 minutos a emissão estará disponível na plataforma.

## Como usar

1. Abra a pasta `nc-gestao-veicular` no computador.
2. Para ver o site no navegador:
   - **Opção A**: Dê duplo clique em `index.html` para abrir no navegador.
   - **Opção B**: Se usar VS Code, instale a extensão "Live Server" e clique em "Go Live" para abrir com atualização automática.

## Colocar a logo da NC Gestão Veicular

Hoje o lugar da logo está como texto "NC Gestão Veicular". Para usar a logo da empresa:

1. Coloque o arquivo da logo (ex.: `logo-nc.png`) dentro da pasta `nc-gestao-veicular`.
2. Em **index.html**, troque as duas ocorrências abaixo.

**No topo da página (menu):**
```html
<div class="logo-placeholder">NC Gestão Veicular</div>
```
por:
```html
<img src="logo-nc.png" alt="NC Gestão Veicular" class="logo-img">
```

**Na parte central da página (hero):**
```html
<div class="logo-placeholder large">NC Gestão Veicular</div>
```
por:
```html
<img src="logo-nc.png" alt="NC Gestão Veicular" class="logo-img logo-hero">
```

3. No arquivo **styles.css**, adicione no final:
```css
.logo-img { max-height: 48px; width: auto; }
.logo-img.logo-hero { max-height: 80px; }
```

Repita a mesma troca da logo do menu em **cadastro.html**, **area-cliente.html** e **servicos.html** (só o primeiro bloco, o do menu).

## Dados dos clientes

Os dados de cadastro e as emissões são guardados apenas no **localStorage** do navegador (para demonstração). Para um sistema real com muitos usuários e servidor, será necessário um backend (banco de dados e autenticação).

## Estrutura dos arquivos

- `index.html` — Página inicial
- `cadastro.html` — Cadastro do cliente
- `area-cliente.html` — Pagamentos, valor e serviços do cliente
- `servicos.html` — Serviços CRLV-E (estados e valores)
- `styles.css` — Estilos
- `app.js` — Lógica compartilhada (cadastro, emissões, área do cliente)

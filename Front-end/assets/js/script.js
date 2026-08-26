/* ==========================================================================
   PNAE — assets/js/script.js
   Arquivo único de JavaScript, carregado com <script defer> em TODAS as
   páginas. "defer" garante que o HTML já foi todo interpretado antes deste
   arquivo rodar, por isso podemos usar document.getElementById direto,
   sem precisar esperar o evento "DOMContentLoaded".

   Estrutura deste arquivo:
   0. Guarda de autenticação (protege as páginas internas)  -> roda primeiro
   1. Bootstrap (idioma + injeção do CSS)          -> sempre roda
   2. Criação da Sidebar via JS (createElement)     -> só roda se existir
      um <div id="sidebar-root"></div> na página
   3. Lógica de cada página, isolada em funções     -> cada uma verifica se
      os elementos dela existem antes de fazer qualquer coisa, então é
      seguro ter todas as funções no mesmo arquivo mesmo estando em
      páginas diferentes.
   4. init() — dispara tudo, nessa ordem
   ========================================================================== */

/* ==========================================================================
   0. GUARDA DE AUTENTICAÇÃO
   Garante que, não importa qual URL/página a pessoa tentar abrir
   diretamente (ex: digitar dashboard-gerente.html na barra de endereço
   sem antes ter passado pelo login), ela seja jogada de volta pro login
   caso não exista uma sessão ativa.
   ========================================================================== */

/* ! LÓGICA DE BANCO DE DADOS / AUTENTICAÇÃO (mock) — hoje "estar logado"
   é só uma flag salva no sessionStorage do navegador (dura enquanto a aba
   estiver aberta; fecha a aba, precisa logar de novo). NÃO é uma sessão
   segura de verdade — qualquer pessoa pode abrir o console do navegador e
   digitar sessionStorage.setItem("pnae_logado","true") para "logar" sem
   senha. Numa versão com backend real, isso deve ser substituído por um
   token/sessão validado pelo servidor a cada requisição. */
const PAGINAS_PUBLICAS = ["login.html", "index.html", ""]; // "" cobre a raiz do domínio (ex: seusite.com/)

function isLoggedIn() {
  return sessionStorage.getItem("pnae_logado") === "true";
}

function paginaAtual() {
  return window.location.pathname.split("/").pop();
}

// $ SUBSTITUÍVEL — se quiser que o login "lembre" a pessoa mesmo depois de
// fechar o navegador (em vez de pedir login toda vez que abrir uma aba
// nova), troque TODAS as ocorrências de "sessionStorage" deste arquivo por
// "localStorage". A lógica continua idêntica, só muda quanto tempo a
// sessão dura.
// // localStorage.setItem("pnae_logado", "true");

const paginaEhPublica = PAGINAS_PUBLICAS.includes(paginaAtual());

// Roda IMEDIATAMENTE (fora de qualquer função), antes até do CSS ser
// injetado — assim a pessoa não chega a ver a página protegida piscar na
// tela antes do redirecionamento.
if (!paginaEhPublica && !isLoggedIn()) {
  window.location.href = "login.html";
}

/* ! LÓGICA DE ADIÇÃO DE ELEMENTOS / AUTENTICAÇÃO — função chamada pelo
   botão "Sair" em todas as páginas internas (ver atributo onclick="logout()"
   no HTML). Ela apaga a sessão E redireciona, nessa ordem — se só
   redirecionasse sem apagar a sessão, a pessoa conseguiria "logar de novo"
   apertando voltar no navegador. */
function logout() {
  sessionStorage.removeItem("pnae_logado");
  window.location.href = "login.html";
}

/* ==========================================================================
   0.1 TEMA (claro/escuro) — funciona para os dois perfis (Bolsista e
   Gerente). A preferência é salva no navegador (localStorage, então
   persiste mesmo depois de fechar a aba) e é aplicada em TODAS as
   páginas, não só em settings.html — é por isso que esta chamada fica
   aqui embaixo, fora de qualquer função de página específica.
   ========================================================================== */

/* ! LÓGICA DE COR — lê a preferência salva e aplica a classe "dark_theme"
   no <body> assim que a página carrega, antes de qualquer outra coisa.
   Sem isso, o botão em settings.html funcionaria só naquela página e o
   tema "esqueceria" ao navegar para outra tela. */
function applyStoredTheme() {
  const tema = localStorage.getItem("pnae_tema");
  if (tema === "dark") {
    document.body.classList.add("dark_theme");
  }
}
applyStoredTheme();

/* ! LÓGICA DE COR — trata o clique no switch de "Modo escuro" (só existe
   em settings.html, por isso a função sai cedo nas outras páginas). */
function initThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return; // não estamos em settings.html

  function syncUI(isDark) {
    toggleBtn.classList.toggle("is-on", isDark);
    toggleBtn.setAttribute("aria-checked", String(isDark));
  }

  // Reflete no botão o estado já aplicado por applyStoredTheme()
  syncUI(document.body.classList.contains("dark_theme"));

  toggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark_theme");
    localStorage.setItem("pnae_tema", isDark ? "dark" : "light");
    // $ SUBSTITUÍVEL — hoje a preferência fica só no navegador da pessoa.
    // Se no futuro cada usuário tiver conta no banco de dados, o ideal é
    // também salvar essa escolha lá, ex:
    // fetch("/api/usuario/preferencias", { method: "PATCH", body: JSON.stringify({ tema: isDark ? "dark" : "light" }) });
    syncUI(isDark);
  });
}

/* ==========================================================================
   1. BOOTSTRAP
   ========================================================================== */

//* coloca a linguagem de todas as paginas em portugues
document.documentElement.lang = "pt-BR";

/* ! LÓGICA DE COR / CARREGAMENTO — esta função é quem injeta o style.css
   no <head>. É por causa dela que nenhuma página tem <link rel="stylesheet">
   fixo no HTML: o CSS (incluindo o sistema de cores e o dark mode) só passa
   a existir na página depois que esta função roda. Se o layout aparecer
   "sem estilo" por uma fração de segundo ao carregar a página, é esperado
   (é o CSS sendo injetado depois do HTML) — para eliminar esse efeito no
   futuro, seria necessário voltar a usar um <link> fixo no <head>. */
async function add_element() {
  //* adiciona o style em cada arquivo
  const style = document.createElement("link"); //? cria o elemento link
  style.rel = "stylesheet"; //? configura para ser de estilização
  style.href = "assets/css/style.css"; //? linka com o css
  document.head.append(style); //? adiciona o elemento no final do head
  //// <link rel="stylesheet" href="assets/css/style.css">

  const font = document.createElement("link");
  font.rel = "preconnect";
  font.href = "https://fonts.googleapis.com";
  document.head.append(font);
  //// <link rel="preconnect" href="https://fonts.googleapis.com">

  const font2 = document.createElement("link");
  font2.rel = "stylesheet";
  font2.href =
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";
  document.head.append(font2);
  //// <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"></link>
}

/* ==========================================================================
   2. SIDEBAR — criada inteiramente via JavaScript (createElement)
   ========================================================================== */

/* ! LÓGICA DE ADIÇÃO DE ELEMENTOS — a sidebar do gerente NÃO existe como
   HTML pronto em nenhuma página. Ela é 100% montada aqui em JS e inserida
   dentro de <div id="sidebar-root"></div>. Para existir em uma página,
   basta colocar essa div vazia no HTML (dentro de um .app-shell) — o
   restante (menu, ícones, botão de recolher) é gerado por esta função.
   Se quiser REMOVER a sidebar de uma página, basta apagar a
   <div id="sidebar-root"></div> do HTML: esta função verifica se ela existe
   e não faz nada caso contrário, então nada quebra. */
function createSidebar() {
  const root = document.getElementById("sidebar-root");
  if (!root) return; // página não tem sidebar (ex: login, index) -> não faz nada

  // Descobre em qual página estamos, para marcar o item de menu ativo
  const currentPage = window.location.pathname.split("/").pop();

  // Estrutura de itens do menu (fácil de adicionar/remover uma opção aqui)
  const menuItems = [
    { label: "Dashboard", href: "dashboard-gerente.html", icon: "grid" },
    { label: "Alunos", href: "gerenciamento-alunos.html", icon: "file" },
    { label: "Relatórios", href: "relatorios.html", icon: "file" },
    { label: "Configurações", href: "settings.html", icon: "file" },
  ];

  const icons = {
    grid: '<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
    file: '<svg class="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  };

  // -------- monta <aside class="sidebar"> --------
  const sidebar = document.createElement("aside");
  sidebar.className = "sidebar";
  sidebar.id = "sidebar";

  const nav = document.createElement("nav");
  nav.className = "sidebar__menu";

  menuItems.forEach((item) => {
    const link = document.createElement("a");
    link.href = item.href;
    link.className =
      "menu-item" + (item.href === currentPage ? " is-active" : "");
    link.innerHTML = `${icons[item.icon]}${item.label}`;
    nav.appendChild(link);
  });

  const status = document.createElement("div");
  status.className = "sidebar__status";
  status.innerHTML = `
    <strong>STATUS DE RECURSOS</strong>
    <p>Estoque de merenda garantido para mais 12 dias letivos.</p>
  `;
  // $ SUBSTITUÍVEL — o texto acima é fixo (placeholder). Quando houver um
  // backend/banco de dados de verdade, troque por um valor vindo da API,
  // por exemplo: status.querySelector("p").textContent = dadosDaApi.estoqueRestante;

  sidebar.appendChild(nav);
  sidebar.appendChild(status);

  // -------- monta o botão de recolher/expandir --------
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "sidebar-toggle";
  toggleBtn.id = "sidebar-toggle";
  toggleBtn.setAttribute("aria-label", "Recolher menu lateral");
  toggleBtn.innerHTML =
    '<svg class="icon" viewBox="0 0 24 24" style="width:13px;height:13px;"><polyline points="15 18 9 12 15 6"/></svg>';

  toggleBtn.addEventListener("click", () => {
    const collapsed = sidebar.classList.toggle("is-collapsed");
    toggleBtn.setAttribute(
      "aria-label",
      collapsed ? "Expandir menu lateral" : "Recolher menu lateral",
    );
    toggleBtn.querySelector("svg").style.transform = collapsed
      ? "rotate(180deg)"
      : "rotate(0deg)";
  });

  // Insere sidebar + botão no lugar da div vazia <div id="sidebar-root">
  root.replaceWith(sidebar, toggleBtn);
}

/* ==========================================================================
   3. LÓGICA DE CADA PÁGINA
   Cada função abaixo só age se os elementos dela existirem na página atual.
   ========================================================================== */

/* -------------------- login.html -------------------- */
function initLogin() {
  const form = document.getElementById("login-form");
  if (!form) return; // não estamos na página de login

  const roleTabs = document.querySelectorAll(".role-tab");
  const passwordInput = document.getElementById("senha");
  const togglePasswordBtn = document.getElementById("toggle-password");

  // Alternância de perfil (Bolsista / Gerente) — só interface, não afeta login de verdade ainda
  roleTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      roleTabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
    });
  });

  // Mostrar/ocultar senha
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener("click", () => {
      const isHidden = passwordInput.type === "password";
      passwordInput.type = isHidden ? "text" : "password";
      togglePasswordBtn.textContent = isHidden ? "Ocultar" : "Mostrar";
    });
  }

  // ! LÓGICA DE BANCO DE DADOS (mock) — hoje o "login" só confere se os
  // campos não estão vazios e redireciona na hora, sem checar credenciais
  // de verdade. Quando existir um backend, troque o bloco abaixo por uma
  // chamada de API (ex: fetch("/api/login", {...})) que valida e-mail/senha
  // no banco de dados antes de redirecionar.
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = passwordInput.value.trim();
    const perfil = document.querySelector(".role-tab.is-active")?.dataset.role;

    if (!email || !senha) {
      alert("Preencha e-mail/CPF e senha para continuar.");
      return;
    }

    // $ SUBSTITUÍVEL — troque por resposta real da API de autenticação
    // ex: const resposta = await fetch("/api/login", { method: "POST", body: ... });
    // ! marca a sessão como logada — é isso que faz a guarda de
    // autenticação (topo do arquivo) parar de redirecionar pro login
    sessionStorage.setItem("pnae_logado", "true");

    const destino =
      perfil === "gerente"
        ? "dashboard-gerente.html"
        : "dashboard-bolsista.html";
    window.location.href = destino;
  });
}

/* -------------------- dashboard-bolsista.html -------------------- */
function initDashboardBolsista() {
  const confirmBtn = document.getElementById("confirm-delivery");
  const detailName = document.getElementById("detail-name");
  if (!confirmBtn || !detailName) return; // não estamos nesta página

  const rows = document.querySelectorAll(".student-row");
  const searchInput = document.getElementById("student-search");
  const detailBadge = document.getElementById("detail-badge");
  const detailAvatar = document.getElementById("detail-avatar");
  const detailMatricula = document.getElementById("detail-matricula");
  const detailSerie = document.getElementById("detail-serie");
  const detailResponsavel = document.getElementById("detail-responsavel");
  const detailRestricao = document.getElementById("detail-restricao");

  function initials(name) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("");
  }

  function renderStatus(status) {
    if (status === "delivered") {
      detailBadge.textContent = "Entregue";
      detailBadge.className = "badge badge--delivered";
      confirmBtn.innerHTML =
        '<svg class="icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Entrega Confirmada';
    } else {
      detailBadge.textContent = "Pendente Hoje";
      detailBadge.className = "badge badge--pending";
      confirmBtn.innerHTML =
        '<svg class="icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Confirmar Entrega de Lanche';
    }
  }

  function selectRow(row) {
    rows.forEach((r) => r.classList.remove("is-selected"));
    row.classList.add("is-selected");

    const { name, matricula, serie, responsavel, restricao, status } =
      row.dataset;
    detailName.textContent = name;
    detailAvatar.textContent = initials(name);
    detailMatricula.textContent = matricula;
    detailSerie.textContent = serie;
    detailResponsavel.textContent = responsavel;
    detailRestricao.textContent = restricao;
    detailRestricao.classList.toggle("text-danger", restricao !== "Nenhuma");
    renderStatus(status);
  }

  rows.forEach((row) => row.addEventListener("click", () => selectRow(row)));

  // ! LÓGICA DE BANCO DE DADOS (mock) — confirmar entrega hoje só muda a
  // classe/texto na tela (estado local). No backend real, este clique
  // deveria disparar algo como:
  // fetch(`/api/entregas/${selectedRow.dataset.id}`, { method: "PATCH", body: JSON.stringify({ status: "delivered" }) })
  confirmBtn.addEventListener("click", () => {
    const selectedRow = document.querySelector(".student-row.is-selected");
    if (!selectedRow) return;

    selectedRow.dataset.status = "delivered";
    selectedRow.querySelector(".col-status").innerHTML =
      '<span class="badge badge--delivered">Entregue</span>';
    renderStatus("delivered");
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const term = searchInput.value.trim().toLowerCase();
      rows.forEach((row) => {
        row.style.display = row.dataset.name.toLowerCase().includes(term)
          ? ""
          : "none";
      });
    });
  }
}

/* -------------------- dashboard-gerente.html -------------------- */
function initDashboardGerente() {
  const bars = document.querySelectorAll(".bar-chart__bar");
  if (bars.length === 0) return; // não estamos nesta página

  // Só uma animação de entrada — puramente visual, pode remover sem
  // afetar nenhuma lógica de dados.
  bars.forEach((bar) => {
    const targetHeight = bar.style.height;
    bar.style.height = "0px";
    requestAnimationFrame(() => {
      bar.style.transition = "height 0.6s ease";
      requestAnimationFrame(() => {
        bar.style.height = targetHeight;
      });
    });
  });
}

/* -------------------- gerenciamento-alunos.html -------------------- */

// ! LÓGICA DE BANCO DE DADOS (mock) — este array simula os dados que, no
// projeto final, devem vir de uma API/banco de dados
// (ex: const ALUNOS = await fetch("/api/alunos").then(r => r.json());)
// em vez de estarem escritos direto no código.
const ALUNOS = [
  {
    id: 102,
    nome: "Ana Clara Oliveira",
    serie: "6º Ano A",
    turma: "Matutino",
    matricula: "2024.089.011",
    status: "Ativo",
  },
  {
    id: 103,
    nome: "Bruno Henrique Santos",
    serie: "6º Ano A",
    turma: "Matutino",
    matricula: "2024.089.012",
    status: "Ativo",
  },
  {
    id: 104,
    nome: "Gabriel Souza Costa",
    serie: "7º Ano B",
    turma: "Matutino",
    matricula: "2024.089.013",
    status: "Ativo",
  },
  {
    id: 105,
    nome: "Julia Ferreira Lima",
    serie: "8º Ano C",
    turma: "Matutino",
    matricula: "2024.089.014",
    status: "Ativo",
  },
  {
    id: 106,
    nome: "Pedro Bial Vasconcellos",
    serie: "6º Ano B",
    turma: "Matutino",
    matricula: "2024.089.015",
    status: "Inativo",
  },
  {
    id: 107,
    nome: "Mariana Alvarenga",
    serie: "9º Ano A",
    turma: "Matutino",
    matricula: "2024.089.016",
    status: "Ativo",
  },
];

function iconEdit() {
  return '<svg class="icon" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>';
}
function iconTrash() {
  return '<svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>';
}

/* ! LÓGICA DE ADIÇÃO DE ELEMENTOS — esta função monta cada linha da tabela
   de alunos dinamicamente a partir do array ALUNOS (acima). Quando o array
   vier de uma API de verdade, esta função continua igual — só a origem do
   array muda. */
function renderAlunos(list) {
  const body = document.getElementById("alunos-body");
  if (!body) return;

  body.innerHTML = list
    .map(
      (aluno) => `
      <div class="alunos-row" data-id="${aluno.id}">
        <span class="col-num">${aluno.id}</span>
        <span class="col-nome">${aluno.nome}</span>
        <span class="col-serie">${aluno.serie}</span>
        <span class="col-turma">${aluno.turma}</span>
        <span class="col-matricula">${aluno.matricula}</span>
        <span class="col-status"><span class="badge ${aluno.status === "Ativo" ? "badge--delivered" : "badge--inactive"}">${aluno.status}</span></span>
        <span class="col-acoes row-actions">
          <button type="button" class="edit" title="Editar aluno" onclick="window.location.href='cadastro-aluno.html'">${iconEdit()}</button>
          <button type="button" class="delete" title="Remover aluno" data-remove="${aluno.id}">${iconTrash()}</button>
        </span>
      </div>`,
    )
    .join("");

  // ! LÓGICA DE BANCO DE DADOS (mock) — remover aqui só tira do array em
  // memória. No backend real: fetch(`/api/alunos/${id}`, { method: "DELETE" })
  body.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.remove);
      if (confirm("Remover este aluno da base de dados?")) {
        const index = ALUNOS.findIndex((a) => a.id === id);
        if (index > -1) ALUNOS.splice(index, 1);
        renderAlunos(ALUNOS);
      }
    });
  });
}

function initGerenciamentoAlunos() {
  const body = document.getElementById("alunos-body");
  if (!body) return; // não estamos nesta página

  renderAlunos(ALUNOS);

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const term = searchInput.value.trim().toLowerCase();
      renderAlunos(
        ALUNOS.filter(
          (a) =>
            a.nome.toLowerCase().includes(term) ||
            a.serie.toLowerCase().includes(term) ||
            a.matricula.toLowerCase().includes(term),
        ),
      );
    });
  }
}

/* -------------------- cadastro-aluno.html -------------------- */
function initCadastroAluno() {
  const form = document.getElementById("cadastro-form");
  if (!form) return; // não estamos nesta página

  const nascimento = document.getElementById("nascimento");
  const telefone = document.getElementById("telefone");

  if (nascimento) {
    nascimento.addEventListener("input", () => {
      let v = nascimento.value.replace(/\D/g, "").slice(0, 8);
      if (v.length > 4) v = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
      else if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
      nascimento.value = v;
    });
  }

  if (telefone) {
    telefone.addEventListener("input", () => {
      let v = telefone.value.replace(/\D/g, "").slice(0, 11);
      if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
      else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
      telefone.value = v;
    });
  }

  // ! LÓGICA DE BANCO DE DADOS (mock) — hoje só valida e redireciona. No
  // backend real: fetch("/api/alunos", { method: "POST", body: JSON.stringify(dadosDoForm) })
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    alert("Registro do aluno salvo com sucesso.");
    window.location.href = "gerenciamento-alunos.html";
  });
}

/* -------------------- relatorios.html -------------------- */
function initRelatorios() {
  const exportPdfBtn = document.getElementById("export-pdf");
  if (!exportPdfBtn) return; // não estamos nesta página

  // $ SUBSTITUÍVEL — hoje só mostra um alert. No backend real, cada botão
  // chamaria uma rota que gera o arquivo de verdade, ex:
  // window.location.href = "/api/relatorios/exportar?formato=pdf";
  function exportar(tipo) {
    alert(
      `Geração de ${tipo} iniciada. O arquivo será disponibilizado para download em instantes.`,
    );
  }

  exportPdfBtn.addEventListener("click", () => exportar("PDF"));
  document
    .getElementById("export-csv")
    ?.addEventListener("click", () => exportar("CSV"));
  document
    .getElementById("export-excel")
    ?.addEventListener("click", () => exportar("Excel"));

  document.querySelectorAll(".hbar-fill").forEach((bar) => {
    const target = bar.style.width;
    bar.style.width = "0%";
    requestAnimationFrame(() => {
      bar.style.transition = "width 0.6s ease";
      requestAnimationFrame(() => {
        bar.style.width = target;
      });
    });
  });
}

/* -------------------- settings.html -------------------- */
function initSettings() {
  const form = document.getElementById("account-form");
  if (!form) return; // não estamos nesta página

  const novaSenha = document.getElementById("nova-senha");
  const confirmarSenha = document.getElementById("confirmar-senha");
  const reportBtn = document.querySelector(".report-btn");

  // ! LÓGICA DE BANCO DE DADOS (mock) — no backend real:
  // fetch("/api/usuario", { method: "PATCH", body: JSON.stringify({ nome, email, novaSenha }) })
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (novaSenha.value || confirmarSenha.value) {
      if (novaSenha.value !== confirmarSenha.value) {
        alert("A nova senha e a confirmação não coincidem.");
        return;
      }
      if (novaSenha.value.length < 8) {
        alert("A nova senha deve ter no mínimo 8 caracteres.");
        return;
      }
    }
    alert("Alterações salvas com sucesso.");
  });

  if (reportBtn) {
    reportBtn.addEventListener("click", () => {
      alert("Um chamado técnico foi aberto para a equipe de suporte do PNAE.");
    });
  }
}

/* -------------------- index.html (landing) -------------------- */
function initLanding() {
  const anchors = document.querySelectorAll('a[href^="#"]');
  if (anchors.length === 0) return;

  anchors.forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.getElementById(
        link.getAttribute("href").slice(1),
      );
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

/* ==========================================================================
   4. INIT — roda o bootstrap e, em seguida, todas as funções de página.
   Cada função de página verifica sozinha se deve agir ou não, então é
   seguro chamar todas elas em toda página.
   ========================================================================== */

async function init() {
  // ! se a guarda de autenticação (topo do arquivo) já decidiu redirecionar
  // pro login, não faz sentido continuar montando a página protegida —
  // evita trabalho desnecessário e qualquer "piscada" de conteúdo.
  if (!paginaEhPublica && !isLoggedIn()) return;

  await add_element(); // ! injeta o CSS (ver comentário na função acima)

  createSidebar(); // ! monta a sidebar via JS, se houver #sidebar-root

  initLogin();
  initDashboardBolsista();
  initDashboardGerente();
  initGerenciamentoAlunos();
  initCadastroAluno();
  initRelatorios();
  initSettings();
  initThemeToggle();
  initLanding();
}

init();

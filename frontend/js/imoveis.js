/* =========================
   Dados Simulados
   ========================= */
const IMOVEIS_DATA = [
  {
    id: 1,
    titulo: "Vila Nova, São Paulo/SP",
    preco: 900,
    imagem: "/frontend/image/imovel1.jpg",
    descricao: "Casa térrea com 2 quartos, 1 banheiro e 1 vaga.",
    tipo: "Casa",
    forma: "ALUGAR",
    local: "São Paulo (SP)",
    estado: "SP",
    cidade: "São Paulo",
    quartos: 2,
    banheiros: 1,
    vagas: 1,
    caracteristicas: ["Aceita pets"],
  },
  {
    id: 2,
    titulo: "Jardim das Flores, Curitiba/PR",
    preco: 1500,
    imagem: "/frontend/image/imovel2.jpg",
    descricao: "Sobrado com 4 quartos e área total de 60m².",
    tipo: "Casa",
    forma: "ALUGAR",
    local: "Curitiba (PR)",
    estado: "PR",
    cidade: "Curitiba",
    quartos: 4,
    banheiros: 2,
    vagas: 2,
    caracteristicas: ["Varanda"],
  },
  {
    id: 3,
    titulo: "Centro, Curitiba/PR",
    preco: 420000,
    imagem: "/frontend/image/imovel3.jpg",
    descricao: "Apartamento moderno, 2 quartos e varanda gourmet.",
    tipo: "Apartamento",
    forma: "COMPRAR",
    local: "Curitiba (PR)",
    estado: "PR",
    cidade: "Curitiba",
    quartos: 2,
    banheiros: 1,
    vagas: 1,
    caracteristicas: ["Portaria 24h"],
  },
  {
    id: 4,
    titulo: "Zona Sul, São Paulo/SP",
    preco: 520000,
    imagem: "/frontend/image/imovel4.jpg",
    descricao: "Apartamento espaçoso com 3 quartos e garagem.",
    tipo: "Apartamento",
    forma: "COMPRAR",
    local: "São Paulo (SP)",
    estado: "SP",
    cidade: "São Paulo",
    quartos: 3,
    banheiros: 2,
    vagas: 2,
    caracteristicas: ["Piscina", "Mobiliado"],
  },
  {
    id: 5,
    titulo: "Terreno em Atibaia/SP",
    preco: 80000,
    imagem: "/frontend/image/imovel5.jpg",
    descricao: "Terreno de 500m² para lazer.",
    tipo: "Terreno",
    forma: "COMPRAR",
    local: "Atibaia (SP)",
    estado: "SP",
    cidade: "Atibaia",
    quartos: 0,
    banheiros: 0,
    vagas: 0,
    caracteristicas: [],
  },
  {
    id: 6,
    titulo: "Kitnet Prox. Metrô, Rio de Janeiro/RJ",
    preco: 1100,
    imagem: "/frontend/image/imovel6.jpg",
    descricao: "Kitnet mobiliada, ideal para estudantes.",
    tipo: "Kitnet/Conjugado",
    forma: "ALUGAR",
    local: "Rio de Janeiro (RJ)",
    estado: "RJ",
    cidade: "Rio de Janeiro",
    quartos: 1,
    banheiros: 1,
    vagas: 0,
    caracteristicas: ["Mobiliado"],
  },
];

/* =========================
   Seletores e Variáveis
   ========================= */
const sidebar = document.querySelector(".sidebar");
const searchInput = document.getElementById("search-input");
const btnLimparFiltros = document.querySelector('.btn[style*="border:1px solid #ccc"]');
const navbar = document.querySelector(".navbar");

let ultimaPosicaoScroll = 0;

/* =========================
   Util: pegar seção da sidebar por título (retorna array de elementos até o próximo H3)
   ========================= */
function getSectionElements(title) {
  if (!sidebar) return [];
  const headers = Array.from(sidebar.querySelectorAll("h3"));
  const header = headers.find((h) => h.textContent.trim() === title);
  if (!header) return [];

  const collected = [];
  let node = header.nextElementSibling;
  while (node && node.tagName !== "H3") {
    collected.push(node);
    node = node.nextElementSibling;
  }
  return collected;
}

/* =========================
   DOMContentLoaded -> Inicialização
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  // Lê parâmetros iniciais da URL (opcional)
  const params = new URLSearchParams(window.location.search);
  const estado = params.get("estado") || "";
  const cidade = params.get("cidade") || "";
  const tipo = params.get("tipo") || "";
  const forma = params.get("forma") || "";

  const filtrosIniciais = { estado, cidade, tipo, forma };

  carregarImoveis(filtrosIniciais);

  setupFiltrosInterativos();

  if (btnLimparFiltros) {
    btnLimparFiltros.addEventListener("click", limparFiltros);
  }
});

/* =========================
   Ler filtros ativos da sidebar + busca
   Retorna um objeto com os filtros aplicados
   ========================= */
function getFiltrosAtivos() {
  const filtros = {};
  if (!sidebar) return filtros;

  // 1) Tipos (checkboxes na seção "Tipo de imóvel")
  const tipoSectionElems = getSectionElements("Tipo de imóvel");
  const tipoCheckboxes = tipoSectionElems.flatMap((el) =>
    Array.from(el.querySelectorAll ? el.querySelectorAll('input[type="checkbox"]') : [])
  );
  const tiposChecked = tipoCheckboxes
    .filter((cb) => cb.checked)
    .map((cb) => cb.parentNode.textContent.trim().toLowerCase());
  if (tiposChecked.length > 0) filtros.tipos = tiposChecked;

  // 2) Quartos / Banheiros / Vagas (botões dentro de .filter-buttons)
  const mapCampos = { quartos: "Quartos", banheiros: "Banheiros", vagas: "Vagas" };
  Object.entries(mapCampos).forEach(([key, tituloExibicao]) => {
    const h3 = Array.from(sidebar.querySelectorAll("h3")).find(
      (el) => el.textContent.trim() === tituloExibicao
    );
    if (h3 && h3.nextElementSibling && h3.nextElementSibling.classList.contains("filter-buttons")) {
      const botaoAtivo = h3.nextElementSibling.querySelector("button.active");
      if (botaoAtivo) filtros[key] = parseInt(botaoAtivo.textContent.replace("+", ""), 10);
    }
  });

  // 3) Preço mínimo / máximo
  const priceElems = getSectionElements("Preço");
  let priceInputs = [];
  if (priceElems.length > 0) {
    priceInputs = Array.from(priceElems[0].querySelectorAll("input[type='number']"));
  } else {
    priceInputs = sidebar.querySelectorAll(".price-inputs input[type='number']");
  }
  if (priceInputs && priceInputs.length >= 2) {
    const minVal = parseFloat(priceInputs[0].value);
    const maxVal = parseFloat(priceInputs[1].value);
    if (!isNaN(minVal)) filtros.precoMin = minVal;
    if (!isNaN(maxVal)) filtros.precoMax = maxVal;
  }

  // 4) Localização (input de texto)
  const locElems = getSectionElements("Localização");
  if (locElems.length > 0) {
    const locInput = locElems[0].tagName === "INPUT" ? locElems[0] : locElems[0].querySelector("input, textarea");
    if (locInput && locInput.value && locInput.value.trim() !== "") {
      filtros.localizacao = locInput.value.trim().toLowerCase();
    }
  }

  // 5) Características (checkboxes na seção)
  const caracElems = getSectionElements("Características");
  const caracCheckboxes = caracElems.flatMap((el) =>
    Array.from(el.querySelectorAll ? el.querySelectorAll('input[type="checkbox"]') : [])
  );
  const checkedCarac = caracCheckboxes
    .filter((cb) => cb.checked)
    .map((cb) => cb.parentNode.textContent.trim().toLowerCase());
  if (checkedCarac.length > 0) filtros.caracteristicas = checkedCarac;

  // 6) Busca geral (barra superior)
  filtros.busca = (searchInput?.value || "").toLowerCase().trim();

  return filtros;
}

/* =========================
  Carregar e renderizar imóveis (com filtros aplicados)
   ========================= */
async function carregarImoveis(filtrosIniciais = {}) {
  const lista = document.getElementById("imoveis-lista");
  if (!lista) {
    console.error("Elemento #imoveis-lista não encontrado.");
    return;
  }

  lista.innerHTML = "";

  // Pegamos os filtros da sidebar + busca
  const filtrosSidebar = getFiltrosAtivos();
  const filtros = { ...filtrosIniciais, ...filtrosSidebar };

  // Carrega a fonte de dados (aqui usamos a simulação)
  const imoveis = IMOVEIS_DATA;

  // Filtra localmente conforme critérios
  const filtrados = imoveis.filter((imovel) => {
    const titulo = (imovel.titulo || "").toLowerCase();
    const descricao = (imovel.descricao || "").toLowerCase();
    const local = (imovel.local || "").toLowerCase();
    const tipoLower = (imovel.tipo || "").toLowerCase();
    const caracteristicasLower = (imovel.caracteristicas || []).map((c) => (c || "").toLowerCase());

    // filtros iniciais (url)
    const matchEstado = !filtros.estado || (imovel.estado || "").toLowerCase() === filtros.estado.toLowerCase();
    const matchCidade = !filtros.cidade || (imovel.cidade || "").toLowerCase().includes(filtros.cidade.toLowerCase());
    const matchForma = !filtros.forma || (imovel.forma || "").toLowerCase() === filtros.forma.toLowerCase();

    // tipo
    const matchTipos = !filtros.tipos || filtros.tipos.includes(tipoLower);

    // contagens
    const matchQuartos = !filtros.quartos || (imovel.quartos >= filtros.quartos);
    const matchBanheiros = !filtros.banheiros || (imovel.banheiros >= filtros.banheiros);
    const matchVagas = !filtros.vagas || (imovel.vagas >= filtros.vagas);

    // preço
    const matchPrecoMin = !filtros.precoMin || (imovel.preco >= filtros.precoMin);
    const matchPrecoMax = !filtros.precoMax || (imovel.preco <= filtros.precoMax);

    // localização (input)
    const matchLocalizacao = !filtros.localizacao || local.includes(filtros.localizacao);

    // características (todas as selecionadas devem existir no imóvel)
    let matchCaracteristicas = true;
    if (filtros.caracteristicas && filtros.caracteristicas.length > 0) {
      matchCaracteristicas = filtros.caracteristicas.every((c) =>
        caracteristicasLower.includes(c.toLowerCase())
      );
    }

    // busca geral (título, descrição, local, tipo)
    const busca = filtros.busca || "";
    const matchBusca = !busca ||
      titulo.includes(busca) ||
      descricao.includes(busca) ||
      local.includes(busca) ||
      tipoLower.includes(busca);

    return (
      matchEstado &&
      matchCidade &&
      matchForma &&
      matchTipos &&
      matchQuartos &&
      matchBanheiros &&
      matchVagas &&
      matchPrecoMin &&
      matchPrecoMax &&
      matchLocalizacao &&
      matchCaracteristicas &&
      matchBusca
    );
  });

  if (filtrados.length === 0) {
    lista.innerHTML = "<p class='sem-resultados'>Nenhum imóvel encontrado.</p>";
    return;
  }

  filtrados.forEach((imovel) => {
    const card = document.createElement("div");
    card.className = "imovel-card";
    card.dataset.tipo = imovel.tipo;

    card.innerHTML = `
      <img src="${imovel.imagem}" alt="${imovel.titulo}">
      <div class="card-content">
        <div>
          <p>${imovel.descricao}</p>
          <h4 class="localizacao">${imovel.titulo}</h4>
        </div>
        <div class="card-footer">
          <span class="preco">R$ ${imovel.preco.toLocaleString("pt-BR")}${imovel.forma === "ALUGAR" ? ",00 / mês" : ""}</span>
          <div class="icones">
            <i class="bi bi-whatsapp" title="Contato WhatsApp" data-whatsapp="5599999999999"></i>
            <i class="bi bi-bookmark" title="Salvar nos favoritos"></i>
          </div>
        </div>
      </div>
    `;

    // Torna o card clicável e redireciona para detalhes
    card.style.cursor = "pointer";
    card.addEventListener("click", (e) => {
      // evita que clique em ícones dispare o redirecionamento
      if (e.target.closest(".icones")) return;
      window.location.href = `/frontend/detalhes_imovel.html?id=${imovel.id}`;
    });

    lista.appendChild(card);
  });
}

/* =========================
   Aplicar / Limpar filtros
   ========================= */
function aplicarFiltros() {
  carregarImoveis({});
}

function limparFiltros() {
  if (!sidebar) return;

  // Limpa checkboxes e inputs
  sidebar.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
  sidebar.querySelectorAll('input[type="number"], input[type="text"]').forEach((input) => (input.value = ""));

  // Limpa busca
  if (searchInput) searchInput.value = "";

  // Limpa botões ativos
  sidebar.querySelectorAll(".filter-buttons button").forEach((btn) => btn.classList.remove("active"));

  // Recarrega
  carregarImoveis({});
}

/* =========================
Interações da sidebar e busca
   ========================= */
function setupFiltrosInterativos() {
  if (!sidebar) return;

  // botões (quartos, banheiros, vagas)
  sidebar.querySelectorAll(".filter-buttons button").forEach((button) => {
    button.addEventListener("click", function () {
      const group = this.closest(".filter-buttons");
      if (this.classList.contains("active")) {
        this.classList.remove("active");
      } else {
        group.querySelectorAll("button").forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");
      }
      aplicarFiltros();
    });
  });

  // checkboxes / price inputs -> change
  sidebar.addEventListener("change", (e) => {
    if (e.target.type === "checkbox" || e.target.closest(".price-inputs")) {
      aplicarFiltros();
    }
  });

  // localização (input)
  const locElems = getSectionElements("Localização");
  if (locElems.length > 0) {
    const locInput = locElems[0].tagName === "INPUT" ? locElems[0] : locElems[0].querySelector("input, textarea");
    if (locInput) locInput.addEventListener("input", aplicarFiltros);
  } else {
    const fallbackLoc = Array.from(sidebar.querySelectorAll("h3")).find((el) => el.textContent.trim() === "Localização")?.nextElementSibling;
    if (fallbackLoc && fallbackLoc.addEventListener) fallbackLoc.addEventListener("input", aplicarFiltros);
  }

  // busca superior
  if (searchInput) {
    searchInput.addEventListener("input", aplicarFiltros);
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        aplicarFiltros();
      }
    });
  }
}

/* =========================
   Navbar: esconder no scroll
   ========================= */
window.addEventListener("scroll", () => {
  if (!navbar) return;
  const posicaoAtual = window.scrollY;
  if (posicaoAtual > ultimaPosicaoScroll) {
    navbar.style.top = "-80px";
  } else {
    navbar.style.top = "0";
  }
  ultimaPosicaoScroll = posicaoAtual;
});

/* =========================
   Redirecionamento dos links ALUGAR / COMPRAR do header
   ========================= */
document.querySelectorAll("nav a").forEach((link) => {
  const texto = link.textContent.trim().toUpperCase();
  if (texto === "ALUGAR") {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/frontend/imoveis.html?forma=ALUGAR";
    });
  }
  if (texto === "COMPRAR") {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/frontend/imoveis.html?forma=COMPRAR";
    });
  }
});

/* =========================
   Modal de login e ícones (WhatsApp e Favoritos)
   ========================= */
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("modal-login");
  const closeModal = document.querySelector(".modal-close");

  // Simula se o usuário está logado (coloque lógica real do back aqui)
  const usuarioLogado = false;

  // Clique global para ícones
  document.body.addEventListener("click", function (e) {
    // WhatsApp
    if (e.target.classList.contains("bi-whatsapp")) {
      const numero = e.target.dataset.whatsapp || "5599999999999";
      window.open(`https://wa.me/${numero}`, "_blank");
      return;
    }

    // Favoritos
    if (e.target.classList.contains("bi-bookmark") || e.target.classList.contains("bi-bookmark-fill")) {
      if (usuarioLogado) {
        e.target.classList.toggle("bi-bookmark");
        e.target.classList.toggle("bi-bookmark-fill");
        e.target.classList.toggle("favorito-ativo");
        // TODO: chamar API para salvar/remover favorito
        console.log("Simulação: favorito alternado");
      } else {
        if (modal) modal.style.display = "flex";
      }
    }
  });

  // fecha modal
  if (closeModal) {
    closeModal.addEventListener("click", () => {
      if (modal) modal.style.display = "none";
    });
  }

  // fechar clicando fora
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  }
});

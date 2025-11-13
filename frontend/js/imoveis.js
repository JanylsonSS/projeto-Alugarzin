// Dados de Imóveis Simulados (EXPANDIDOS com mais detalhes para os novos filtros)
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

const sidebar = document.querySelector(".sidebar");
const searchInput = document.getElementById("search-input");
const btnLimparFiltros = document.querySelector(
  '.btn[style*="border:1px solid #ccc"]'
);
const navbar = document.querySelector(".navbar"); // Certifica que navbar está definida

// Variável para a lógica de esconder/mostrar a navbar
let ultimaPosicaoScroll = 0;

document.addEventListener("DOMContentLoaded", () => {
  // Lê os parâmetros da URL vindos da index.html
  const params = new URLSearchParams(window.location.search);
  const estado = params.get("estado") || "";
  const cidade = params.get("cidade") || "";
  const tipo = params.get("tipo") || "";
  const forma = params.get("forma") || "";

  // Salva os filtros iniciais
  const filtrosIniciais = { estado, cidade, tipo, forma };

  // Carrega imóveis já com filtros aplicados
  carregarImoveis(filtrosIniciais);

  setupFiltrosInterativos(); // Configura eventos para filtros da sidebar e busca
  btnLimparFiltros.addEventListener("click", limparFiltros);
});

// ------------------------------------------------------------------

function getFiltrosAtivos() {
  const filtros = {};

  // 1. Tipos
  const tipos = Array.from(
    sidebar.querySelectorAll(
      'h3:nth-child(1) ~ label input[type="checkbox"]:checked'
    )
  ).map((cb) => cb.parentNode.textContent.trim().toLowerCase());
  if (tipos.length > 0) filtros.tipos = tipos;

  // 2. Quartos, Banheiros, Vagas
  ["Quartos", "Banheiros", "Vagas"].forEach((key) => {
    const keyLower = key.toLowerCase();

    const h3Element = Array.from(sidebar.querySelectorAll("h3")).find(
      (el) => el.textContent === key
    );
    if (
      h3Element &&
      h3Element.nextElementSibling.classList.contains("filter-buttons")
    ) {
      const botaoAtivo =
        h3Element.nextElementSibling.querySelector("button.active");
      if (botaoAtivo) {
        // Remove o '+' e converte para número (Ex: "3+" -> 3)
        filtros[keyLower] = parseInt(botaoAtivo.textContent.replace("+", ""));
      }
    }
  });

  // 3. Preço
  const priceInputs = sidebar
    .querySelector(".price-inputs")
    ?.querySelectorAll('input[type="number"]');

  let precoMin = NaN;
  let precoMax = NaN;

  if (priceInputs && priceInputs.length >= 2) {
    precoMin = parseFloat(priceInputs[0].value);
    precoMax = parseFloat(priceInputs[1].value);
  }

  if (!isNaN(precoMin)) filtros.precoMin = precoMin;
  if (!isNaN(precoMax)) filtros.precoMax = precoMax;

  // 4. Localização
  const locInput = Array.from(sidebar.querySelectorAll("h3")).find(
    (el) => el.textContent === "Localização"
  )?.nextElementSibling;
  const localizacao = locInput?.value.trim();
  if (localizacao) filtros.localizacao = localizacao.toLowerCase();

  // 5. Características
  const caracteristicas = Array.from(sidebar.querySelectorAll("h3")).find(
    (el) => el.textContent === "Características"
  );
  if (caracteristicas) {
    const checkedCarac = Array.from(
      caracteristicas.parentElement.querySelectorAll(
        'label input[type="checkbox"]:checked'
      )
    ).map((cb) => cb.parentNode.textContent.trim());
    if (checkedCarac.length > 0) filtros.caracteristicas = checkedCarac;
  }

  // 6. Busca Geral (Lê o valor do input de busca)
  filtros.busca = searchInput.value.toLowerCase().trim();

  return filtros;
}

// ------------------------------------------------------------------

async function carregarImoveis(filtrosIniciais = {}) {
  const lista = document.getElementById("imoveis-lista");
  // Verifica se o elemento lista existe
  if (!lista) {
    console.error("Elemento #imoveis-lista não encontrado no DOM.");
    return;
  }
  lista.innerHTML = "";

  const filtrosSidebar = getFiltrosAtivos();
  const filtros = { ...filtrosIniciais, ...filtrosSidebar };

  // Usa a lista de simulação
  const imoveis = IMOVEIS_DATA;

  // Filtros feitos diretamente no navegador.
  const filtrados = imoveis.filter((imovel) => {
    const imovelTitulo = imovel.titulo.toLowerCase();
    const imovelDescricao = imovel.descricao.toLowerCase();
    const imovelLocal = imovel.local.toLowerCase();

    // 1. Filtros Iniciais
    const matchEstado =
      !filtros.estado ||
      imovel.estado?.toLowerCase() === filtros.estado.toLowerCase();
    const matchCidade =
      !filtros.cidade ||
      imovel.cidade?.toLowerCase().includes(filtros.cidade.toLowerCase());
    const matchForma =
      !filtros.forma ||
      imovel.forma.toLowerCase() === filtros.forma.toLowerCase();

    // 2. Filtro de Tipo
    const matchTipos =
      !filtros.tipos || filtros.tipos.includes(imovel.tipo.toLowerCase());

    // 3. Filtro de Contagem
    const matchQuartos = !filtros.quartos || imovel.quartos >= filtros.quartos;
    const matchBanheiros =
      !filtros.banheiros || imovel.banheiros >= filtros.banheiros;
    const matchVagas = !filtros.vagas || imovel.vagas >= filtros.vagas;

    // 4. Filtro de Preço
    const matchPrecoMin = !filtros.precoMin || imovel.preco >= filtros.precoMin;
    const matchPrecoMax = !filtros.precoMax || imovel.preco <= filtros.precoMax;

    // 5. Filtro de Localização
    const matchLocalizacao =
      !filtros.localizacao || imovelLocal.includes(filtros.localizacao);

    // 6. Filtro de Características
    let matchCaracteristicas = true;
    if (filtros.caracteristicas) {
      // Verifica se CADA característica selecionada está presente no imóvel
      matchCaracteristicas = filtros.caracteristicas.every((caracFiltro) =>
        imovel.caracteristicas.includes(caracFiltro)
      );
    }

    // 7. Busca Geral
    const matchBuscaGeral =
      !filtros.busca ||
      imovelTitulo.includes(filtros.busca) ||
      imovelDescricao.includes(filtros.busca) ||
      imovelLocal.includes(filtros.busca) ||
      imovel.tipo.toLowerCase().includes(filtros.busca);

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
      matchBuscaGeral
    );
  });

  // Mostra os imóveis filtrados na tela.
  if (filtrados.length === 0) {
    lista.innerHTML = "<p class='sem-resultados'>Nenhum imóvel encontrado.</p>";
    return;
  }

  // Código de renderização
  filtrados.forEach((imovel) => {
    const card = document.createElement("div");
    card.className = "imovel-card";
    card.dataset.tipo = imovel.tipo; // Adiciona o tipo ao dataset para o filtro de busca

    card.innerHTML = `
                <img src="${imovel.imagem}" alt="${imovel.titulo}">
                <div class="card-content">
                    <div>
                        <p>${imovel.descricao}</p>
                        <h4 class="localizacao">${imovel.titulo}</h4>
                    </div>
                    <div class="card-footer">
                        <span class="preco">R$ ${imovel.preco.toLocaleString(
                          "pt-BR"
                        )}${imovel.forma === "ALUGAR" ? ",00 / mês" : ""}</span>
                        <div class="icones">
                            <i class="bi bi-whatsapp title="Contato WhatsApp" text-success"></i>
                            <i class="bi bi-bookmark title="Salvar nos favoritos" text-warning"></i>
                        </div>
                    </div>
                </div>
            `;
    lista.appendChild(card);
  });
}

// ------------------------------------------------------------------

function aplicarFiltros() {
  // Esta função simplifica a aplicação de filtros em resposta a qualquer evento.
  carregarImoveis({});
}

function limparFiltros() {
  // 1. Limpa Checkboxes e Inputs
  sidebar
    .querySelectorAll('input[type="checkbox"]')
    .forEach((cb) => (cb.checked = false));
  sidebar
    .querySelectorAll('input[type="number"], input[type="text"]')
    .forEach((input) => (input.value = ""));
  searchInput.value = "";

  // 2. Limpa botões ativos
  sidebar
    .querySelectorAll(".filter-buttons button")
    .forEach((btn) => btn.classList.remove("active"));

  // 3. Recarrega os imóveis
  carregarImoveis({});
}

// ------------------------------------------------------------------

function setupFiltrosInterativos() {
  sidebar.querySelectorAll(".filter-buttons button").forEach((button) => {
    button.addEventListener("click", function () {
      const group = this.closest(".filter-buttons");

      if (this.classList.contains("active")) {
        this.classList.remove("active");
      } else {
        group
          .querySelectorAll("button")
          .forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");
      }

      // Aplica o filtro após a seleção
      aplicarFiltros();
    });
  });

  sidebar.addEventListener("change", (e) => {
    if (e.target.type === "checkbox" || e.target.closest(".price-inputs")) {
      aplicarFiltros();
    }
  });

  const locInput = Array.from(sidebar.querySelectorAll("h3")).find(
    (el) => el.textContent === "Localização"
  )?.nextElementSibling;
  if (locInput) {
    locInput.addEventListener("input", aplicarFiltros);
  }

  // ===============================================================
  // BARRA DE PESQUISA GERAL
  // ===============================================================

  // Aplica filtros ao digitar
  searchInput.addEventListener("input", aplicarFiltros);

  // Aplica filtros ao pressionar 'Enter'
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Impede o envio de formulário padrão
      aplicarFiltros();
    }
  });
}

// ------------------------------------------------------------------

// Oculta a navbar quando o usuário rola para baixo
window.addEventListener("scroll", () => {
  // Certifique-se que o elemento navbar existe antes de manipular
  if (!navbar) return;

  const posicaoAtual = window.scrollY;

  if (posicaoAtual > ultimaPosicaoScroll) {
    navbar.style.top = "-80px";
  } else {
    navbar.style.top = "0";
  }

  ultimaPosicaoScroll = posicaoAtual;
});

// --- Redirecionamento dos botões ALUGAR e COMPRAR do cabeçalho ---
document.querySelectorAll("nav a").forEach((link) => {
  if (link.textContent.trim().toUpperCase() === "ALUGAR") {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/frontend/imoveis.html?forma=ALUGAR";
    });
  }

  if (link.textContent.trim().toUpperCase() === "COMPRAR") {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/frontend/imoveis.html?forma=COMPRAR";
    });
  }
});

// ------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("modal-login");
  const closeModal = document.querySelector(".modal-close");

  // Simula se o usuário está logado
  const usuarioLogado = false; // Alterar para true se o back identificar sessão ativa

  // Evento global para ícones de WhatsApp e Favoritos
  document.body.addEventListener("click", function (e) {
    // --- ÍCONE WHATSAPP ---
    if (e.target.classList.contains("bi-whatsapp")) {
      const numero = e.target.dataset.whatsapp || "5599999999999"; // Substituir pelo número real do anunciante (do back)
      window.open(`https://wa.me/${numero}`, "_blank");
    }

    // --- ÍCONE FAVORITOS ---
    if (
      e.target.classList.contains("bi-bookmark") ||
      e.target.classList.contains("bi-bookmark-fill")
    ) {
      if (usuarioLogado) {
        // Alterna a classe entre bi-bookmark e bi-bookmark-fill, e aplica favorito-ativo
        e.target.classList.toggle("bi-bookmark");
        e.target.classList.toggle("bi-bookmark-fill");
        e.target.classList.toggle("favorito-ativo");
        // Aqui o back deve salvar/remover o imóvel dos favoritos
        console.log("Imóvel favoritado/desfavoritado (simulação)");
      } else {
        // Verifica se o modal existe antes de tentar abrir
        if (modal) {
          modal.style.display = "flex"; // abre o modal
        }
      }
    }
  });

  // Fecha o modal
  if (closeModal) {
    closeModal.addEventListener("click", () => {
      if (modal) modal.style.display = "none";
    });
  }

  // Fecha clicando fora
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  }
});

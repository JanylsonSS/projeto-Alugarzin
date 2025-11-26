// Module: imoveis listing (API-driven)
import { renderizarHeaderPerfil, carregarImovelsDoBanco, renderizarCardImovel } from '/frontend/js/auth-handler.js';

let IMOVEIS_CACHE = [];

document.addEventListener('DOMContentLoaded', async () => {
    try { await renderizarHeaderPerfil('#userBox', '.btn-login', '.btn-criar-conta'); } catch (e) { console.warn('header render:', e); }

    const listaEl = document.getElementById('imoveis-lista');
    const searchInput = document.getElementById('search-input');
    const sidebar = document.querySelector('.sidebar');
    const navbar = document.querySelector('.navbar');

    if (!listaEl) return console.error('#imoveis-lista not found');

    IMOVEIS_CACHE = await carregarImovelsDoBanco();
    renderLista(IMOVEIS_CACHE);

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const q = (e.target.value || '').trim().toLowerCase();
            const filtrados = IMOVEIS_CACHE.filter(i => {
                const titulo = (i.titulo||'').toLowerCase();
                const descricao = (i.descricao||'').toLowerCase();
                const cidade = (i.cidade||'').toLowerCase();
                return titulo.includes(q) || descricao.includes(q) || cidade.includes(q);
            });
            renderLista(filtrados);
        });
    }

    // Minimal sidebar interaction (no backend filtering yet)
    try {
        if (sidebar) sidebar.querySelectorAll('.filter-buttons button').forEach(btn => btn.addEventListener('click', () => {
            btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }));
    } catch (err) { console.warn('sidebar init', err); }

    // Navbar hide on scroll
    let ultimaPos = 0;
    window.addEventListener('scroll', () => {
        if (!navbar) return;
        const pos = window.scrollY;
        navbar.style.top = pos > ultimaPos ? '-80px' : '0';
        ultimaPos = pos;
    });

    // Icon handlers and modal
    const modal = document.getElementById('modal-login');
    const closeModal = document.querySelector('.modal-close');
    document.body.addEventListener('click', (e) => {
        const t = e.target;
        if (!t) return;
        if (t.classList && (t.classList.contains('bi-whatsapp') || t.closest('.bi-whatsapp'))) {
            const el = t.closest('[data-whatsapp]') || t;
            const numero = el.dataset?.whatsapp || '5599999999999';
            window.open(`https://wa.me/${numero}`, '_blank');
        }
        if (t.classList && (t.classList.contains('bi-bookmark') || t.classList.contains('bi-bookmark-fill'))) {
            const usuarioLogado = !!localStorage.getItem('token');
            if (!usuarioLogado) { if (modal) modal.style.display = 'flex'; }
            else { t.classList.toggle('bi-bookmark'); t.classList.toggle('bi-bookmark-fill'); t.classList.toggle('favorito-ativo'); }
        }
    });
    if (closeModal) closeModal.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
});

function renderLista(lista) {
    const container = document.getElementById('imoveis-lista');
    if (!container) return;
    container.innerHTML = '';
    if (!Array.isArray(lista) || lista.length === 0) {
        container.innerHTML = "<p class='sem-resultados'>Nenhum imóvel encontrado.</p>";
        return;
    }
    lista.forEach(imovel => {
        const wrapper = document.createElement('div');
        wrapper.className = 'card-wrapper';
        wrapper.innerHTML = renderizarCardImovel(imovel);
        container.appendChild(wrapper);
    });
}
import { renderizarHeaderPerfil, carregarImovelsDoBanco, renderizarCardImovel } from '/frontend/js/auth-handler.js';

let IMOVEIS_CACHE = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Render header/profile area
    try { await renderizarHeaderPerfil('#userBox', '.btn-login', '.btn-criar-conta'); } catch (e) { console.warn(e); }

    const lista = document.getElementById('imoveis-lista');
    if (!lista) return console.error('#imoveis-lista not found');

    // Carrega imóveis do backend
    IMOVEIS_CACHE = await carregarImovelsDoBanco();
    renderLista(IMOVEIS_CACHE);

    // Busca simples
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const q = (e.target.value || '').trim().toLowerCase();
            const filtrados = IMOVEIS_CACHE.filter(i => {
                const titulo = (i.titulo||'').toLowerCase();
                const descricao = (i.descricao||'').toLowerCase();
                const cidade = (i.cidade||'').toLowerCase();
                return titulo.includes(q) || descricao.includes(q) || cidade.includes(q);
            });
            renderLista(filtrados);
        });
    }
});

function renderLista(lista) {
    const container = document.getElementById('imoveis-lista');
    if (!container) return;
    container.innerHTML = '';
    if (!Array.isArray(lista) || lista.length === 0) {
        container.innerHTML = "<p class='sem-resultados'>Nenhum imóvel encontrado.</p>";
        return;
    }

    lista.forEach(imovel => {
        const wrapper = document.createElement('div');
        wrapper.className = 'card-wrapper';
        wrapper.innerHTML = renderizarCardImovel(imovel);
        container.appendChild(wrapper);
    });
}

                            <i class="bi bi-whatsapp title="Contato WhatsApp" text-success"></i>
                            <i class="bi bi-bookmark title="Salvar nos favoritos" text-warning"></i>
                        </div>
                    </div>
                </div>
            `;
    lista.appendChild(card);
  });
}

/* =========================
   Aplicar / Limpar filtros
   ========================= */
function aplicarFiltros() {
  // Obtém apenas a 'forma' da URL, pois a localização/tipo já estão na UI
  const params = new URLSearchParams(window.location.search);
  const forma = params.get("forma") || "";
  
  // Esta função simplifica a aplicação de filtros em resposta a qualquer evento.
  carregarImoveis({ forma }); // Mantém a forma ativa
}

function limparFiltros() {
  // 1. Limpa Checkboxes e Inputs na UI
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

  // 3. Obtém apenas a 'forma' da URL para manter o contexto principal (ALUGAR/COMPRAR)
  const params = new URLSearchParams(window.location.search);
  const forma = params.get("forma") || "";

  // 4. Recarrega os imóveis, mantendo apenas a forma
  carregarImoveis({ forma }); 
}

/* =========================
Interações da sidebar e busca
   ========================= */
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

/* =========================
   Navbar: esconder no scroll
   ========================= */
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

/* =========================
   Redirecionamento dos links ALUGAR / COMPRAR do header
   ========================= */
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

/* =========================
   Modal de login e ícones (WhatsApp e Favoritos)
   ========================= */
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

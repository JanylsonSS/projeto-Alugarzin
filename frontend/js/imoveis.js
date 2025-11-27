import { renderizarHeaderPerfil, carregarImovelsDoBanco, renderizarCardImovel } from '/frontend/js/auth-handler.js';

let IMOVEIS_CACHE = [];
let FILTROS_ATIVOS = {
    tipos: [],
    tipoanuncio: [],
    quartos: null,
    banheiros: null,
    vagas: null,
    busca: '',
    precoMin: null,
    precoMax: null,
    localizacao: '',
    caracteristicas: []
};

document.addEventListener('DOMContentLoaded', async () => {
    try { await renderizarHeaderPerfil('#userBox', '.btn-login', '.btn-criar-conta'); } catch (e) { console.warn('header render:', e); }

    const listaEl = document.getElementById('imoveis-lista');
    const searchInput = document.getElementById('search-input');
    const sidebar = document.querySelector('.sidebar');
    const navbar = document.querySelector('.navbar');

    if (!listaEl) return console.error('#imoveis-lista not found');

    IMOVEIS_CACHE = await carregarImovelsDoBanco();
    // If index redirected with basic filters (query params), prefill them
    const params = new URLSearchParams(window.location.search);
    const qTipo = params.get('tipo') || '';
    const qCidade = params.get('cidade') || '';
    const qEstado = params.get('estado') || '';
    const qForma = (params.get('forma') || params.get('form') || '').trim();

    // Map basic 'forma' values to backend/display values
    const formaMap = (v) => {
        if (!v) return null;
        const up = v.toUpperCase();
        if (up.includes('ALUGAR')) return 'Aluguel';
        if (up.includes('COMPRAR') || up.includes('VENDA')) return 'Venda';
        if (up === 'ALUGUEL' || up === 'VENDA') return v;
        return v;
    };

    if (qTipo) {
        // check matching tipo checkbox(es)
        const tipoCheckboxes = document.querySelectorAll('#tipos-container input.tipo-checkbox');
        tipoCheckboxes.forEach(cb => {
            const labelText = cb.parentElement.textContent.trim();
            if (labelText.toLowerCase() === qTipo.toLowerCase()) cb.checked = true;
        });
        FILTROS_ATIVOS.tipos = qTipo ? [qTipo.toLowerCase()] : [];
    }

    if (qCidade || qEstado) {
        FILTROS_ATIVOS.localizacao = (qCidade || qEstado).toLowerCase();
        const localInput = document.getElementById('filter-localizacao'); if (localInput) localInput.value = (qCidade || qEstado);
    }

    const mappedForma = formaMap(qForma);
    if (mappedForma) {
        FILTROS_ATIVOS.tipoanuncio = [mappedForma];
        // activate top nav filters if present
        document.querySelectorAll('.nav-filter').forEach(b => {
            if (b.dataset && b.dataset.value === mappedForma) b.classList.add('active');
            else b.classList.remove('active');
        });
    }

    // Now apply filters (will render filtered list)
    aplicarFiltros();

    // Busca por texto
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            FILTROS_ATIVOS.busca = (e.target.value || '').trim().toLowerCase();
            aplicarFiltros();
        });
    }

    // Sidebar - Tipo de imóvel (only the tipo checkboxes)
    if (sidebar) {
        const tipoCheckboxes = sidebar.querySelectorAll('#tipos-container input.tipo-checkbox');
        tipoCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                FILTROS_ATIVOS.tipos = Array.from(tipoCheckboxes)
                    .filter(c => c.checked)
                    .map(c => c.parentElement.textContent.trim().toLowerCase());
                aplicarFiltros();
            });
        });

        // Characteristics checkboxes
        const caractBoxes = sidebar.querySelectorAll('input.caracteristica-checkbox');
        caractBoxes.forEach(cb => {
            cb.addEventListener('change', () => {
                FILTROS_ATIVOS.caracteristicas = Array.from(caractBoxes)
                    .filter(c => c.checked)
                    .map(c => c.parentElement.textContent.trim());
                aplicarFiltros();
            });
        });

        // Price inputs
        const priceMin = document.getElementById('price-min');
        const priceMax = document.getElementById('price-max');
        if (priceMin) priceMin.addEventListener('input', () => { FILTROS_ATIVOS.precoMin = priceMin.value ? Number(priceMin.value) : null; aplicarFiltros(); });
        if (priceMax) priceMax.addEventListener('input', () => { FILTROS_ATIVOS.precoMax = priceMax.value ? Number(priceMax.value) : null; aplicarFiltros(); });

        // Localização input
        const localInput = document.getElementById('filter-localizacao');
        if (localInput) localInput.addEventListener('input', (e) => { FILTROS_ATIVOS.localizacao = (e.target.value || '').trim().toLowerCase(); aplicarFiltros(); });

        // Clear filters
        const limparBtn = document.getElementById('limpar-filtros');
        if (limparBtn) limparBtn.addEventListener('click', () => {
            // reset FILTROS_ATIVOS
            FILTROS_ATIVOS = { tipos: [], tipoanuncio: [], quartos: null, banheiros: null, vagas: null, busca: '', precoMin: null, precoMax: null, localizacao: '', caracteristicas: [] };
            // reset UI
            tipoCheckboxes.forEach(c => c.checked = false);
            caractBoxes.forEach(c => c.checked = false);
            if (priceMin) priceMin.value = '';
            if (priceMax) priceMax.value = '';
            if (localInput) localInput.value = '';
            const activeBtns = sidebar.querySelectorAll('.filter-buttons button.active');
            activeBtns.forEach(b => b.classList.remove('active'));
            const search = document.getElementById('search-input'); if (search) search.value = '';
            // reset top nav filters
            document.querySelectorAll('.nav-filter.active').forEach(b => b.classList.remove('active'));
            aplicarFiltros();
        });
    }

    // Delegated handler for quantity filter buttons (quartos / banheiros / vagas)
    if (sidebar) {
        sidebar.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-buttons button');
            if (!btn) return;

            const group = btn.closest('.filter-buttons');
            if (!group) return;
            const header = group.previousElementSibling;
            const title = header ? header.textContent.trim() : '';

            // Toggle active class in the group
            group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const match = btn.textContent.match(/(\d+)/);
            const value = match ? parseInt(match[1]) : null;

            if (title.includes('Quartos')) FILTROS_ATIVOS.quartos = value;
            else if (title.includes('Banheiros')) FILTROS_ATIVOS.banheiros = value;
            else if (title.includes('Vagas')) FILTROS_ATIVOS.vagas = value;

            aplicarFiltros();
        });
    }

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
    // Top filters (Alugar / Comprar) behave like checkboxes
    const navFilters = document.querySelectorAll('.nav-filter');
    if (navFilters && navFilters.length) {
        navFilters.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                // update FILTROS_ATIVOS.tipoanuncio based on active nav filters
                FILTROS_ATIVOS.tipoanuncio = Array.from(document.querySelectorAll('.nav-filter.active')).map(b => b.dataset.value);
                aplicarFiltros();
            });
        });
    }
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

function aplicarFiltros() {
    let filtrados = IMOVEIS_CACHE;

    // Filtro por busca
    if (FILTROS_ATIVOS.busca) {
        filtrados = filtrados.filter(i => {
            const titulo = (i.titulo || '').toLowerCase();
            const descricao = (i.descricao || '').toLowerCase();
            const cidade = (i.cidade || '').toLowerCase();
            return titulo.includes(FILTROS_ATIVOS.busca) ||
                descricao.includes(FILTROS_ATIVOS.busca) ||
                cidade.includes(FILTROS_ATIVOS.busca);
        });
    }

    // Filtro por tipo
    if (FILTROS_ATIVOS.tipos && FILTROS_ATIVOS.tipos.length > 0) {
        filtrados = filtrados.filter(i => {
            const tipo = (i.tipolocal || '').toLowerCase();
            return FILTROS_ATIVOS.tipos.some(t => tipo.includes(t));
        });
    }

    // Filtro por tipo de anúncio (Aluguel / Venda) vindo dos botões do topo
    if (FILTROS_ATIVOS.tipoanuncio && FILTROS_ATIVOS.tipoanuncio.length > 0) {
        filtrados = filtrados.filter(i => {
            const ta = (i.tipoanuncio || '').trim();
            return FILTROS_ATIVOS.tipoanuncio.includes(ta);
        });
    }

    // Filtro por preço
    if (FILTROS_ATIVOS.precoMin !== null || FILTROS_ATIVOS.precoMax !== null) {
        filtrados = filtrados.filter(i => {
            const preco = Number(i.preco) || 0;
            if (FILTROS_ATIVOS.precoMin !== null && preco < FILTROS_ATIVOS.precoMin) return false;
            if (FILTROS_ATIVOS.precoMax !== null && preco > FILTROS_ATIVOS.precoMax) return false;
            return true;
        });
    }

    // Filtro por localização (bairro/cidade)
    if (FILTROS_ATIVOS.localizacao) {
        filtrados = filtrados.filter(i => {
            const cidade = (i.cidade || '').toLowerCase();
            const bairro = (i.bairro || '').toLowerCase();
            const rua = (i.rua || '').toLowerCase();
            return cidade.includes(FILTROS_ATIVOS.localizacao) || bairro.includes(FILTROS_ATIVOS.localizacao) || rua.includes(FILTROS_ATIVOS.localizacao);
        });
    }

    // Filtro por características/amenities
    if (FILTROS_ATIVOS.caracteristicas && FILTROS_ATIVOS.caracteristicas.length > 0) {
        const selected = FILTROS_ATIVOS.caracteristicas;
        filtrados = filtrados.filter(i => {
            const comod = Array.isArray(i.comodidades) ? i.comodidades : (i.comodidades ? (typeof i.comodidades === 'string' ? JSON.parse(i.comodidades || '[]') : []) : []);
            return selected.every(ch => {
                // Try boolean flags (snake_case in backend) first
                const key = ch.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                if (i[key] === true) return true;
                // fallback to comodidades array match
                return comod.includes(ch) || (i[key] && String(i[key]) === 'true');
            });
        });
    }

    // Filtro por quartos
    if (FILTROS_ATIVOS.quartos !== null) {
        filtrados = filtrados.filter(i => {
            const quartos = parseInt(i.quartos) || 0;
            return quartos >= FILTROS_ATIVOS.quartos;
        });
    }

    // Filtro por banheiros
    if (FILTROS_ATIVOS.banheiros !== null) {
        filtrados = filtrados.filter(i => {
            const banheiros = parseInt(i.banheiros) || 0;
            return banheiros >= FILTROS_ATIVOS.banheiros;
        });
    }

    // Filtro por vagas
    if (FILTROS_ATIVOS.vagas !== null) {
        filtrados = filtrados.filter(i => {
            const vagas = parseInt(i.vagas) || 0;
            return vagas >= FILTROS_ATIVOS.vagas;
        });
    }

    renderLista(filtrados);
}

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
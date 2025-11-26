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
                const titulo = (i.titulo || '').toLowerCase();
                const descricao = (i.descricao || '').toLowerCase();
                const cidade = (i.cidade || '').toLowerCase();
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
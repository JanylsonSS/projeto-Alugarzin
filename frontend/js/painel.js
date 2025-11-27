const API_BASE = "http://localhost:3000/api";

// Minimal DOM helpers used across scripts
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $all = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
let usuarioLogado = null;
let EDITING_ANUNCIO_ID = null; // null when creating, set to id when editing


function showMessage(msg, type = 'error', container = null) {
    if (!container) container = document.getElementById('messageBox') || null;
    if (!container) return alert(msg);

    container.textContent = msg;
    container.style.display = 'block';
    container.style.backgroundColor = type === 'error' ? '#ffebeb' : '#e5ffeb';
    container.style.color = type === 'error' ? '#b30000' : '#006600';
    container.style.padding = '10px';
    container.style.borderRadius = '4px';
    container.style.marginTop = '10px';

    setTimeout(() => { container.style.display = 'none'; }, 5000);
}

// ===================================
// VARIÁVEIS GLOBAIS / CONSTANTES
// ===================================
const editModal = document.getElementById("editmodal");
const fecharEditModal = document.getElementById("fechareditmodal1");
const editProfileForm = document.querySelector(".editProfileForm");
const addAnuncioModal = document.getElementById("modaladdanuncio");
const fecharAddAnuncioModal = document.getElementById("fechareditmodal2");
const addAnuncioForm = document.getElementById("addAnuncioForm");


// ===============================
// Alternar abas (Anúncios / Favoritos)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const abaAnuncios = document.getElementById("anunciosperfil");
    const abaFavoritos = document.getElementById("favoritosperfil");
    const secAnuncio = document.getElementById("anuncio");
    const secFavoritos = document.getElementById("favoritos");

    if (abaAnuncios && abaFavoritos && secAnuncio && secFavoritos) {
        // Ao clicar em "Anúncios"
        abaAnuncios.addEventListener("click", () => {
            abaAnuncios.classList.add("ativo");
            abaFavoritos.classList.remove("ativo");
            secAnuncio.classList.remove("hidden");
            secFavoritos.classList.add("hidden");
        });

        // Ao clicar em "Favoritos" carrega do backend
        abaFavoritos.addEventListener("click", async () => {
            abaFavoritos.classList.add("ativo");
            abaAnuncios.classList.remove("ativo");
            secFavoritos.classList.remove("hidden");
            secAnuncio.classList.add("hidden");
            // carregar favoritos
            await carregarFavoritos();
        });
    }
});

// ==============================
// Carregar favoritos do backend
// ==============================
async function carregarFavoritos() {
    const token = localStorage.getItem('token');
    const favSection = document.getElementById('favoritos');
    if (!favSection) return;
    favSection.innerHTML = '<p>Carregando favoritos...</p>';

    try {
        const res = await fetch(`${API_BASE}/favoritos/me`, { headers: { 'Authorization': 'Bearer ' + token } });
        if (!res.ok) {
            favSection.innerHTML = '<p>Não foi possível carregar favoritos.</p>';
            return;
        }
        const imoveis = await res.json();
        renderListaFavoritos(imoveis);
    } catch (err) {
        console.error('Erro ao carregar favoritos:', err);
        favSection.innerHTML = '<p>Erro ao carregar favoritos.</p>';
    }
}

function renderListaFavoritos(imoveis) {
    const container = document.getElementById('favoritos');
    if (!container) return;
    if (!Array.isArray(imoveis) || imoveis.length === 0) {
        container.innerHTML = '<p>Seus locais favoritos aparecerão aqui!</p>';
        return;
    }

    container.innerHTML = '';
    imoveis.forEach(a => {
        const card = document.createElement('article');
        card.className = 'card-anuncio';

        const imagem = a.imagem_url || (a.imagens && a.imagens.length ? (Array.isArray(a.imagens) ? a.imagens[0] : JSON.parse(a.imagens)[0]) : '/frontend/image/placeholder.png');
        const shortDesc = a.descricao ? String(a.descricao).slice(0, 140) + (String(a.descricao).length > 140 ? '...' : '') : '';

        card.innerHTML = `
            <img src="${escapeHtml(imagem)}" alt="${escapeHtml(a.titulo || 'Favorito')}" />
            <div class="card-body">
                <h3>${escapeHtml(a.titulo)}</h3>
                <p class="descricao">${escapeHtml(shortDesc)}</p>
                <p class="local">${escapeHtml(a.cidade || '')} ${a.estado ? ' - ' + escapeHtml(a.estado) : ''}</p>
                <p class="preco">R$ ${escapeHtml(String(a.preco || ''))}</p>
                <div class="card-actions">
                    <button type="button" class="btn btn-small btn-editar btn-detalhes" data-id="${a.id}">Ver Detalhes</button>
                    <button type="button" class="btn btn-danger btn-small btn-excluir btn-remover-fav" data-id="${a.id}">Remover</button>
                </div>
            </div>
        `;

        // detalhes (navegar para a página de detalhes)
        const btnDetalhes = card.querySelector('.btn-detalhes, .btn-editar');
        if (btnDetalhes) btnDetalhes.addEventListener('click', (e) => { e.stopPropagation(); window.location.href = `/frontend/detalhes_imovel.html?id=${a.id}`; });

        // remover favorito
        const btnRem = card.querySelector('.btn-remover-fav');
        if (btnRem) {
            btnRem.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (!confirm('Remover dos favoritos?')) return;
                const token = localStorage.getItem('token');
                try {
                    const res = await fetch(`${API_BASE}/favoritos/${a.id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
                    if (!res.ok) throw new Error('Falha ao remover');
                    // atualizar lista
                    await carregarFavoritos();
                } catch (err) {
                    console.error('Erro remover favorito:', err);
                    alert('Erro ao remover favorito');
                }
            });
        }

        container.appendChild(card);
    });
}
// =========================
//   BUSCAR USUÁRIO LOGADO
// =========================
async function carregarUsuario() {
    const token = localStorage.getItem('token');

    if (!token) {
        console.error("Token não encontrado");
        return window.location.href = "/frontend/login.html";
    }

    try {
        const res = await fetch("http://localhost:3000/api/usuarios/me", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) {
            console.error("Erro na API:", res.status);
            throw new Error("Falha ao buscar usuário");
        }

        const data = await res.json();

        // A API pode retornar {usuario: {...}} ou só {...}
        const u = data.usuario || data;

        usuarioLogado = u;

        preencherPerfil(u);

    } catch (err) {
        console.error("Erro carregar usuario:", err);
        localStorage.removeItem("token");
        window.location.href = "/frontend/login.html";
    }
}


carregarUsuario();


// =========================
//         LOGOUT
// =========================
document.getElementById("btnLogout").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/frontend/login.html";
});

async function initPainel() {
    // Valida token e redireciona se necessário (protectRoute já faz isso, mas conferimos)
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/frontend/login.html';
        return;
    }

    // Listeners básicos (aceita btnLogout ou btnlogout)
    const btnLogout = document.getElementById('btnLogout') || document.getElementById('btnlogout');
    if (btnLogout) btnLogout.addEventListener('click', logout);

    const btnAbrirAdd = document.getElementById('addbtn');
    if (btnAbrirAdd) btnAbrirAdd.addEventListener('click', () => abrirModal('#modaladdanuncio'));

    const btnEditar = document.getElementById('btnEditarPerfil');
    if (btnEditar) btnEditar.addEventListener('click', () => abrirModal('#modalEditarPerfil'));

    const fecharEditar = document.getElementById('fecharEditarPerfil');
    if (fecharEditar) fecharEditar.addEventListener('click', () => fecharModal('#modalEditarPerfil'));

    const fecharAdd = document.getElementById('fecharEditModal2');
    if (fecharAdd) fecharAdd.addEventListener('click', () => fecharModal('#modaladdanuncio'));
    // Reset editing state when modal closed
    if (fecharAdd) fecharAdd.addEventListener('click', () => {
        EDITING_ANUNCIO_ID = null;
        const btnSalvar = document.getElementById('btnSalvarAnuncio');
        if (btnSalvar) btnSalvar.textContent = 'Publicar';
        const formAddLocal = document.getElementById('addAnuncioForm'); if (formAddLocal) formAddLocal.reset();
        const preview = document.getElementById('previewImagens'); if (preview) preview.innerHTML = '';
    });

    const btnCancelarPerfil = document.getElementById('btnCancelarPerfil');
    if (btnCancelarPerfil) btnCancelarPerfil.addEventListener('click', () => fecharModal('#modalEditarPerfil'));

    const btnCancelarAnuncio = document.getElementById('btnCancelarAnuncio');
    if (btnCancelarAnuncio) btnCancelarAnuncio.addEventListener('click', () => fecharModal('#modaladdanuncio'));

    // Previews de imagens
    const profileImageInput = document.getElementById('profileImageInput');
    if (profileImageInput) profileImageInput.addEventListener('change', previewProfileImage);

    const imagemInput = document.getElementById('imagemInput');
    if (imagemInput) imagemInput.addEventListener('change', previewAnuncioImages);

    // Forms
    const formEditar = document.getElementById('formEditarPerfil');
    if (formEditar) formEditar.addEventListener('submit', handleEditarPerfil);

    const formAdd = document.getElementById('addAnuncioForm');
    if (formAdd) formAdd.addEventListener('submit', handleAddAnuncio);

    // Menu abas (meus anúncios / favoritos)
    $all('.menu-item').forEach(btn => {
        btn.addEventListener('click', () => {
            $all('.menu-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const target = btn.dataset.target;
            $all('.aba').forEach(a => a.classList.add('hidden'));
            const sel = `#${target}`;
            const el = document.querySelector(sel);
            if (el) el.classList.remove('hidden');
        });
    });

    setupAnuncioImageHelpers();
    // Permite desmarcar as opções de período (clicar novamente desmarca)
    if (typeof setupPeriodoToggle === 'function') setupPeriodoToggle();

    // Carregamento inicial
    await carregarUsuario();
    await carregarMeusAnuncios();
}

// Inicializar listeners e comportamentos quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    initPainel().catch(err => console.error('Erro ao iniciar painel:', err));
});

function preencherPerfil(u) {
    if (!u) return;
    const nome = u.nome || 'Usuário';
    const local = (u.cidade && u.estado) ? `${u.cidade}, ${u.estado}` : 'Localização não informada';

    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = nome;

    const userLocationEl = document.getElementById('userLocation');
    if (userLocationEl) userLocationEl.textContent = local;

    const profileDisplay = document.getElementById('profileDisplayImage');
    if (profileDisplay) profileDisplay.src = u.foto_perfil || '/frontend/image/Karina.jpg';
    const previewImg = document.getElementById('previewImage');
    if (previewImg) previewImg.src = u.foto_perfil || '/frontend/image/Karina.jpg';

    // preencher formulário
    const nameIn = document.getElementById('name');
    if (nameIn) nameIn.value = u.nome || '';
    const numberIn = document.getElementById('number');
    if (numberIn) numberIn.value = u.telefone || '';
    const emailIn = document.getElementById('email');
    if (emailIn) emailIn.value = u.email || '';
    const cidadeIn = document.getElementById('cidade_profile') || document.getElementById('cidade');
    if (cidadeIn) cidadeIn.value = u.cidade || '';
    const estadoIn = document.getElementById('estado_profile') || document.getElementById('estado');
    if (estadoIn) estadoIn.value = u.estado || '';
    const cepIn = document.getElementById('cep_profile') || document.getElementById('cep');
    if (cepIn) cepIn.value = u.cep || '';
    const whatsappIn = document.getElementById('whatsapp_link');
    if (whatsappIn) whatsappIn.value = u.whatsapp_link || '';

    const emailLink = document.getElementById('emailLink');
    if (emailLink) emailLink.href = `mailto:${u.email}`;
    const whatsappLink = document.getElementById('whatsappLink');
    if (whatsappLink && u.whatsapp_link) whatsappLink.href = u.whatsapp_link;
}

// Helpers para abrir/fechar modais simples
function abrirModal(selector) {
    const modal = document.querySelector(selector);
    if (!modal) return;
    modal.classList.remove('hidden');
    // foco no primeiro input
    const firstInput = modal.querySelector('input, textarea, select, button');
    if (firstInput) firstInput.focus();
    // fechar ao clicar fora do conteúdo
    modal.addEventListener('click', function onOutsideClick(e) {
        if (e.target === modal) {
            fecharModal(selector);
            modal.removeEventListener('click', onOutsideClick);
        }
    });
}

function fecharModal(selector) {
    const modal = document.querySelector(selector);
    if (!modal) return;
    modal.classList.add('hidden');
}

// ==============================
// Carregar anúncios do usuário (/api/imoveis/meus)
// ==============================
async function carregarMeusAnuncios() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE}/imoveis/meus`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!res.ok) {
            console.warn('Não foi possível buscar anúncios do usuário:', res.status);
            const lista = document.getElementById('listaAnuncios');
            if (lista) lista.innerHTML = '<p>Não foi possível carregar anúncios.</p>';
            return;
        }

        const payload = await res.json().catch(() => null);
        // API pode retornar array direto ou objeto com campos variados
        let anuncios = [];
        if (Array.isArray(payload)) anuncios = payload;
        else if (!payload) anuncios = [];
        else if (Array.isArray(payload.dados)) anuncios = payload.dados;
        else if (Array.isArray(payload.imoveis)) anuncios = payload.imoveis;
        else if (Array.isArray(payload.anuncios)) anuncios = payload.anuncios;
        else if (Array.isArray(payload.data)) anuncios = payload.data;
        else if (payload && typeof payload === 'object' && (payload.id || payload.usuario_id)) anuncios = [payload];
        else anuncios = [];

        renderListaAnuncios(anuncios);
    } catch (err) {
        console.error('Erro ao carregar anúncios:', err);
        const lista = document.getElementById('listaAnuncios');
        if (lista) lista.innerHTML = '<p>Erro ao carregar anúncios.</p>';
    }
}

function renderListaAnuncios(anuncios) {
    const container = document.getElementById('listaAnuncios') || document.getElementById('anuncio');
    if (!container) return;

    if (!Array.isArray(anuncios) || anuncios.length === 0) {
        container.innerHTML = '<p>Você não possui anúncios, clique no botão + para criar!</p>';
        return;
    }

    container.innerHTML = '';
    anuncios.forEach(a => {
        const card = document.createElement('article');
        card.className = 'card-anuncio';

        const imagem = a.imagem_url || (a.imagens && a.imagens.length ? a.imagens[0] : '/frontend/image/placeholder.png');

        const shortDesc = a.descricao ? String(a.descricao).slice(0, 140) + (String(a.descricao).length > 140 ? '...' : '') : '';

        card.innerHTML = `
            <img src="${escapeHtml(imagem)}" alt="${escapeHtml(a.titulo || 'Anúncio')}" />
            <div class="card-body">
                <h3>${escapeHtml(a.titulo)}</h3>
                <p class="descricao">${escapeHtml(shortDesc)}</p>
                <p class="local">${escapeHtml(a.cidade || '')} ${a.estado ? ' - ' + escapeHtml(a.estado) : ''}</p>
                <p class="preco">R$ ${escapeHtml(String(a.preco || ''))}</p>
                <div class="card-actions">
                    <button class="btn btn-small btn-editar" data-id="${a.id}">Editar</button>
                    <button class="btn btn-danger btn-small btn-excluir" data-id="${a.id}">Excluir</button>
                </div>
            </div>
        `;

        // navigate to detalhes when clicking the card (except on action buttons)
        card.addEventListener('click', () => {
            window.location.href = `/frontend/detalhes_imovel.html?id=${a.id}`;
        });

        // stop propagation on action buttons and wire them to existing handlers
        const btnEditar = card.querySelector('.btn-editar');
        if (btnEditar) {
            btnEditar.addEventListener('click', (e) => { e.stopPropagation(); editarAnuncio(a.id); });
        }
        const btnExcluir = card.querySelector('.btn-excluir');
        if (btnExcluir) {
            btnExcluir.addEventListener('click', (e) => { e.stopPropagation(); deletarAnuncio(a.id); });
        }

        container.appendChild(card);
    });
}

// ==============================
// Handlers: Editar Perfil (envia FormData com foto_perfil)
// ==============================
async function handleEditarPerfil(e) {
    e.preventDefault();
    if (!usuarioLogado) return alert('Usuário não carregado');

    const token = localStorage.getItem('token');
    const form = document.getElementById('formEditarPerfil');
    const fd = new FormData(form);

    if (fd.has('name')) { fd.set('nome', fd.get('name')); fd.delete('name'); }
    if (fd.has('number')) { fd.set('telefone', fd.get('number')); fd.delete('number'); }
    if (!fd.has('foto_perfil') && document.getElementById('profileImageInput')?.files?.length) {
        const file = document.getElementById('profileImageInput').files[0];
        if (file) fd.set('foto_perfil', file);
    }

    try {
        const res = await fetch(`${API_BASE}/usuarios/${usuarioLogado.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            body: fd
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.erro || 'Falha ao atualizar perfil');

        alert('Perfil atualizado com sucesso!');
        await carregarUsuario();
        fecharModal('#modalEditarPerfil');
    } catch (err) {
        console.error('Erro ao salvar perfil:', err);
        alert('Erro ao salvar perfil: ' + err.message);
    }
}

// ==============================
// Handlers: Adicionar Anúncio (envia FormData com imagens[])
// ==============================
async function handleAddAnuncio(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const form = document.getElementById('addAnuncioForm');
    const fd = new FormData(form);

    try {
        let res;
        if (EDITING_ANUNCIO_ID) {
            // editar
            res = await fetch(`${API_BASE}/imoveis/${EDITING_ANUNCIO_ID}`, {
                method: 'PUT',
                headers: { 'Authorization': 'Bearer ' + token },
                body: fd
            });
        } else {
            // criar
            res = await fetch(`${API_BASE}/imoveis`, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token },
                body: fd
            });
        }

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.erro || data.mensagem || 'Falha ao publicar');

        alert(EDITING_ANUNCIO_ID ? 'Anúncio atualizado com sucesso!' : 'Anúncio publicado com sucesso!');
        form.reset();
        const preview = document.getElementById('previewImagens');
        if (preview) preview.innerHTML = '';
        fecharModal('#modaladdanuncio');
        EDITING_ANUNCIO_ID = null;
        const btnSalvar = document.getElementById('btnSalvarAnuncio'); if (btnSalvar) btnSalvar.textContent = 'Publicar';
        await carregarMeusAnuncios();
    } catch (err) {
        console.error('Erro publicar anuncio:', err);
        alert('Erro ao publicar: ' + err.message);
    }
}

// Abrir modal de edição, preencher formulário e marcar modo edição
async function editarAnuncio(id) {
    try {
        const res = await fetch(`${API_BASE}/imoveis/${id}`);
        if (!res.ok) return alert('Não foi possível carregar anúncio para edição');
        const imovel = await res.json();

        // Preencher campos do formulário
        const form = document.getElementById('addAnuncioForm');
        if (!form) return;
        // texto / selects
        form.querySelector('#tipolocal_select') && (form.querySelector('#tipolocal_select').value = imovel.tipolocal || '');
        form.querySelector('#tipoanuncio_select') && (form.querySelector('#tipoanuncio_select').value = imovel.tipoanuncio || '');
        form.querySelector('#preco') && (form.querySelector('#preco').value = imovel.preco || '');
        if (imovel.periodo) {
            const p = imovel.periodo;
            const radio = form.querySelector(`input[name="periodo"][value="${p}"]`);
            if (radio) radio.checked = true;
        }

        // If a periodo radio was programmatically checked, mark its wasChecked state
        form.querySelectorAll('input[name="periodo"]').forEach(r => { if (r.checked) r.wasChecked = true; });
        form.querySelector('#rua') && (form.querySelector('#rua').value = imovel.rua || '');
        form.querySelector('#numero') && (form.querySelector('#numero').value = imovel.numero || '');
        form.querySelector('#bairro') && (form.querySelector('#bairro').value = imovel.bairro || '');
        form.querySelector('#cidade_anuncio') && (form.querySelector('#cidade_anuncio').value = imovel.cidade || '');
        form.querySelector('#estado_anuncio') && (form.querySelector('#estado_anuncio').value = imovel.estado || '');
        // titulo / descricao
        form.querySelector('#titulo') && (form.querySelector('#titulo').value = imovel.titulo || '');
        form.querySelector('#descricao') && (form.querySelector('#descricao').value = imovel.descricao || '');

        // Radios quartos/banheiros/vagas
        if (imovel.quartos !== undefined && imovel.quartos !== null) {
            const qVal = String(imovel.quartos);
            const q = form.querySelector(`input[name="quartos"][value="${qVal}"]`);
            if (q) q.checked = true; else {
                if (!isNaN(Number(qVal)) && Number(qVal) >= 4) { const q4 = form.querySelector('input[name="quartos"][value="4+"]'); if (q4) q4.checked = true; }
            }
        }
        if (imovel.banheiros !== undefined && imovel.banheiros !== null) {
            const bVal = String(imovel.banheiros);
            const b = form.querySelector(`input[name="banheiros"][value="${bVal}"]`);
            if (b) b.checked = true; else { if (!isNaN(Number(bVal)) && Number(bVal) >= 4) { const b4 = form.querySelector('input[name="banheiros"][value="4+"]'); if (b4) b4.checked = true; } }
        }
        if (imovel.vagas !== undefined && imovel.vagas !== null) {
            const vVal = String(imovel.vagas);
            const v = form.querySelector(`input[name="vagas"][value="${vVal}"]`);
            if (v) v.checked = true; else { if (!isNaN(Number(vVal)) && Number(vVal) >= 4) { const v4 = form.querySelector('input[name="vagas"][value="4+"]'); if (v4) v4.checked = true; } }
        }

        // comodidades checkboxes
        const comods = imovel.comodidades || [];
        if (Array.isArray(comods)) {
            form.querySelectorAll('input[name="comodidades"]').forEach(cb => cb.checked = comods.includes(cb.value));
        }

        // mostrar imagens existentes como preview (note: uploading new images will replace them)
        const preview = document.getElementById('previewImagens');
        if (preview) {
            preview.innerHTML = '';
            const imgs = Array.isArray(imovel.imagens) ? imovel.imagens : (imovel.imagens ? JSON.parse(imovel.imagens) : []);
            const primary = imovel.imagem_url ? [imovel.imagem_url] : [];
            const all = imgs.length ? imgs : primary;
            all.forEach(src => {
                const img = document.createElement('img'); img.src = src; img.className = 'preview-thumb'; preview.appendChild(img);
            });
        }

        // set editing state
        EDITING_ANUNCIO_ID = id;
        const btnSalvar = document.getElementById('btnSalvarAnuncio'); if (btnSalvar) btnSalvar.textContent = 'Salvar';
        abrirModal('#modaladdanuncio');
    } catch (err) {
        console.error('Erro ao abrir edição do anúncio:', err);
        alert('Erro ao carregar anúncio para edição');
    }
}

// ==============================
// Preview de imagens
// ==============================
function previewProfileImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = document.getElementById('previewImage');
    if (img) img.src = url;
}

function previewAnuncioImages(e) {
    const files = Array.from(e.target.files || []);
    const preview = document.getElementById('previewImagens');
    if (!preview) return;
    preview.innerHTML = '';
    files.forEach(f => {
        const url = URL.createObjectURL(f);
        const img = document.createElement('img');
        img.src = url;
        img.className = 'preview-thumb';
        preview.appendChild(img);
    });
}

// ==============================
// CRUD Anúncios: deletar / editar
// ==============================
async function deletarAnuncio(id) {
    if (!confirm('Deseja realmente excluir este anúncio?')) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE}/imoveis/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) throw new Error('Falha ao excluir');
        alert('Anúncio excluído');
        await carregarMeusAnuncios();
    } catch (err) {
        console.error('Erro excluir anúncio:', err);
        alert('Erro ao excluir anúncio');
    }
}

// Note: the full `editarAnuncio(id)` implementation appears earlier in this file
// (it fetches the anuncio and prefills the form). We avoid redefining it here
// so the real edit flow is preserved.

window.deletarAnuncio = deletarAnuncio;

// ==============================
// Util: escapeHTML
// ==============================
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ==============================
// Helpers relacionados a imagens do anúncio (reuso parte do seu código)
// ==============================
function setupAnuncioImageHelpers() {
    const input = document.getElementById('imagemInput');
    const preview = document.getElementById('previewImagens');
    if (!input || !preview) return;

    let objectURLs = [];
    const MIN_IMAGENS = 3;

    const erroMsgId = 'erro-imagens';
    let erroMsg = document.getElementById(erroMsgId);
    if (!erroMsg) {
        erroMsg = document.createElement('p');
        erroMsg.id = erroMsgId;
        erroMsg.style.color = 'red';
        erroMsg.style.fontSize = '14px';
        erroMsg.style.marginTop = '8px';
        erroMsg.style.display = 'none';
        input.insertAdjacentElement('afterend', erroMsg);
    }

    function renderPreviews() {
        preview.innerHTML = '';
        objectURLs.forEach(url => { try { URL.revokeObjectURL(url); } catch (e) { } });
        objectURLs = [];

        const files = Array.from(input.files || []);
        files.forEach((file, index) => {
            const url = URL.createObjectURL(file);
            objectURLs.push(url);
            const img = document.createElement('img');
            img.src = url;
            img.className = 'preview-thumb';
            preview.appendChild(img);
        });

        verificarMinimoImagens();
    }

    input.addEventListener('change', () => {
        renderPreviews();
    });

    function verificarMinimoImagens() {
        const total = input.files ? input.files.length : 0;
        if (total < MIN_IMAGENS) {
            erroMsg.textContent = `Adicione pelo menos ${MIN_IMAGENS} imagens (${total}/${MIN_IMAGENS})`;
            erroMsg.style.display = 'block';
            input.style.borderColor = 'red';
            return false;
        } else {
            erroMsg.style.display = 'none';
            input.style.borderColor = 'transparent';
            return true;
        }
    }

    // Expõe para uso externo
    window.clearAnuncioImages = function () {
        objectURLs.forEach(url => { try { URL.revokeObjectURL(url); } catch (e) { } });
        objectURLs = [];
        preview.innerHTML = '';
        input.value = '';
        erroMsg.style.display = 'none';
    };

    window.verificarMinimoImagensAnuncio = verificarMinimoImagens;
}

// Torna os radios de `name="periodo"` toggleáveis (clicar novamente desmarca)
function setupPeriodoToggle() {
    const radios = Array.from(document.querySelectorAll('input[name="periodo"]'));
    if (!radios.length) return;

    // track previous state per element
    radios.forEach(r => {
        r.wasChecked = r.checked;
        r.addEventListener('click', function (e) {
            // If it was already checked, uncheck it
            if (this.wasChecked) {
                this.checked = false;
                this.wasChecked = false;
            } else {
                // mark others as not-wasChecked and this as wasChecked
                radios.forEach(rr => rr.wasChecked = false);
                this.wasChecked = true;
            }
        });
        // update state on change (in case changed programmatically)
        r.addEventListener('change', function () { this.wasChecked = this.checked; });
    });
}

// ==============================
// Logout
// ==============================
function logout() {
    if (typeof secureLogout === 'function') {
        secureLogout(false);
    } else {
        localStorage.removeItem('token');
        window.location.href = '/frontend/login.html';
    }
}

// ==============================
// Máscara de telefone (seu código)
// ==============================
function formatPhoneValue(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (!digits) return '';
    let out = '';
    if (digits.length > 0) {
        out += `(${digits.slice(0, 2)}`;
    }
    if (digits.length > 2) {
        out += `) ${digits.slice(2, 3)}`;
    }
    if (digits.length > 3 && digits.length <= 7) {
        out += ` ${digits.slice(3, 7)}`;
    } else if (digits.length > 7) {
        out += ` ${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    } else if (digits.length > 2 && digits.length <= 6) {
        out += ` ${digits.slice(2, 6)}`;
    } else if (digits.length > 6) {
        out += ` ${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
    }
    return out;
}

function applyPhoneMaskToInput(input) {
    if (!input) return;
    input.setAttribute('type', 'text');
    const onInput = (e) => {
        let value = e.target.value.replace(/\D/g, '').slice(0, 11);
        let formattedValue = '';
        if (value.length > 2) {
            formattedValue += `(${value.slice(0, 2)}) `;
            if (value.length > 7 && value.length === 11) {
                formattedValue += `${value.slice(2, 3)} ${value.slice(3, 7)}-${value.slice(7, 11)}`;
            } else if (value.length > 6) {
                formattedValue += `${value.slice(2, 6)}-${value.slice(6, 10)}`;
            } else if (value.length > 2) {
                formattedValue += value.slice(2);
            }
        } else {
            formattedValue = value;
        }
        e.target.value = formattedValue;
    };
    const onPaste = (e) => {
        e.preventDefault();
        const paste = (e.clipboardData || window.clipboardData).getData('text');
        e.target.value = paste;
        e.target.dispatchEvent(new Event('input'));
        const len = input.value.length;
        input.setSelectionRange(len, len);
    };
    input.addEventListener('input', onInput);
    input.addEventListener('paste', onPaste);
}

// Expose functions used in inline handlers (se necessário)
window.deletarAnuncio = deletarAnuncio;
window.editarAnuncio = editarAnuncio;
window.clearAnuncioImages = window.clearAnuncioImages || function () { };
window.verificarMinimoImagensAnuncio = window.verificarMinimoImagensAnuncio || function () { };

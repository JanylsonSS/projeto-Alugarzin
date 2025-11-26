const API_BASE = "http://localhost:3000/api";
let usuarioLogado = null;


function showMessage(msg, type = 'error', container = messageBox) {
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
    }
});
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

        const anuncios = await res.json();
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

        card.innerHTML = `
      <img src="${escapeHtml(imagem)}" alt="${escapeHtml(a.titulo || 'Anúncio')}" />
      <div class="card-body">
        <h3>${escapeHtml(a.titulo)}</h3>
        <p class="local">${escapeHtml(a.cidade || '')} ${a.estado ? ' - ' + escapeHtml(a.estado) : ''}</p>
        <p class="preco">R$ ${escapeHtml(String(a.preco || ''))}</p>
        <div class="card-actions">
          <button class="btn btn-small" data-id="${a.id}" onclick="editarAnuncio(${a.id})">Editar</button>
          <button class="btn btn-danger btn-small" data-id="${a.id}" onclick="deletarAnuncio(${a.id})">Excluir</button>
        </div>
      </div>
    `;

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
        const res = await fetch(`${API_BASE}/imoveis`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            body: fd
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.erro || 'Falha ao publicar');

        alert('Anúncio publicado com sucesso!');
        form.reset();
        const preview = document.getElementById('previewImagens');
        if (preview) preview.innerHTML = '';
        fecharModal('#modaladdanuncio');
        await carregarMeusAnuncios();
    } catch (err) {
        console.error('Erro publicar anuncio:', err);
        alert('Erro ao publicar: ' + err.message);
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
// CRUD Anúncios: deletar / editar (stubs)
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

function editarAnuncio(id) {
    // Aqui você pode abrir um modal de edição e preencher com os dados do anúncio
    alert('Função de edição não implementada. Posso adicionar se desejar.');
}

window.deletarAnuncio = deletarAnuncio;
window.editarAnuncio = editarAnuncio;

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

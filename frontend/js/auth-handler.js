// ==========================================
// AUTH HANDLER - Gerencia autenticação e perfil do usuário
// Usado em: index.html, imoveis.html, detalhes_imovel.html
// ==========================================

const API_BASE = "http://localhost:3000/api";

/**
 * Verifica se há token válido e carrega perfil do usuário
 * Retorna dados do usuário ou null se não autenticado
 */
export async function obterUsuarioLogado() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const res = await fetch(`${API_BASE}/usuarios/me`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!res.ok) {
            console.warn('Token inválido ou expirado');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return null;
        }

        return await res.json();
    } catch (err) {
        console.error('Erro ao carregar usuário:', err);
        return null;
    }
}

/**
 * Renderiza header com perfil do usuário logado
 * Se não autenticado, mostra botões LOGIN/CRIAR CONTA
 */
export async function renderizarHeaderPerfil(selectorLoginBox = '#userBox', selectorLoginBtn = '.btn-login', selectorCriarBtn = '.btn-criar-conta') {
    const usuario = await obterUsuarioLogado();

    if (usuario) {
        // Usuário logado - mostra perfil
        const userBox = document.querySelector(selectorLoginBox);
        if (userBox) {
            userBox.style.display = 'flex';
            userBox.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; margin-right: 20px;">
                    <img src="${usuario.foto_perfil || '/frontend/image/Karina.jpg'}" 
                         alt="Perfil" 
                         style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; cursor: pointer;"
                         onclick="window.location.href='/frontend/painel.html'"
                         title="Ir para painel">
                    <span style="cursor: pointer;" onclick="window.location.href='/frontend/painel.html'">${usuario.nome}</span>
                    <button onclick="logout()" style="padding: 5px 10px; background: #ff6b6b; color: white; border: none; border-radius: 4px; cursor: pointer;">Sair</button>
                </div>
            `;
        }

        // Esconde botões de login
        document.querySelectorAll(selectorLoginBtn).forEach(btn => btn.style.display = 'none');
        document.querySelectorAll(selectorCriarBtn).forEach(btn => btn.style.display = 'none');
    } else {
        // Não autenticado - mostra botões
        const userBox = document.querySelector(selectorLoginBox);
        if (userBox) userBox.style.display = 'none';

        document.querySelectorAll(selectorLoginBtn).forEach(btn => btn.style.display = 'inline-block');
        document.querySelectorAll(selectorCriarBtn).forEach(btn => btn.style.display = 'inline-block');
    }
}

/**
 * Logout - remove token e redireciona
 */
export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/frontend/index.html';
}

/**
 * Redireciona para painel se já autenticado
 * Útil para proteger página de login
 */
export async function redirectToPainelIfLoggedIn() {
    const usuario = await obterUsuarioLogado();
    if (usuario) {
        window.location.replace('/frontend/painel.html');
    }
}

/**
 * Carrega lista de imóveis do servidor
 */
export async function carregarImovelsDoBanco(filtros = {}) {
    try {
        let url = `${API_BASE}/imoveis`;
        const params = new URLSearchParams();

        if (filtros.cidade) params.append('cidade', filtros.cidade);
        if (filtros.tipo) params.append('tipo', filtros.tipo);
        if (filtros.precoMin) params.append('precoMin', filtros.precoMin);
        if (filtros.precoMax) params.append('precoMax', filtros.precoMax);
        if (filtros.titulo) params.append('titulo', filtros.titulo);

        if (params.toString()) url += '?' + params.toString();

        const res = await fetch(url);
        if (!res.ok) {
            console.error('Erro ao buscar imóveis:', res.status);
            return [];
        }

        const data = await res.json();
        return Array.isArray(data) ? data : (data.dados || data || []);
    } catch (err) {
        console.error('Erro ao carregar imóveis:', err);
        return [];
    }
}

/**
 * Carrega um imóvel específico por ID
 */
export async function carregarImovelPorId(id) {
    try {
        const res = await fetch(`${API_BASE}/imoveis/${id}`);
        if (!res.ok) {
            console.error('Erro ao buscar imóvel:', res.status);
            return null;
        }
        return await res.json();
    } catch (err) {
        console.error('Erro ao carregar imóvel:', err);
        return null;
    }
}

/**
 * Converte array de imagens JSON para array de strings
 */
export function processarImagens(imagens) {
    if (!imagens) return [];
    if (Array.isArray(imagens)) return imagens;
    if (typeof imagens === 'string') {
        try {
            return JSON.parse(imagens);
        } catch {
            return [imagens];
        }
    }
    return [];
}

/**
 * Renderiza um card de imóvel em miniatura
 */
export function renderizarCardImovel(imovel) {
    const imagens = processarImagens(imovel.imagens);
    const imagemUrl = imagens[0] || imovel.imagem_url || '/frontend/image/placeholder.png';
    const preco = imovel.preco ? `R$ ${parseFloat(imovel.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Não informado';
    const periodo = imovel.periodo ? `/${imovel.periodo}` : '';

    return `
        <div class="card-imovel" onclick="window.location.href='/frontend/detalhes_imovel.html?id=${imovel.id}'" style="cursor: pointer;">
            <img src="${imagemUrl}" alt="${imovel.titulo || 'Imóvel'}" class="card-image" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px 8px 0 0;">
            <div class="card-content" style="padding: 12px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">${imovel.titulo || 'Imóvel'}</h3>
                <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">
                    ${imovel.cidade || ''} ${imovel.estado ? ', ' + imovel.estado : ''}
                </p>
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #ff6b35;">${preco}${periodo}</p>
                <div style="display: flex; gap: 12px; margin-top: 8px; font-size: 12px; color: #999;">
                    ${imovel.quartos ? `<span>🛏 ${imovel.quartos} quarto${imovel.quartos !== '1' ? 's' : ''}</span>` : ''}
                    ${imovel.banheiros ? `<span>🚿 ${imovel.banheiros} banheiro${imovel.banheiros !== '1' ? 's' : ''}</span>` : ''}
                    ${imovel.vagas ? `<span>🅿 ${imovel.vagas} vaga${imovel.vagas !== '1' ? 's' : ''}</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

// Função global para logout (usado inline em onclick)
window.logout = logout;

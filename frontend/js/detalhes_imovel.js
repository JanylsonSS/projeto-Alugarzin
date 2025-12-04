import { renderizarHeaderPerfil, carregarImovelPorId, processarImagens, obterUsuarioLogado } from '/frontend/js/auth-handler.js';

// Função para buscar usuário por ID
async function buscarUsuarioPorId(usuarioId) {
    try {
        const token = localStorage.getItem('token');
        const headers = token ? {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        } : { 'Content-Type': 'application/json' };

        console.log(`📞 Buscando usuário ID: ${usuarioId}`);
        const response = await fetch(`http://localhost:3000/api/usuarios/${usuarioId}`, { headers });

        if (response.ok) {
            const resultado = await response.json();
            console.log("📦 Resultado API usuário:", resultado);

            // CORREÇÃO: Preserva a estrutura original
            const usuario = resultado.usuario || resultado;

            // CORREÇÃO: NÃO modifica se for undefined
            // Apenas corrige o caminho SE existir
            if (usuario.foto_perfil && usuario.foto_perfil !== 'undefined') {
                // Se já começar com http, mantém
                if (!usuario.foto_perfil.startsWith('http://') &&
                    !usuario.foto_perfil.startsWith('https://')) {

                    // Se começar com /uploads/, adiciona localhost
                    if (usuario.foto_perfil.startsWith('/uploads/')) {
                        usuario.foto_perfil = `http://localhost:3000${usuario.foto_perfil}`;
                    }
                    // Se for caminho relativo, adiciona /uploads/
                    else if (usuario.foto_perfil.includes('perfis/')) {
                        usuario.foto_perfil = `http://localhost:3000/uploads/${usuario.foto_perfil}`;
                    }
                }
                console.log("✅ Foto perfil final:", usuario.foto_perfil);
            } else {
                // CORREÇÃO IMPORTANTE: Mantém o fallback no objeto
                usuario.foto_perfil = '/frontend/image/Karina.jpg';
                console.log("⚠️ Foto não encontrada, usando fallback");
            }

            return usuario;
        } else {
            console.warn(`⚠️ Erro ao buscar usuário ${usuarioId}:`, response.status);
            // Retorna um objeto básico com fallback
            return {
                id: usuarioId,
                nome: "Anunciante",
                email: "Não informado",
                foto_perfil: '/frontend/image/Karina.jpg'
            };
        }
    } catch (error) {
        console.error("❌ Erro na requisição do usuário:", error);
        return {
            id: usuarioId,
            nome: "Anunciante",
            email: "Não informado",
            foto_perfil: '/frontend/image/Karina.jpg'
        };
    }
}

// Função para corrigir o caminho da imagem
function corrigirCaminhoImagem(caminho) {
    if (!caminho) return '/frontend/image/Karina.jpg';

    // Se já for uma URL completa, retorna como está
    if (caminho.startsWith('http://') || caminho.startsWith('https://')) {
        return caminho;
    }

    // Se começar com /uploads/, adiciona localhost se estiver em dev
    if (caminho.startsWith('/uploads/')) {
        // Verifica se estamos em desenvolvimento
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return `http://localhost:3000${caminho}`;
        }
        // Em produção, já está correto
        return caminho;
    }

    // Se não começar com /, adiciona /uploads/ (para caminhos como "perfis/foto.jpg")
    if (!caminho.startsWith('/') && caminho.includes('perfis/')) {
        return `/uploads/${caminho}`;
    }

    // Se for um caminho relativo como "Karina.jpg", retorna do frontend
    if (!caminho.includes('/') && caminho.includes('.')) {
        return `/frontend/image/${caminho}`;
    }

    // Caso padrão: assume que já está correto
    return caminho;
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await renderizarHeaderPerfil('#userBox', '.btn-login', '.btn-criar-conta');
    } catch (e) {
        console.warn('header:', e);
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
        document.getElementById('imoveis-detalhe').innerHTML = '<p style="display: flex; align-items: center; justify-content: center;">Nenhum imóvel selecionado. <a href="/frontend/imoveis.html">Voltar</a></p>';
        return;
    }

    let imovel;
    try {
        imovel = await carregarImovelPorId(id);

        // Verifica se o imóvel existe
        if (!imovel || imovel.error || (imovel.id && String(imovel.id) !== String(id))) {
            throw new Error('Imóvel não encontrado');
        }

        // DEBUG: Mostra os dados recebidos
        console.log("=== DADOS RECEBIDOS DO IMÓVEL ===");
        console.log("Imóvel completo:", imovel);
        console.log("Tem usuario_id?", imovel.usuario_id);
        console.log("Tem objeto usuario?", imovel.usuario);

        // Se tiver usuario_id mas não tiver objeto usuario, busca os dados
        if (imovel.usuario_id && !imovel.usuario) {
            console.log(`Buscando dados do usuário ID: ${imovel.usuario_id}`);
            const usuarioDados = await buscarUsuarioPorId(imovel.usuario_id);

            if (usuarioDados) {
                imovel.usuario = usuarioDados;
                console.log("Dados do usuário adicionados ao imóvel:", imovel.usuario);
            } else {
                console.warn("Não foi possível obter dados do usuário");
                // Cria um objeto vazio para evitar erros
                imovel.usuario = {
                    id: imovel.usuario_id,
                    nome: "Anunciante",
                    email: "Não informado",
                    telefone: imovel.telefone || "Não informado",
                    cidade: imovel.cidade,
                    estado: imovel.estado,
                    foto_perfil: imovel.foto_perfil || '/frontend/image/Karina.jpg'
                };
            }
        }

    } catch (error) {
        console.error('Erro ao carregar imóvel:', error);
        document.getElementById('imoveis-detalhe').innerHTML = `
        <div style="text-align: center; padding: 80px 20px;">
            <div style="font-size: 64px; color: #ddd; margin-bottom: 20px;">❌</div>
            <h2 style="color: #666; margin-bottom: 16px; font-size: 24px;">Imóvel não encontrado</h2>
            <p style="color: #888; margin-bottom: 30px; max-width: 400px; margin-left: auto; margin-right: auto; line-height: 1.5;">
                O imóvel com ID <strong>${escapeHtml(id)}</strong> não existe, foi removido<br>
                ou você não tem permissão para acessá-lo.
            </p>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                <a href="/frontend/imoveis.html" style="
                    background: var(--primary-purple); 
                    color: white; 
                    padding: 12px 24px; 
                    border-radius: 8px; 
                    text-decoration: none; 
                    font-weight: 600;
                    display: inline-block;
                    transition: background 0.3s;
                " onmouseover="this.style.background='#320075'" 
                  onmouseout="this.style.background='var(--primary-purple)'">
                    ↩️ Voltar para Anúncios
                </a>
                <a href="/frontend/index.html" style="
                    background: #e6681aff; 
                    color: #ffffffff; 
                    padding: 12px 24px; 
                    border-radius: 8px; 
                    text-decoration: none; 
                    font-weight: 600;
                    display: inline-block;
                    border: none;
                    transition: background 0.3s;
                " onmouseover="this.style.background='#e6681aff'" 
                  onmouseout="this.style.background='#ff751f'">
                    Página inicial
                </a>
            </div>
        </div>
    `;
        return;
    }

    const usuario = await obterUsuarioLogado();
    console.log("🔄 Dados recebidos para renderização:", {
        imovelId: imovel.id,
        titulo: imovel.titulo,
        usuario_id: imovel.usuario_id,
        usuario: imovel.usuario,
        fotoPath: imovel.usuario?.foto_perfil,
        tipoUsuario: typeof imovel.usuario,
        temUsuario: !!imovel.usuario,
        temFoto: !!imovel.usuario?.foto_perfil,
        fotoPathCompleto: imovel.usuario?.foto_perfil
    });

    // Se tiver dados do usuário, debug mais detalhado
    if (imovel.usuario) {
        console.log("📋 Dados completos do usuário:", imovel.usuario);
        console.log("🔍 Estrutura do objeto usuario:", Object.keys(imovel.usuario));
        console.log("🖼️ Foto perfil bruta:", imovel.usuario.foto_perfil);
        console.log("🏠 Endereço da foto:", window.location.origin + imovel.usuario.foto_perfil);

        // Testa se a imagem carrega
        if (imovel.usuario.foto_perfil) {
            const testImg = new Image();
            testImg.onload = () => console.log("✅ Imagem carrega corretamente");
            testImg.onerror = () => {
                console.log("❌ ERRO ao carregar imagem original");
                console.log("Tentando caminho alternativo...");

                // Testa com localhost
                const altPath = 'http://localhost:3000' + imovel.usuario.foto_perfil;
                const testImg2 = new Image();
                testImg2.onload = () => console.log("✅ Carrega com localhost:3000");
                testImg2.onerror = () => console.log("❌ Falha mesmo com localhost");
                testImg2.src = altPath;
            };
            testImg.src = imovel.usuario.foto_perfil;
        }
    }
    await renderDetalheMarketplace(imovel, usuario);
    // initCarousel() NÃO é mais chamado aqui - será chamado dentro de renderDetalheMarketplace
});

function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function renderDetalheMarketplace(imovel, usuario) {
    console.log("=== DEBUG: DADOS DO IMÓVEL ===");
    console.log("ID do imóvel:", imovel.id);
    console.log("Título:", imovel.titulo);
    console.log("Usuário ID:", imovel.usuario_id);
    console.log("Objeto imovel.usuario:", imovel.usuario);
    console.log("Tipo de imovel.usuario:", typeof imovel.usuario);

    // =========== DEBUG DETALHADO DA FOTO ===========
    console.log("🖼️ === DEBUG FOTO DO PERFIL ===");

    if (imovel.usuario) {
        console.log("📦 Dados completos do usuário:", JSON.stringify(imovel.usuario, null, 2));

        // Verifica se está aninhado
        const usuarioData = imovel.usuario.usuario || imovel.usuario;
        console.log("👤 Usuário para uso:", usuarioData);
        console.log("📸 Foto path:", usuarioData.foto_perfil);
        console.log("📸 Tipo:", typeof usuarioData.foto_perfil);

        if (usuarioData.foto_perfil) {
            console.log("🔗 Foto path string:", String(usuarioData.foto_perfil));
            console.log("🏷️ Começa com /uploads/?", usuarioData.foto_perfil.startsWith('/uploads/'));
            console.log("🏷️ Contém 'perfis'?", usuarioData.foto_perfil.includes('perfis'));

            // Testa todos os caminhos possíveis
            const testes = [
                usuarioData.foto_perfil,
                `http://localhost:3000${usuarioData.foto_perfil}`,
                `/uploads/${usuarioData.foto_perfil}`,
                usuarioData.foto_perfil.replace('/uploads/', 'http://localhost:3000/uploads/')
            ];

            testes.forEach((url, idx) => {
                const testImg = new Image();
                testImg.onload = () => console.log(`✅ Teste ${idx + 1} OK: ${url}`);
                testImg.onerror = () => console.log(`❌ Teste ${idx + 1} FALHA: ${url}`);
                testImg.src = url;
            });
        } else {
            console.log("⚠️ Nenhuma foto_perfil encontrada");
            console.log("📋 Campos disponíveis:", Object.keys(usuarioData));
        }
    } else {
        console.log("⚠️ Nenhum objeto usuario encontrado no imóvel");
    }
    console.log("=== FIM DEBUG FOTO ===");
    // =========== FIM DEBUG ===========

    if (imovel.usuario) {
        console.log("Chaves do usuário:", Object.keys(imovel.usuario));
        console.log("Nome:", imovel.usuario.nome);
        console.log("Email:", imovel.usuario.email);
        console.log("Telefone:", imovel.usuario.telefone);
        console.log("Foto:", imovel.usuario.foto_perfil);
    }
    console.log("=== FIM DEBUG ===");

    const imagens = processarImagens(imovel.imagens || []);
    if (!imagens.length && imovel.imagem_url) imagens.push(imovel.imagem_url);

    // Fallback se ainda não tiver imagens
    if (!imagens.length) {
        imagens.push('/frontend/image/placeholder-imovel.jpg');
    }

    const container = document.getElementById('imoveis-detalhe');
    const preco = imovel.preco ? `R$ ${parseFloat(imovel.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Não informado';
    const periodo = imovel.periodo ? `/${imovel.periodo}` : '';

    // determine favorite state (if logged)
    let isFavorito = false;
    if (usuario) {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/favoritos/me', { headers: { 'Authorization': 'Bearer ' + token } });
            if (res.ok) {
                const favs = await res.json();
                isFavorito = Array.isArray(favs) && favs.some(f => String(f.id) === String(imovel.id));
            }
        } catch (err) {
            console.warn('Erro ao obter favoritos do usuário', err);
        }
    }

    const showBookmark = usuario && usuario.id && String(usuario.id) !== String(imovel.usuario_id);

    container.innerHTML = `
    <div class="detalhe-grid">
        <div class="main-col">
            <div class="galeria">
                <div id="carrossel-imagens" class="carrossel-inner"></div>
                ${imagens.length > 1 ? `
                <div class="arrows">
                    <button class="arrow left"><i class="bi bi-caret-left-fill"></i></button>
                    <button class="arrow right"><i class="bi bi-caret-right-fill"></i></button>
                </div>
                ` : ''}
            </div>

            <div class="detalhes">
                <h1>${escapeHtml(imovel.titulo || 'Imóvel')}</h1>
                <p class="local">${escapeHtml(imovel.rua || '')} ${escapeHtml(imovel.numero || '')} - ${escapeHtml(imovel.bairro || '')} • ${escapeHtml(imovel.cidade || '')}/${escapeHtml(imovel.estado || '')}</p>
                <p class="preco">${preco}${periodo}</p>

                <div class="acoes">
                    ${showBookmark ? `<button id="bookmarkBtn" class="bookmark ${isFavorito ? 'favorited' : ''}" title="Favoritar">` + (isFavorito ? '<i class="bi bi-bookmark-fill"></i>' : '<i class="bi bi-bookmark"></i>') + `</button>` : ''}
                    <a class="contato-whatsapp" href="https://wa.me/55${imovel.telefone || (imovel.usuario && imovel.usuario.telefone) || '999999999'}" target="_blank" title="WhatsApp do anunciante"><i class="bi bi-whatsapp"></i></a>
                </div>

                <div class="bloco-dados">
                    <h3>Descrição</h3>
                    <p id="descricaoResumo">${escapeHtml(imovel.descricao || '')}</p>
                    <button id="toggleDescricao" class="btn" style="background:transparent; color:var(--primary-purple); border:none; padding:0; margin-top:6px; cursor:pointer;">Mostrar descrição completa</button>
                    <h4 style="margin-top:16px">Características</h4>
                    <ul class="caracteristicas">
                        ${imovel.quartos ? `<li>🛏️ ${imovel.quartos} quarto(s)</li>` : ''}
                        ${imovel.banheiros ? `<li>🚿 ${imovel.banheiros} banheiro(s)</li>` : ''}
                        ${imovel.vagas ? `<li>🚗 ${imovel.vagas} vaga(s)</li>` : ''}
                        ${imovel.comodidades ? imovel.comodidades.split(',').map(c => {
        const caracteristica = c.trim().replace(/[\[\]"]/g, '');
        return caracteristica ? `<li>${escapeHtml(caracteristica)}</li>` : '';
    }).join('') : ''}
                    </ul>
                </div>
            </div>
        </div>

        <aside class="sidebar">
            <div class="contact-card">
                <h4>Envie uma mensagem</h4>
                <label for="contact_name">Insira seu nome</label>
                <input id="contact_name" type="text" placeholder="Seu nome">

                <label for="contact_email">Insira seu e-mail</label>
                <input id="contact_email" type="email" placeholder="seuemail@exemplo.com">

                <label for="contact_phone">Insira seu telefone</label>
                <input id="contact_phone" type="text" placeholder="(00) 0 0000-0000">

                <label for="contact_message">Mensagem</label>
                <textarea id="contact_message">Olá, gostaria de ter mais informações sobre: ${escapeHtml(imovel.titulo || '')} — ${preco} — ${escapeHtml(imovel.rua || '')} ${escapeHtml(imovel.numero || '')}, ${escapeHtml(imovel.cidade || '')}/${escapeHtml(imovel.estado || '')}</textarea>

                <div class="send-row">
                    <button id="send_msg" class="btn-send">Enviar mensagem</button>
                    <button id="send_whatsapp" class="btn-whatsapp">WhatsApp <i class="bi bi-whatsapp" style="font-size: 16px;"></i></button>
                </div>

                <div class="phone-line">
                    <span>Fale com o anunciante</span>
                    <a id="btn-informacoes" href="#">Informações</a>
                </div>
            </div>
            
            <!-- Container para informações do proprietário -->
            <div id="proprietario-container" class="proprietario-sidebar"></div>
        </aside>
    </div>`;

    // Configurar o modal de informações
    configurarModalInformacoes(imovel);

    // Exibir informações do anunciante na sidebar
    exibirAnuncianteSidebar(imovel);

    // POPULAR GALERIA
    const carrosselEl = document.getElementById('carrossel-imagens');
    if (carrosselEl && imagens.length > 0) {
        carrosselEl.innerHTML = '';
        imagens.forEach((src, idx) => {
            const div = document.createElement('div');
            div.className = 'slide' + (idx === 0 ? ' active' : '');
            div.innerHTML = `<img src="${escapeHtml(src)}" alt="Imagem do imóvel ${idx + 1}" onerror="this.src='/frontend/image/placeholder-imovel.jpg'">`;
            carrosselEl.appendChild(div);
        });
        setTimeout(() => initCarousel(), 100);
    }

    //Verificar pq nn está funcionando
    const propContainer = document.getElementById('proprietario');

    function montarProprietario(user) {
        const propContainer = document.getElementById('proprietario');
        if (!propContainer) {
            console.error("Elemento #proprietario não encontrado!");
            return;
        }

        // CORREÇÃO: Verifica se os dados estão aninhados
        const usuarioData = user.usuario || user;
        console.log("Dados para montar proprietário:", usuarioData);

        const nome = usuarioData.nome || 'Anunciante';
        const cidade = usuarioData.cidade || '';
        const estado = usuarioData.estado || '';
        const foto = usuarioData.foto_perfil || usuarioData.foto || '/frontend/image/Karina.jpg';

        propContainer.innerHTML = `
        <div class="prop-flex">
            <img src="${escapeHtml(foto)}" alt="Foto do anunciante">
            <div>
                <strong>${escapeHtml(nome)}</strong>
                <p>${escapeHtml(cidade)} • ${escapeHtml(estado)}</p>
            </div>
        </div>
    `;
    }

    if (imovel.usuario) {
        console.log("Encontrado imovel.usuario =>", imovel.usuario);
        montarProprietario(imovel.usuario);
    } else if (imovel.proprietario) {
        console.log("Encontrado imovel.proprietario =>", imovel.proprietario);
        montarProprietario(imovel.proprietario);
    } else {
        console.warn("⚠ Nenhum proprietário encontrado no objeto imovel.");
    }

    // bookmark behavior
    const bookmarkBtn = document.getElementById('bookmarkBtn');
    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', async () => {
            const token = localStorage.getItem('token');
            if (!token) { window.location.href = '/frontend/login.html'; return; }

            if (bookmarkBtn.classList.contains('favorited')) {
                // remover
                const res = await fetch(`/api/favoritos/${imovel.id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
                if (res.ok) {
                    bookmarkBtn.classList.remove('favorited');
                    bookmarkBtn.innerHTML = '<i class="bi bi-bookmark-fill"></i>';
                } else {
                    const err = await res.json().catch(() => ({}));
                    alert(err.erro || 'Erro ao remover favorito');
                }
            } else {
                // adicionar
                const res = await fetch('/api/favoritos', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify({ imovel_id: imovel.id }) });
                if (res.ok) {
                    bookmarkBtn.classList.add('favorited');
                    bookmarkBtn.innerHTML = '<i class="bi bi-bookmark-fill"></i>';
                } else {
                    const err = await res.json().catch(() => ({}));
                    alert(err.erro || 'Erro ao favoritar');
                }
            }

            // Populate gallery AFTER container markup exists
            const carrosselEl = document.getElementById('carrossel-imagens');
            if (carrosselEl) {
                carrosselEl.innerHTML = '';
                (imagens || []).forEach((src, idx) => {
                    const div = document.createElement('div');
                    div.className = 'slide' + (idx === 0 ? ' active' : '');
                    div.innerHTML = `<img src="${escapeHtml(src)}" alt="Imagem do imóvel">`;
                    carrosselEl.appendChild(div);
                });
            }

            // Description toggle (mostrar descrição completa)
            const descricaoEl = document.getElementById('descricaoResumo');
            const toggleBtn = document.getElementById('toggleDescricao');
            if (descricaoEl && toggleBtn) {
                const fullText = descricaoEl.textContent || '';
                const limit = 400;
                if (fullText.length > limit) {
                    descricaoEl.textContent = fullText.slice(0, limit) + '...';
                    let expanded = false;
                    toggleBtn.addEventListener('click', () => {
                        if (!expanded) {
                            descricaoEl.textContent = fullText;
                            toggleBtn.textContent = 'Mostrar menos';
                        } else {
                            descricaoEl.textContent = fullText.slice(0, limit) + '...';
                            toggleBtn.textContent = 'Mostrar descrição completa';
                        }
                        expanded = !expanded;
                    });
                } else {
                    toggleBtn.style.display = 'none';
                }
            }

            // Contact card handlers
            // BOTÃO "ENVIAR MENSAGEM" - Formulário lateral
            const sendBtn = document.getElementById('send_msg');
            if (sendBtn) {
                sendBtn.addEventListener('click', (e) => {
                    e.preventDefault();

                    // Validação dos campos
                    const name = document.getElementById('contact_name')?.value.trim();
                    const email = document.getElementById('contact_email')?.value.trim();
                    const phone = document.getElementById('contact_phone')?.value.trim();
                    const message = document.getElementById('contact_message')?.value.trim();

                    // Validação básica
                    if (!name) {
                        alert('Por favor, informe seu nome');
                        document.getElementById('contact_name')?.focus();
                        return;
                    }

                    if (!email && !phone) {
                        alert('Por favor, informe pelo menos um contato (email ou telefone)');
                        return;
                    }

                    // Construir mensagem formatada
                    let finalMessage = message;
                    if (!finalMessage) {
                        finalMessage = `Olá, tenho interesse no imóvel: ${imovel.titulo || ''}`;
                        if (imovel.preco) {
                            finalMessage += ` (R$ ${parseFloat(imovel.preco).toLocaleString('pt-BR')})`;
                        }
                    }

                    // Adicionar informações do interessado
                    finalMessage += `\n\n--- DADOS DO INTERESSADO ---`;
                    finalMessage += `\nNome: ${name}`;
                    if (email) finalMessage += `\nEmail: ${email}`;
                    if (phone) finalMessage += `\nTelefone: ${phone}`;

                    // TENTAR WHATSAPP PRIMEIRO
                    const anunciantePhoneRaw = (imovel.telefone || (imovel.usuario && imovel.usuario.telefone) || '');
                    const anunciantePhone = String(anunciantePhoneRaw).replace(/\D/g, '');

                    if (anunciantePhone && anunciantePhone.length >= 10) {
                        // Envia por WhatsApp
                        const waLink = `https://wa.me/55${anunciantePhone}?text=${encodeURIComponent(finalMessage)}`;
                        window.open(waLink, '_blank');

                        // Mostra confirmação
                        showToast('Mensagem enviada pelo WhatsApp!', 'success');
                    }
                    // SE NÃO TIVER WHATSAPP, TENTA EMAIL
                    else if (imovel.usuario && imovel.usuario.email) {
                        const to = imovel.usuario.email;
                        const subject = `Interesse no imóvel: ${imovel.titulo || ''}`;
                        const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(finalMessage)}`;

                        // Abre cliente de email
                        window.location.href = mailtoLink;

                        // Mostra confirmação
                        showToast('Abrindo cliente de e-mail...', 'info');
                    }
                    // SE NÃO TIVER NENHUM CONTATO
                    else {
                        // Simula envio e mostra mensagem de sucesso
                        showToast('Mensagem preparada! (Contato do anunciante não disponível)', 'info');

                        // Copia a mensagem para área de transferência
                        navigator.clipboard.writeText(finalMessage).then(() => {
                            console.log('Mensagem copiada para área de transferência:', finalMessage);
                        });
                    }

                    // Limpa o formulário após envio
                    setTimeout(() => {
                        const form = document.querySelector('.contact-card');
                        if (form) {
                            form.querySelectorAll('input, textarea').forEach(field => {
                                if (field.id !== 'contact_message') { // Mantém a mensagem padrão
                                    field.value = '';
                                }
                            });
                        }
                    }, 1000);
                });
            }

            // Função para mostrar notificações (toast)
            function showToast(message, type = 'info') {
                // Remove toast anterior se existir
                const existingToast = document.getElementById('custom-toast');
                if (existingToast) existingToast.remove();

                // Cria novo toast
                const toast = document.createElement('div');
                toast.id = 'custom-toast';
                toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 99999;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        font-size: 14px;
    `;

                toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="bi ${type === 'success' ? 'bi-check-circle' : type === 'error' ? 'bi-exclamation-circle' : 'bi-info-circle'}" 
               style="font-size: 20px;"></i>
            <span>${message}</span>
        </div>
    `;

                document.body.appendChild(toast);

                // Remove após 5 segundos
                setTimeout(() => {
                    toast.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => toast.remove(), 300);
                }, 5000);
            }

            // Adicionar estilos CSS para animação
            const style = document.createElement('style');
            style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
            document.head.appendChild(style);
            // BOTÃO WHATSAPP DO FORMULÁRIO
            const waBtn = document.getElementById('send_whatsapp');
            if (waBtn) {
                waBtn.addEventListener('click', (e) => {
                    e.preventDefault();

                    const name = document.getElementById('contact_name')?.value.trim();
                    const phone = document.getElementById('contact_phone')?.value.trim();
                    const message = document.getElementById('contact_message')?.value.trim();

                    // Validação
                    if (!name) {
                        alert('Por favor, informe seu nome para enviar pelo WhatsApp');
                        document.getElementById('contact_name')?.focus();
                        return;
                    }

                    // Telefone do anunciante
                    const anunciantePhoneRaw = (imovel.telefone || (imovel.usuario && imovel.usuario.telefone) || '');
                    const anunciantePhone = String(anunciantePhoneRaw).replace(/\D/g, '');

                    if (anunciantePhone && anunciantePhone.length >= 10) {
                        // Construir mensagem
                        let finalMessage = message;
                        if (!finalMessage) {
                            finalMessage = `Olá! Meu nome é ${name}`;
                            if (phone) finalMessage += `, meu telefone é ${phone}`;
                            finalMessage += `. Tenho interesse no imóvel: ${imovel.titulo || ''}`;
                            if (imovel.preco) {
                                finalMessage += ` (R$ ${parseFloat(imovel.preco).toLocaleString('pt-BR')})`;
                            }
                        } else {
                            finalMessage = `Olá! Sou ${name}${phone ? ` (${phone})` : ''}. ${message}`;
                        }

                        // Abrir WhatsApp
                        const waLink = `https://wa.me/55${anunciantePhone}?text=${encodeURIComponent(finalMessage)}`;
                        window.open(waLink, '_blank');

                        showToast('Abrindo WhatsApp...', 'success');
                    } else {
                        showToast('Número do anunciante não disponível para WhatsApp', 'error');

                        // Oferece alternativa: copiar mensagem
                        if (confirm('Número não disponível. Deseja copiar a mensagem para enviar manualmente?')) {
                            let copyMessage = `Interesse no imóvel: ${imovel.titulo || ''}\n`;
                            if (imovel.preco) copyMessage += `Valor: R$ ${parseFloat(imovel.preco).toLocaleString('pt-BR')}\n`;
                            copyMessage += `Interessado: ${name}${phone ? ` - ${phone}` : ''}\n`;
                            copyMessage += `Mensagem: ${message || 'Gostaria de mais informações'}`;

                            navigator.clipboard.writeText(copyMessage);
                            showToast('Mensagem copiada para área de transferência!', 'info');
                        }
                    }
                });
            }
            const contactMsg = document.getElementById('contact_message');
            const contactName = document.getElementById('contact_name');
            const contactEmail = document.getElementById('contact_email');
            const contactPhone = document.getElementById('contact_phone');

            const anunciantePhoneRaw = (imovel.telefone || (imovel.usuario && (imovel.usuario.telefone || imovel.usuario.whatsapp_link)) || '');
            const anunciantePhone = String(anunciantePhoneRaw).replace(/\D/g, '');

            const showPhone = document.getElementById('show_phone');
            if (showPhone) {
                if (anunciantePhone) showPhone.textContent = anunciantePhoneRaw;
                else showPhone.textContent = 'Sem informações';
            }

            const buildMessage = () => {
                return (contactMsg && contactMsg.value) ? contactMsg.value : `Olá, tenho interesse no imóvel: ${imovel.titulo || ''} (${preco})`;
            };

            if (sendBtn) {
                sendBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const msg = buildMessage();
                    // Prefer WhatsApp if anunciantePhone exists
                    if (anunciantePhone) {
                        const waLink = `https://wa.me/55${anunciantePhone}?text=${encodeURIComponent(msg)}`;
                        window.open(waLink, '_blank');
                        return;
                    }
                    // fallback to mailto if email present
                    const to = (imovel.usuario && imovel.usuario.email) || '';
                    if (to) {
                        const subject = `Interesse no imóvel: ${imovel.titulo || ''}`;
                        window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`;
                        return;
                    }
                    alert('Contato do anunciante não disponível para envio via WhatsApp ou E-mail.');
                });
            }

            if (waBtn) {
                waBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const msg = buildMessage();
                    if (anunciantePhone) {
                        const waLink = `https://wa.me/55${anunciantePhone}?text=${encodeURIComponent(msg)}`;
                        window.open(waLink, '_blank');
                    } else {
                        alert('Número do anunciante não disponível.');
                    }
                });
            }
        });
    }
}

// Nova função para exibir anunciante na sidebar
function exibirAnuncianteSidebar(imovel) {
    const container = document.getElementById('proprietario-container');
    if (!container) {
        console.error("Container #proprietario-container não encontrado!");
        return;
    }

    // Verifica se temos dados do usuário
    if (!imovel.usuario) {
        console.warn("⚠ Nenhum dado de usuário encontrado no objeto imóvel");
        container.innerHTML = `
            <div class="prop-info" style="
                background: #f9f9f9; 
                padding: 20px; 
                border-radius: 10px; 
                margin-top: 20px;
                border: 1px solid #eee;
                text-align: center;
            ">
                <p style="color: #666; margin: 0;">
                    <i class="bi bi-person" style="margin-right: 8px;"></i>
                    Anunciante não identificado
                </p>
            </div>
        `;
        return;
    }

    // CORREÇÃO: Verifica se os dados estão aninhados
    const user = imovel.usuario.usuario || imovel.usuario;
    console.log("Dados do usuário para sidebar:", user);

    const nome = user.nome || 'Anunciante';
    const cidade = user.cidade || imovel.cidade || '';
    const estado = user.estado || imovel.estado || '';

    // CORREÇÃO: Usa a função corrigirCaminhoImagem
    const fotoPath = user.foto_perfil || user.foto || '/frontend/image/Karina.jpg';
    let fotoUrl = '/frontend/image/Karina.jpg'; // Fallback padrão

    if (fotoPath) {
        // DEBUG: Verificar o que recebemos
        console.log("📸 Foto path original:", fotoPath);

        // Se já for uma URL completa
        if (fotoPath.startsWith('http://') || fotoPath.startsWith('https://')) {
            fotoUrl = fotoPath;
        }
        // Se for caminho relativo começando com uploads
        else if (fotoPath.startsWith('/uploads/')) {
            fotoUrl = `http://localhost:3000${fotoPath}`;
        }
        // Se for caminho sem barra (ex: "perfis/foto.jpg")
        else if (fotoPath.includes('perfis/') && !fotoPath.startsWith('/')) {
            fotoUrl = `http://localhost:3000/uploads/${fotoPath}`;
        }
        // Se for apenas um nome de arquivo
        else if (fotoPath.includes('.') && !fotoPath.includes('/')) {
            fotoUrl = `/frontend/image/${fotoPath}`;
        }
        // Qualquer outro caso
        else {
            fotoUrl = fotoPath;
        }
    }

    console.log("📸 Foto URL final:", fotoUrl);
    console.log("Caminho da foto original:", fotoPath);
    console.log("URL da foto corrigida:", fotoUrl);

    container.innerHTML = `
        <div class="prop-info" style="
            background: #f9f9f9; 
            padding: 20px; 
            border-radius: 10px; 
            margin-top: 20px;
            border: 1px solid #eee;
        ">
            <h4 style="margin-bottom: 15px; color: #333; font-size: 16px; display: flex; align-items: center;">
                <i class="bi bi-person-circle" style="margin-right: 8px;"></i>
                Anunciante
            </h4>
            <div style="display: flex; align-items: center; gap: 15px;">
                <img src="${escapeHtml(fotoUrl)}" alt="Foto de ${escapeHtml(nome)}" style="
                    width: 70px; 
                    height: 70px; 
                    border-radius: 50%; 
                    object-fit: cover;
                    border: 3px solid white;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
                " onerror="this.onerror=null; this.src='/frontend/image/Karina.jpg'">
                <div style="flex: 1;">
                    <strong style="display: block; margin-bottom: 5px; color: #333; font-size: 16px;">${escapeHtml(nome)}</strong>
                    <p style="margin: 0; color: #666; font-size: 14px; display: flex; align-items: center;">
                        <i class="bi bi-geo-alt" style="margin-right: 5px;"></i>
                        ${escapeHtml(cidade)}${cidade && estado ? ', ' : ''}${escapeHtml(estado)}
                    </p>
                    <p style="margin: 10px 0 0 0; font-size: 14px;">
                        <a href="#informacoes" id="ver-contato-link" style="
                            color: var(--primary-purple); 
                            text-decoration: none;
                            font-weight: 500;
                            display: inline-flex;
                            align-items: center;
                            padding: 6px 12px;
                            background: rgba(67, 0, 151, 0.1);
                            border-radius: 6px;
                            transition: all 0.3s;
                        " onmouseover="this.style.background='rgba(67, 0, 151, 0.2)'; this.style.color='var(--primary-purple)'" 
                          onmouseout="this.style.background='rgba(67, 0, 151, 0.1)'; this.style.color='var(--primary-purple)'">
                            <i class="bi bi-info-circle" style="margin-right: 6px;"></i>
                            Ver informações de contato
                        </a>
                    </p>
                </div>
            </div>
        </div>
    `;

    // Configura o link para abrir o modal
    const verContatoLink = document.getElementById('ver-contato-link');
    if (verContatoLink) {
        verContatoLink.addEventListener('click', (e) => {
            e.preventDefault();
            const infoBtn = document.getElementById('btn-informacoes');
            if (infoBtn) {
                infoBtn.click();
            }
        });
    }
}

function initCarousel() {
    const wrapper = document.getElementById('carrossel-imagens');
    if (!wrapper) return;
    const slides = Array.from(wrapper.querySelectorAll('.slide'));
    if (slides.length === 0) return;
    let current = 0;

    function show(i) {
        slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
    }

    document.querySelectorAll('.arrow.left').forEach(btn => btn.addEventListener('click', () => { current = (current - 1 + slides.length) % slides.length; show(current); }));
    document.querySelectorAll('.arrow.right').forEach(btn => btn.addEventListener('click', () => { current = (current + 1) % slides.length; show(current); }));
    show(current);
}


/* ============================================================
    MONTAR O CARD DE DETALHES DO IMÓVEL
===============================================================*/
function montarCardDetalhes(imovel) {
    const container = document.getElementById("imoveis-detalhe");
    container.innerHTML = "";

    const card = document.createElement("div");
    card.className = "imovel-card";

    card.innerHTML = `
      <div class="card-content">

        <div class="info-geral info-base">
          <p>${imovel.descricao}</p>

          <p><strong>
            ${imovel.local.rua}, ${imovel.local.numero} – ${imovel.local.bairro}, 
            ${imovel.local.cidade}/${imovel.local.estado}
          </strong></p>
        </div>

        <div class="info-geral info-extra" style="overflow: hidden; max-height: 0;">
          <p>
            <strong>Quartos:</strong> ${imovel.quartos} &nbsp; | &nbsp;
            <strong>Banheiros:</strong> ${imovel.banheiros} &nbsp; | &nbsp;
            <strong>Suítes:</strong> ${imovel.suites} &nbsp; | &nbsp;
            <strong>Vagas:</strong> ${imovel.vagas}
          </p>

          <p><strong>Ambientes:</strong> ${imovel.ambientes.join(", ")}</p>
          <p><strong>Características:</strong> ${imovel.caracteristicas.join(", ")}</p>
        </div>

        <button class="toggle-info"><i class="bi bi-chevron-down"></i> Ver mais</button>

        <div class="card-footer">
          <span class="preco">R$ ${imovel.preco.toLocaleString("pt-BR")}${imovel.forma === "ALUGAR" ? ",00 / mês" : ""}</span>
          <div class="icones">
            <i class="bi bi-whatsapp" data-whatsapp="5599999999999"></i>
            <i class="bi bi-bookmark"></i>
          </div>
        </div>

      </div>
    `;

    container.appendChild(card);

    // animação do "ver mais"
    const btn = card.querySelector(".toggle-info");
    const extra = card.querySelector(".info-extra");

    btn.addEventListener("click", () => {
        const isClosed = extra.style.maxHeight === "0px" || extra.style.maxHeight === "";
        if (isClosed) {
            extra.style.maxHeight = extra.scrollHeight + "px";
            btn.innerHTML = `<i class="bi bi-chevron-up"></i> Ver menos`;
        } else {
            extra.style.maxHeight = "0px";
            btn.innerHTML = `<i class="bi bi-chevron-down"></i> Ver mais`;
        }
    });
}


/* ============================================================
    GOOGLE MAPS
===============================================================*/
function carregarMapa(localizacao) {
    const container = document.getElementById("map-container");

    if (!localizacao.endereco) {
        container.innerHTML = "<p>Localização não informada.</p>";
        return;
    }

    const enderecoEnc = encodeURIComponent(localizacao.endereco);

    container.innerHTML = `
        <iframe
            width="100%"
            height="600"
            style="border:0;"
            loading="lazy"
            allowfullscreen
            src="https://www.google.com/maps/embed/v1/place?key=ADICIONAR_API_KEY&q=${enderecoEnc}">
        </iframe>
    `;
}

// Controle da navbar animada
class NavbarAnimator {
    constructor() {
        this.header = document.getElementById('mainHeader');
        this.lastScrollY = window.scrollY;
        this.scrollDirection = 'down';
        this.scrollThreshold = 100; // Quantos pixels rolar antes de esconder
        this.isHidden = false;

        this.init();
    }

    init() {
        if (!this.header) return;

        window.addEventListener('scroll', this.handleScroll.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));

        // Inicializa o estado
        this.updateNavbarState();
    }

    handleScroll() {
        const currentScrollY = window.scrollY;

        // Determina a direção do scroll
        this.scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up';

        this.updateNavbarState();

        this.lastScrollY = currentScrollY;
    }

    handleResize() {
        // Recalcula posições em caso de resize
        this.updateNavbarState();
    }

    updateNavbarState() {
        const scrollY = window.scrollY;

        // No topo da página - mostra navbar completa
        if (scrollY <= 50) {
            this.showNavbar();
            document.body.classList.remove('navbar-scrolled');
            return;
        }

        // Adiciona classe reduzida quando scroll beyond threshold
        if (scrollY > 100) {
            this.header.classList.add('scrolled');
            document.body.classList.add('navbar-scrolled');
        } else {
            this.header.classList.remove('scrolled');
            document.body.classList.remove('navbar-scrolled');
        }

        // Esconde/mostra baseado na direção do scroll
        if (this.scrollDirection === 'down' && scrollY > this.scrollThreshold && !this.isHidden) {
            this.hideNavbar();
        } else if (this.scrollDirection === 'up' && this.isHidden) {
            this.showNavbar();
        }
    }

    hideNavbar() {
        this.header.classList.add('hidden');
        this.isHidden = true;
    }

    showNavbar() {
        this.header.classList.remove('hidden');
        this.isHidden = false;
    }
}

/* ============================================================
   CRIAR MODAL DE CONTATO DINAMICAMENTE
============================================================ */
function criarModalContato() {
    // Evita criar duas vezes
    if (document.getElementById("modalContato")) return;

    const modalHTML = `
        <div id="modalContato" class="modal-contato-overlay" style="
            display:none; position:fixed; z-index:9999; inset:0;
            background:rgba(0,0,0,0.6); justify-content:center; align-items:center;
        ">
            <div class="modal-contato-content" style="
                background:#fff; padding:30px; width:400px; max-width:90%; border-radius:12px;
                text-align:center; position:relative; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            ">
                <span id="closeModalContato" style="
                    position:absolute; right:15px; top:10px; cursor:pointer;
                    font-size:26px; font-weight:bold; color:#666;
                ">&times;</span>

                <div style="margin-top: 20px;">
                    <img id="modalFoto" src="" alt="Foto do anunciante" style="
                        width:120px; height:120px; border-radius:50%; object-fit:cover;
                        margin-bottom:15px; border: 4px solid #f0f0f0;
                    ">
                    <h2 id="modalNome" style="margin-bottom:8px; color:#333;">Nome</h2>
                    <p id="modalTelefone" style="margin: 8px 0; font-size: 16px;">
                        <i class="bi bi-telephone-fill" style="color: var(--primary-purple); margin-right: 8px;"></i>
                        <span id="telefoneText">Carregando...</span>
                    </p>
                    <p id="modalEmail" style="margin: 8px 0; font-size: 16px;">
                        <i class="bi bi-envelope-fill" style="color: var(--accent-orange); margin-right: 8px;"></i>
                        <span id="emailText">Carregando...</span>
                    </p>
                    
                    <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #eee;">
                        <button id="btnWhatsAppModal" style="
                            background: #25D366; color: white; border: none;
                            padding: 10px 20px; border-radius: 8px; cursor: pointer;
                            font-weight: 600; margin-right: 10px;
                        ">
                            <i class="bi bi-whatsapp"></i> WhatsApp
                        </button>
                        <button id="btnEmailModal" style="
                            background: var(--primary-purple); color: white; border: none;
                            padding: 10px 20px; border-radius: 8px; cursor: pointer;
                            font-weight: 600;
                        ">
                            <i class="bi bi-envelope"></i> E-mail
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
}

/* ============================================================
   CONFIGURAR MODAL APÓS CARREGAR O IMÓVEL
============================================================ */
function configurarModalInformacoes(imovel) {
    // Cria o modal se não existir
    criarModalContato();

    setTimeout(() => {
        const btn = document.getElementById("btn-informacoes");
        const modal = document.getElementById("modalContato");

        if (!btn || !modal) {
            console.error("Elementos do modal não encontrados!");
            return;
        }

        // Obtém dados do anunciante
        const userData = imovel.usuario || {};
        const user = userData.usuario || userData;
        console.log("Dados do usuário para modal:", user);

        // Dados padrão caso não tenha
        const telefone = user.telefone || imovel.telefone || "Não informado";
        const email = user.email || "Não informado";
        const nome = user.nome || "Anunciante";
        const fotoPath = user.foto_perfil || user.foto || '/frontend/image/Karina.jpg';
        const fotoUrl = corrigirCaminhoImagem(fotoPath);
        const cidade = user.cidade || imovel.cidade || '';
        const estado = user.estado || imovel.estado || '';

        console.log("Foto do modal:", { original: fotoPath, corrigida: fotoUrl });

        // Remove qualquer evento anterior do botão
        const oldBtn = btn;
        const newBtn = oldBtn.cloneNode(true);
        oldBtn.parentNode.replaceChild(newBtn, oldBtn);

        // Configura o novo botão
        newBtn.addEventListener("click", (e) => {
            e.preventDefault();

            console.log("Abrindo modal com dados do anunciante:", { nome, email, telefone, foto: fotoUrl });

            // Atualiza os dados no modal
            const modalFoto = document.getElementById("modalFoto");
            const modalNome = document.getElementById("modalNome");
            const telefoneText = document.getElementById("telefoneText");
            const emailText = document.getElementById("emailText");

            if (modalFoto) {
                modalFoto.src = fotoUrl;
                modalFoto.alt = `Foto de ${nome}`;
                // Adiciona fallback caso a imagem não carregue
                modalFoto.onerror = function () {
                    this.src = '/frontend/image/Karina.jpg';
                };
            }
            if (modalNome) modalNome.textContent = nome;
            if (telefoneText) {
                telefoneText.textContent = telefone;
            }
            if (emailText) {
                emailText.textContent = email;
            }

            // Cria elemento de localização se necessário
            let localizacaoEl = document.getElementById("modalLocalizacao");
            if (!localizacaoEl && (cidade || estado)) {
                localizacaoEl = document.createElement('p');
                localizacaoEl.id = "modalLocalizacao";
                localizacaoEl.style.margin = "8px 0";
                localizacaoEl.style.fontSize = "16px";

                // Insere antes do telefoneText se ele existir
                if (telefoneText) {
                    telefoneText.parentNode.insertBefore(localizacaoEl, telefoneText);
                } else if (modalNome) {
                    // Ou insere após o nome
                    modalNome.parentNode.insertBefore(localizacaoEl, modalNome.nextSibling);
                }
            }

            if (localizacaoEl && (cidade || estado)) {
                localizacaoEl.innerHTML = `<i class="bi bi-geo-alt-fill" style="color: #666; margin-right: 8px;"></i><strong>Localização:</strong> ${cidade}${cidade && estado ? ' - ' : ''}${estado}`;
                localizacaoEl.style.display = 'block';
            } else if (localizacaoEl) {
                localizacaoEl.style.display = 'none';
            }

            // CONFIGURA BOTÕES DO MODAL
            const whatsappBtn = document.getElementById("btnWhatsAppModal");
            const emailBtn = document.getElementById("btnEmailModal");

            // BOTÃO WHATSAPP DO MODAL
            if (whatsappBtn) {
                whatsappBtn.style.display = 'block'; // Sempre mostra

                // Telefone do anunciante
                const telefone = user.telefone || imovel.telefone || "";
                const whatsappNumero = telefone.replace(/\D/g, '');

                whatsappBtn.onclick = (e) => {
                    e.preventDefault();

                    if (whatsappNumero && whatsappNumero.length >= 10) {
                        const mensagem = `Olá ${nome}! Vi seu anúncio no AlugarZin e gostaria de mais informações sobre: ${imovel.titulo || 'o imóvel'}${imovel.preco ? ' - R$ ' + parseFloat(imovel.preco).toLocaleString('pt-BR') : ''}`;
                        const waLink = `https://wa.me/55${whatsappNumero}?text=${encodeURIComponent(mensagem)}`;
                        window.open(waLink, '_blank');

                        // Fecha modal após 1 segundo
                        setTimeout(() => {
                            modal.style.display = "none";
                        }, 1000);
                    } else {
                        // Se não tem telefone, oferece opções
                        const mensagem = `Não foi possível encontrar o WhatsApp do anunciante.\n\nVocê pode:\n1. Usar o formulário de contato ao lado\n2. Copiar os dados para contato manual\n\nNome: ${nome}\nEmail: ${email || 'Não informado'}\nTelefone: ${telefone || 'Não informado'}`;

                        if (confirm(mensagem + "\n\nDeseja copiar estas informações?")) {
                            const infoToCopy = `Contato do anunciante "${nome}":\nEmail: ${email || 'Não informado'}\nTelefone: ${telefone || 'Não informado'}\nImóvel: ${imovel.titulo || ''}`;
                            navigator.clipboard.writeText(infoToCopy);
                            alert('Informações copiadas para área de transferência!');
                        }
                    }
                };
            }

            // BOTÃO EMAIL DO MODAL
            if (emailBtn) {
                emailBtn.style.display = 'block'; // Sempre mostra

                emailBtn.onclick = (e) => {
                    e.preventDefault();

                    if (email && email.includes('@')) {
                        const assunto = `Interesse no imóvel: ${imovel.titulo || ''}`;
                        const corpo = `Prezado(a) ${nome},\n\nTenho interesse no imóvel anunciado por você no AlugarZin.\n\nDetalhes do imóvel:\n- Título: ${imovel.titulo || ''}\n- ${imovel.preco ? 'Valor: R$ ' + parseFloat(imovel.preco).toLocaleString('pt-BR') : ''}\n- Local: ${imovel.cidade || ''}${imovel.estado ? '/' + imovel.estado : ''}\n\nAguardo seu retorno.\n\nAtenciosamente.`;

                        // Tenta simular se for email fictício
                        if (!simularEnvioEmail(email, assunto, corpo, nome)) {
                            // Se não simulou, usa mailto normal
                            window.location.href = `mailto:${email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
                        }

                        setTimeout(() => {
                            modal.style.display = "none";
                        }, 500);
                    } else {
                        // ... tratamento para email não disponível
                    }
                };
            }
            // Mostra o modal
            modal.style.display = "flex";
        });

        // Configura fechamento do modal
        const closeBtn = document.getElementById("closeModalContato");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                modal.style.display = "none";
            });
        }

        // Fechar modal ao clicar fora
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                modal.style.display = 'none';
            }
        });

    }, 500);
}

function simularEnvioEmail(to, subject, body, nomeInteressado) {
    // Verifica se é email fictício/example.com
    if (to.includes('example.com') || to.includes('ficticio') || to.includes('teste')) {
        // Simula envio
        console.log('📧 Email fictício detectado - Simulando envio:', { to, subject });

        // Mostra mensagem de simulação
        const modalSimulacao = document.createElement('div');
        modalSimulacao.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 99999;
            max-width: 500px;
            width: 90%;
            text-align: center;
        `;

        modalSimulacao.innerHTML = `
            <h3 style="color: #4A90E2; margin-bottom: 15px;">✉️ Mensagem Simulada</h3>
            <p>Este email (<strong>${to}</strong>) é fictício para demonstração.</p>
            <p>Sua mensagem foi registrada no sistema e seria enviada ao anunciante em um ambiente real.</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left;">
                <p><strong>Para:</strong> ${to}</p>
                <p><strong>Assunto:</strong> ${subject}</p>
                <p><strong>Mensagem:</strong></p>
                <p style="white-space: pre-wrap; font-size: 14px;">${body}</p>
            </div>
            
            <button id="fecharSimulacao" style="
                background: #4A90E2;
                color: white;
                border: none;
                padding: 10px 25px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                margin-top: 10px;
            ">Fechar</button>
        `;

        // Overlay escuro
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 99998;
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(modalSimulacao);

        // Botão fechar
        document.getElementById('fecharSimulacao').onclick = () => {
            modalSimulacao.remove();
            overlay.remove();
            showToast('Mensagem registrada no sistema!', 'success');
        };

        return true; // Indica que foi simulada
    }

    return false; // Não simulou, email real
}


// Inicializa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new NavbarAnimator();
});

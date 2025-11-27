import { renderizarHeaderPerfil, carregarImovelPorId, processarImagens, obterUsuarioLogado } from '/frontend/js/auth-handler.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await renderizarHeaderPerfil('#userBox', '.btn-login', '.btn-criar-conta');
    } catch (e) {
        console.warn('header:', e);
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
        document.getElementById('imoveis-detalhe').innerHTML = '<p>Nenhum imóvel selecionado. <a href="/frontend/imoveis.html">Voltar</a></p>';
        return;
    }

    const imovel = await carregarImovelPorId(id);
    if (!imovel) {
        document.getElementById('imoveis-detalhe').innerHTML = '<p>Imóvel não encontrado. <a href="/frontend/imoveis.html">Voltar</a></p>';
        return;
    }

    const usuario = await obterUsuarioLogado();
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
    const imagens = processarImagens(imovel.imagens || []);
    if (!imagens.length && imovel.imagem_url) imagens.push(imovel.imagem_url);

    // Fallback se ainda não tiver imagens
    if (!imagens.length) {
        imagens.push('/frontend/image/placeholder-imovel.jpg'); // Adicione uma imagem padrão
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
                    <button class="arrow left">‹</button>
                    <button class="arrow right">›</button>
                </div>
                ` : ''}
            </div>

            <div class="detalhes">
                <h1>${escapeHtml(imovel.titulo || 'Imóvel')}</h1>
                <p class="local">${escapeHtml(imovel.rua || '')} ${escapeHtml(imovel.numero || '')} - ${escapeHtml(imovel.bairro || '')} • ${escapeHtml(imovel.cidade || '')}/${escapeHtml(imovel.estado || '')}</p>
                <p class="preco">${preco}${periodo}</p>

                <div class="acoes">
                    ${showBookmark ? `<button id="bookmarkBtn" class="bookmark ${isFavorito ? 'favorited' : ''}" title="Favoritar">` + (isFavorito ? '<i class="bi bi-bookmark-fill"></i>' : '<i class="bi bi-bookmark"></i>') + `</button>` : ''}
                    <a class="contato-whatsapp" href="https://wa.me/55${imovel.telefone || '999999999'}" target="_blank" title="WhatsApp do anunciante"><i class="bi bi-whatsapp"></i></a>
                </div>

                <!-- REMOVIDO: Bloco valores-box de Venda e Aluguel -->

                <div class="bloco-dados">
                    <h3>Descrição</h3>
                    <p id="descricaoResumo">${escapeHtml(imovel.descricao || '')}</p>
                    <button id="toggleDescricao" class="btn" style="background:transparent; color:var(--primary-purple); border:none; padding:0; margin-top:6px; cursor:pointer;">Mostrar descrição completa</button>
                    <h4 style="margin-top:16px">Características</h4>
                    <ul class="caracteristicas">
                        ${imovel.quartos ? `<li>🛏 ${imovel.quartos} quarto(s)</li>` : ''}
                        ${imovel.banheiros ? `<li>🚿 ${imovel.banheiros} banheiro(s)</li>` : ''}
                        ${imovel.vagas ? `<li>🅿 ${imovel.vagas} vaga(s)</li>` : ''}
                        ${imovel.comodidades ? imovel.comodidades.split(',').map(c => {
        // Remove colchetes, aspas e espaços extras
        const caracteristica = c.trim().replace(/[\[\]"]/g, '');
        return caracteristica ? `<li>${escapeHtml(caracteristica)}</li>` : '';
    }).join('') : ''}
                    </ul>
                </div>

                <div id="proprietario" class="proprietario-card"></div>
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
                    <button id="send_whatsapp" class="btn-whatsapp">WhatsApp</button>
                </div>

                <div class="phone-line">
                    <span>Fale com o anunciante</span>
                    <a id="show_phone" href="#">Ver telefone</a>
                </div>
            </div>
        </aside>
    </div>
`;

    // POPULAR GALERIA IMEDIATAMENTE APÓS CRIAR O CONTAINER
    const carrosselEl = document.getElementById('carrossel-imagens');
    if (carrosselEl && imagens.length > 0) {
        carrosselEl.innerHTML = '';
        imagens.forEach((src, idx) => {
            const div = document.createElement('div');
            div.className = 'slide' + (idx === 0 ? ' active' : '');
            div.innerHTML = `<img src="${escapeHtml(src)}" alt="Imagem do imóvel ${idx + 1}" onerror="this.src='/frontend/image/placeholder-imovel.jpg'">`;
            carrosselEl.appendChild(div);
        });

        // Inicializar carrossel após popular as imagens
        setTimeout(() => initCarousel(), 100);
    }



    // monta proprietário
    const propContainer = document.getElementById('proprietario');
    if (imovel.usuario) {
        const user = imovel.usuario;
        propContainer.innerHTML = `
            <div class="prop-flex">
                <img src="${escapeHtml(user.foto_perfil || '/frontend/image/Karina.jpg')}" alt="Foto do anunciante">
                <div>
                    <strong>${escapeHtml(user.nome || 'Anunciante')}</strong>
                    <p>${escapeHtml(user.cidade || '')} • ${escapeHtml(user.estado || '')}</p>
                </div>
            </div>
        `;
    } else if (imovel.proprietario) {
        const p = imovel.proprietario;
        propContainer.innerHTML = `
            <div class="prop-flex">
                <img src="${escapeHtml(p.foto || '/frontend/image/Karina.jpg')}" alt="Foto do anunciante">
                <div>
                    <strong>${escapeHtml(p.nome || 'Anunciante')}</strong>
                    <p>${escapeHtml(p.cidade || '')} • ${escapeHtml(p.estado || '')}</p>
                </div>
            </div>
        `;
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
                    bookmarkBtn.innerHTML = '<i class="bi bi-bookmark"></i>';
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
            const sendBtn = document.getElementById('send_msg');
            const waBtn = document.getElementById('send_whatsapp');
            const contactMsg = document.getElementById('contact_message');
            const contactName = document.getElementById('contact_name');
            const contactEmail = document.getElementById('contact_email');
            const contactPhone = document.getElementById('contact_phone');

            const anunciantePhoneRaw = (imovel.telefone || (imovel.usuario && (imovel.usuario.telefone || imovel.usuario.whatsapp_link)) || '');
            const anunciantePhone = String(anunciantePhoneRaw).replace(/\D/g, '');

            const showPhone = document.getElementById('show_phone');
            if (showPhone) {
                if (anunciantePhone) showPhone.textContent = anunciantePhoneRaw;
                else showPhone.textContent = 'Telefone não informado';
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


/* ============================================================
    CARD DO PROPRIETÁRIO
===============================================================*/
function montarProprietario(dados) {
    const div = document.createElement("div");
    div.classList.add("proprietario-container");

    div.innerHTML = `
        <img src="${dados.foto}">
        <h3>${dados.nome}</h3>
        <p><i class="bi bi-geo-alt-fill"></i> ${dados.cidade} - ${dados.estado}</p>
        <button class="btn-editar-perfil">Editar perfil</button>
    `;

    document.querySelector(".cards-detalhe").appendChild(div);
}

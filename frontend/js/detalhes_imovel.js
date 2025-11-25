/* =================================
   Esconder Header ao Rolar
================================= */
let lastScroll = 0;

window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    const header = document.querySelector(".header-container");

    if (currentScroll > lastScroll && currentScroll > 80) {
        header.classList.add("header-hidden");
    } else {
        header.classList.remove("header-hidden");
    }

    lastScroll = currentScroll;
});


/* ============================================================
    LER O ID DA URL
===============================================================*/
function getIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

const IMOVEL_ID = getIdFromURL() || 1; // simulação


/* ============================================================
    FUNÇÃO PARA BUSCAR O IMÓVEL NO BACK-END
    back deve implementar GET /api/imoveis/:id
===============================================================*/
async function carregarImovelDoBack(id) {
    try {
        const response = await fetch(`/api/imoveis/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar imóvel");

        const data = await response.json();
        return data; // imóvel completo

    } catch (e) {
        console.warn("⚠ Usando SIMULAÇÃO porque o back não respondeu:");
        return SIMULACAO_IMOVEL; // fallback abaixo
    }
}


/* ============================================================
    SIMULAÇÃO DOS DADOS
===============================================================*/
const SIMULACAO_IMOVEL = {
    id: 1,
    titulo: "Vila Nova, São Paulo/SP",
    preco: 900,
    descricao: "Casa térrea com 2 quartos, 1 banheiro e 1 vaga.",
    tipo: "Casa",
    forma: "ALUGAR",

    local: {
        estado: "SP",
        cidade: "São Paulo",
        bairro: "Vila Nova",
        rua: "Rua das Flores",
        numero: 123
    },

    quartos: 2,
    banheiros: 1,
    suites: 0,
    vagas: 1,

    ambientes: [
        "Sala de estar",
        "Cozinha planejada",
        "Área de serviço",
        "Quintal"
    ],

    caracteristicas: ["Aceita pets"],

    imagens: [
        "/frontend/teste_carrossel/casa.jpg",
        "/frontend/teste_carrossel/cozinha.jpg",
        "/frontend/teste_carrossel/quarto.jpg",
        "/frontend/teste_carrossel/banheiro.jpg"
    ],

    proprietario: {
        idUsuario: 42,
        nome: "Katarina das Neves",
        foto: "/frontend/image/Karina.jpg",
        cidade: "São Paulo",
        estado: "SP"
    }
};


/* ============================================================
    INICIAR PÁGINA
===============================================================*/
(async function iniciarPagina() {
    const imovel = await carregarImovelDoBack(IMOVEL_ID);
    montarCarrossel(imovel.imagens);
    montarCardDetalhes(imovel);
    carregarMapa({
        endereco: `${imovel.local.rua}, ${imovel.local.numero}, ${imovel.local.cidade} - ${imovel.local.estado}`
    });
    montarProprietario(imovel.proprietario);
})();


/* ============================================================
    CARROSSEL
===============================================================*/
function montarCarrossel(listaImagens) {
    const carrosselContainer = document.getElementById("carrossel-imagens");
    carrosselContainer.innerHTML = "";

    listaImagens.forEach(src => {
        const img = document.createElement("img");
        img.classList.add("item");
        img.src = src;
        carrosselContainer.appendChild(img);
    });

    const items = document.querySelectorAll(".coverflow .item");
    let current = 0;

    function updateCoverflow() {
        items.forEach((item, index) => {
            const offset = index - current;

            if (offset === 0) {
                item.style.transform = "translateX(0) scale(1)";
                item.style.opacity = "1";
                item.style.zIndex = "10";
            } else {
                const direction = offset > 0 ? 1 : -1;
                item.style.transform =
                    `translateX(${220 * offset}px) scale(0.7) rotateY(${direction * -35}deg)`;
                item.style.opacity = "0.7";
                item.style.zIndex = "5";
            }
        });
    }

    function next() {
        current = (current + 1) % items.length;
        updateCoverflow();
    }

    function prev() {
        current = (current - 1 + items.length) % items.length;
        updateCoverflow();
    }

    document.querySelector(".right").addEventListener("click", next);
    document.querySelector(".left").addEventListener("click", prev);

    setInterval(next, 4000);
    updateCoverflow();
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

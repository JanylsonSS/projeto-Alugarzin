document.addEventListener("DOMContentLoaded", () => {
  carregarImoveis();
  document.getElementById("btn-filtrar").addEventListener("click", aplicarFiltros);
});

async function carregarImoveis(filtros = {}) {
  const lista = document.getElementById("imoveis-lista");
  lista.innerHTML = "";

  // ====== INTEGRAÇÃO REAL ======
  /*
  const params = new URLSearchParams(filtros);
  const response = await fetch(`/api/imoveis?${params.toString()}`);
  const imoveis = await response.json();
  */

  // ====== EXEMPLOS VISUAIS ======
  const imoveis = [
    {
      id: 1,
      titulo: "Vila Nova, São Paulo/SP",
      preco: 900,
      imagem: "",
      descricao: "Casa térrea com 2 quartos, 1 banheiro e 1 vaga."
    },
    {
      id: 2,
      titulo: "Jardim das Flores, Curitiba/PR",
      preco: 1500,
      imagem: "",
      descricao: "Sobrado com 4 quartos e área total de 60m²."
    }
  ];

  imoveis.forEach((imovel) => {
    const card = document.createElement("div");
    card.className = "imovel-card";

    card.innerHTML = `
      <img src="${imovel.imagem}" alt="${imovel.titulo}">
      <div class="card-content">
        <div>
          <p>${imovel.descricao}</p>
          <h4>${imovel.titulo}</h4>
        </div>
        <div class="card-footer">
          <span class="preco">R$ ${imovel.preco.toLocaleString("pt-BR")},00 / mês</span>
          <div class="icones">
            <i class="bi bi-whatsapp text-success"></i>
            <i class="bi bi-bookmark text-warning"></i>
          </div>
        </div>
      </div>
    `;
    lista.appendChild(card);
  });
}

function aplicarFiltros() {
  const filtros = {
    busca: document.getElementById("search-input").value
    // outros filtros
  };

  /*
  carregarImoveis(filtros);
  */
}

// --- EFEITO DE ESCONDER A NAVBAR AO ROLAR ---
let ultimaPosicaoScroll = 0;
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
  const posicaoAtual = window.scrollY;

  if (posicaoAtual > ultimaPosicaoScroll) {
    // rolando pra baixo → esconder navbar
    navbar.style.top = "-80px";
  } else {
    // rolando pra cima → mostrar navbar
    navbar.style.top = "0";
  }

  ultimaPosicaoScroll = posicaoAtual;
});

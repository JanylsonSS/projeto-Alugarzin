document.addEventListener("DOMContentLoaded", () => {
  // Lê os parâmetros da URL vindos da index.html
  const params = new URLSearchParams(window.location.search);
  const estado = params.get("estado") || "";
  const cidade = params.get("cidade") || "";
  const tipo = params.get("tipo") || "";
  const forma = params.get("forma") || "";

  //Salva os filtros iniciais
  const filtrosIniciais = { estado, cidade, tipo, forma };

  //Carrega imóveis já com filtros aplicados
  carregarImoveis(filtrosIniciais);

  document.getElementById("btn-filtrar").addEventListener("click", aplicarFiltros);
});

async function carregarImoveis(filtros = {}) {
  const lista = document.getElementById("imoveis-lista");
  lista.innerHTML = "";

  // Quando o backend estiver pronto, esta parte abaixo deve ser ativada para buscar os imóveis reais do servidor.
  // const params = new URLSearchParams(filtros);
  // const response = await fetch(`/api/imoveis?${params.toString()}`);
  // const imoveis = await response.json();

  /*
  const params = new URLSearchParams(filtros);
  const response = await fetch(`/api/imoveis?${params.toString()}`);
  const imoveis = await response.json();
  */

  // Enquanto não existe backend, usamos uma lista de simulação de imóveis
  const imoveis = [
    {
      id: 1,
      titulo: "Vila Nova, São Paulo/SP",
      preco: 900,
      imagem: "/frontend/image/imovel1.jpg",
      descricao: "Casa térrea com 2 quartos, 1 banheiro e 1 vaga.",
      tipo: "Casa",
      forma: "ALUGAR",
      local: "São Paulo (SP)",
      estado: "SP",
      cidade: "São Paulo"
    },
    {
      id: 2,
      titulo: "Jardim das Flores, Curitiba/PR",
      preco: 1500,
      imagem: "/frontend/image/imovel2.jpg",
      descricao: "Sobrado com 4 quartos e área total de 60m².",
      tipo: "Casa",
      forma: "ALUGAR",
      local: "Curitiba (PR)",
      estado: "PR",
      cidade: "Curitiba"
    },
    {
      id: 3,
      titulo: "Centro, Curitiba/PR",
      preco: 420000,
      imagem: "/frontend/image/imovel3.jpg",
      descricao: "Apartamento moderno, 2 quartos e varanda gourmet.",
      tipo: "Apartamento",
      forma: "COMPRAR",
      local: "Curitiba (PR)",
      estado: "PR",
      cidade: "Curitiba"
    },
    {
      id: 4,
      titulo: "Zona Sul, São Paulo/SP",
      preco: 520000,
      imagem: "/frontend/image/imovel4.jpg",
      descricao: "Apartamento espaçoso com 3 quartos e garagem.",
      tipo: "Apartamento",
      forma: "COMPRAR",
      local: "São Paulo (SP)",
      estado: "SP",
      cidade: "São Paulo"
    }
  ];


  // Filtros feitos diretamente no navegador.
  // Quando o backend for implementado, o filtro deve ser feito pelo servidor e o front apenas exibirá o resultado.
  const filtrados = imoveis.filter(imovel => {
    const matchEstado =
      !filtros.estado || imovel.estado?.toLowerCase() === filtros.estado.toLowerCase();
    const matchCidade =
      !filtros.cidade || imovel.cidade?.toLowerCase().includes(filtros.cidade.toLowerCase());
    const matchTipo =
      !filtros.tipo || imovel.tipo.toLowerCase().includes(filtros.tipo.toLowerCase());
    const matchForma =
      !filtros.forma || imovel.forma.toLowerCase() === filtros.forma.toLowerCase();
    const matchBusca =
      !filtros.busca || imovel.titulo.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      imovel.descricao.toLowerCase().includes(filtros.busca.toLowerCase());

    return matchEstado && matchCidade && matchTipo && matchForma && matchBusca;
  });

  // Mostra os imóveis filtrados na tela.
  if (filtrados.length === 0) {
    lista.innerHTML = "<p class='sem-resultados'>Nenhum imóvel encontrado.</p>";
    return;
  }

  filtrados.forEach((imovel) => {
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
          <span class="preco">R$ ${imovel.preco.toLocaleString("pt-BR")}${imovel.forma === "ALUGAR" ? ",00 / mês" : ""}</span>
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

// Usada pelo botão "Filtrar" da página de imóveis
function aplicarFiltros() {
  const filtros = {
    busca: document.getElementById("search-input").value
    // outros filtros da sidebar podem ser adicionados aqui
  };

  carregarImoveis(filtros);
}

// Oculta a navbar quando o usuário rola para baixo
let ultimaPosicaoScroll = 0;
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
  const posicaoAtual = window.scrollY;

  if (posicaoAtual > ultimaPosicaoScroll) {
    navbar.style.top = "-80px";
  } else {
    navbar.style.top = "0";
  }

  ultimaPosicaoScroll = posicaoAtual;
});

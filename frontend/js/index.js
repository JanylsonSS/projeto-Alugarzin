document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("searchForm");
  const estadoInput = document.getElementById("estado"); // input com list="lista-estados"
  const cidadeInput = document.getElementById("cidade"); // input com list="lista-cidades"
  const datalistCidades = document.getElementById("lista-cidades"); // o datalist real

  // Lista de cidades por estado
  const cidadesPorEstado = {
    "AC": ["Rio Branco", "Cruzeiro do Sul"],
    "AL": ["Maceió", "Arapiraca"],
    "AM": ["Manaus", "Parintins"],
    "AP": ["Macapá", "Santana"],
    "BA": ["Salvador", "Feira de Santana", "Vitória da Conquista"],
    "CE": ["Fortaleza", "Juazeiro do Norte", "Sobral"],
    "DF": ["Brasília"],
    "ES": ["Vitória", "Vila Velha", "Cariacica"],
    "GO": ["Goiânia", "Anápolis", "Aparecida de Goiânia"],
    "MA": ["São Luís", "Imperatriz"],
    "MT": ["Cuiabá", "Várzea Grande"],
    "MS": ["Campo Grande", "Dourados"],
    "MG": ["Belo Horizonte", "Uberlândia", "Contagem"],
    "PA": ["Belém", "Santarém", "Ananindeua"],
    "PB": ["João Pessoa", "Campina Grande"],
    "PR": ["Curitiba", "Londrina", "Maringá", "Cascavel"],
    "PE": ["Recife", "Caruaru", "Petrolina"],
    "PI": ["Teresina", "Parnaíba"],
    "RJ": ["Rio de Janeiro", "Niterói", "Campos dos Goytacazes"],
    "RN": ["Natal", "Mossoró"],
    "RS": ["Porto Alegre", "Caxias do Sul", "Pelotas"],
    "RO": ["Porto Velho", "Ji-Paraná"],
    "RR": ["Boa Vista"],
    "SC": ["Florianópolis", "Joinville", "Blumenau"],
    "SP": ["São Paulo", "Campinas", "Santos", "Sorocaba"],
    "SE": ["Aracaju", "Lagarto"],
    "TO": ["Palmas", "Araguaína"]
  };

  // Quando o estado muda, atualiza as cidades no datalist
  estadoInput.addEventListener("input", function() {
    const estado = estadoInput.value.toUpperCase().trim();
    const cidades = cidadesPorEstado[estado] || [];

    // Limpa o datalist e repopula
    datalistCidades.innerHTML = "";
    cidades.forEach(cidade => {
      const option = document.createElement("option");
      option.value = cidade;
      datalistCidades.appendChild(option);
    });

    // Habilita o campo cidade se houver cidades
    cidadeInput.disabled = cidades.length === 0;
    if (cidades.length === 0) cidadeInput.value = "";
  });

  // Envio do formulário (redirecionamento)
  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const estado = estadoInput.value.trim();
    const cidade = cidadeInput.value.trim();
    const tipo = document.getElementById("tipo").value.trim();
    const formaSelect = document.getElementById("form")?.value?.trim() || "";

    const params = new URLSearchParams({
      estado,
      cidade,
      tipo,
      forma: formaSelect
    });

    // Redireciona com parâmetros
    window.location.href = `/frontend/imoveis.html?${params.toString()}`;
  });
});

// --- Redirecionamento dos botões ALUGAR e COMPRAR do cabeçalho ---
document.querySelectorAll('nav a').forEach(link => {
  if (link.textContent.trim().toUpperCase() === "ALUGAR") {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/frontend/imoveis.html?forma=ALUGAR";
    });
  }

  if (link.textContent.trim().toUpperCase() === "COMPRAR") {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/frontend/imoveis.html?forma=COMPRAR";
    });
  }
});


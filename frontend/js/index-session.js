document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const btnLogin = document.getElementById("btnLogin");
  const btnCriar = document.getElementById("btnCriarConta");
  const userBox = document.getElementById("userBox");

  if (token && user?.id) {
      // Esconde botões
      if (btnLogin) btnLogin.style.display = "none";
      if (btnCriar) btnCriar.style.display = "none";

      // Mostra o nome do usuário
      if (userBox) {
        userBox.innerHTML = `
            <span>Olá, ${user.nome}</span>
            <a href="/frontend/painel.html" class="painel-link">Painel</a>
        `;
        userBox.style.display = "flex";
      }
  } else {
      // Usuário não está logado -> mostra botões
      if (btnLogin) btnLogin.style.display = "inline-block";
      if (btnCriar) btnCriar.style.display = "inline-block";
      if (userBox) userBox.style.display = "none";
  }
});



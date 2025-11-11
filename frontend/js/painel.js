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

    // Ao clicar em "Favoritos"
    abaFavoritos.addEventListener("click", () => {
      abaFavoritos.classList.add("ativo");
      abaAnuncios.classList.remove("ativo");
      secFavoritos.classList.remove("hidden");
      secAnuncio.classList.add("hidden");
    });
  }

  // Carregar painel do usuário ao iniciar
  carregarPainel();
});


// ===============================
// Componente Painel + Consumo da API
// ===============================
async function carregarPainel() {
  const token = localStorage.getItem("token");

  // --- BLOQUEIO DESATIVADO---
  // if (!token) {
  //   window.location.href = "./login.html";
  //   return;
  // }
  // -------------------------------------------------------------------

  try {
    // Backend:
    /*
    const resposta = await fetch("/api/painel", {
      headers: { Authorization: "Bearer " + token },
    });
    if (!resposta.ok) throw new Error("Falha ao obter dados");
    const dadosUsuario = await resposta.json();
    */

    // --- Backend preenche com "dadosUsuario" ---
    // document.getElementById("nomeUsuario").textContent = dadosUsuario.nome;
    // document.getElementById("emailUsuario").textContent = dadosUsuario.email;
    // document.getElementById("telefoneUsuario").textContent = dadosUsuario.telefone;
    // document.getElementById("localizacaoUsuario").textContent = dadosUsuario.localizacao;
    // if (dadosUsuario.foto) document.getElementById("fotoUsuario").src = dadosUsuario.foto;

  } catch (erro) {
    console.error("Erro ao carregar painel:", erro);

    // BLOQUEIO DESATIVADO 
    // alert("Erro ao carregar seus dados. Faça login novamente.");
    // localStorage.removeItem("token");
    // window.location.href = "./login.html";
  }
}


// ===============================
// Modal Editar Perfil
// ===============================
const editModal = document.getElementById("editmodal");
const fecharEditModal = document.getElementById("fechareditmodal1");
const editProfileForm = document.getElementById("editProfileForm");
const editBox = document.getElementById("editbox");

function abrirEditModal() {
  if (editModal) editModal.style.display = "flex";
}

if (fecharEditModal) {
  fecharEditModal.addEventListener("click", () => {
    if (editModal) editModal.style.display = "none";
    if (editProfileForm) editProfileForm.reset();
    if (editBox) editBox.style.display = "none";
  });
}

window.addEventListener("click", (event) => {
  if (event.target === editModal) {
    editModal.style.display = "none";
    editProfileForm.reset();
    if (editBox) editBox.style.display = "none";
  }
});

if (editProfileForm) {
  editProfileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Captura dos campos
    const nome = document.getElementById("name").value;
    const localizacao = document.getElementById("location").value;
    const email = document.getElementById("email").value;
    const number = document.getElementById("number").value;

    console.log("Editar Perfil →", { nome, localizacao, email, number });

    // Backend:
    /*
    const token = localStorage.getItem("token");
    const formData = new FormData(editProfileForm);
    await fetch("/api/usuario", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    */

    editModal.style.display = "none";
    editProfileForm.reset();
  });

  // Pré-visualização de imagem no modal de edição
  const imageInput = document.getElementById("image");
  const preview = document.getElementById("previewImage");

    imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.src = e.target.result; // muda a imagem mostrada no modal
            };
            reader.readAsDataURL(file);
        }
    });
}


// ===============================
// Modal Adicionar Anúncio
// ===============================
const addAnuncioModal = document.getElementById("modaladdanuncio");
const fecharAddAnuncioModal = document.getElementById("fechareditmodal2");
const addAnuncioForm = document.getElementById("addAnuncioForm");
const addAnuncioBox = document.getElementById("addanunciobox");

// Função para abrir o modal
function abrirAddAnuncioModal() {
    addAnuncioModal.style.display = "flex";
}

// Fecha o modal ao clicar no X
if (fecharAddAnuncioModal) {
    fecharAddAnuncioModal.addEventListener("click", () => {
        addAnuncioModal.style.display = "none";
        addAnuncioForm.reset();
        if (addAnuncioBox) addAnuncioBox.style.display = "none";
    });
}

// Fecha o modal ao clicar fora dele
window.addEventListener("click", (event) => {
    if (event.target === addAnuncioModal) {
        addAnuncioModal.style.display = "none";
        addAnuncioForm.reset();
        if (addAnuncioBox) addAnuncioBox.style.display = "none";
    }
});

// Envio do formulário
if (addAnuncioForm) {
  addAnuncioForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const imagem = document.getElementById("imagem").files[0];
    const preco = document.getElementById("preco").value;

    console.log("Novo Anúncio →", { imagem, preco });

    // Backend:
    /*
    const token = localStorage.getItem("token");
    const formData = new FormData(addAnuncioForm);
    await fetch("/api/anuncios", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    */

    addAnuncioModal.style.display = "none";
    addAnuncioForm.reset();
    if (addAnuncioBox) addAnuncioBox.style.display = "none";
  });
}


// ===============================
// Controle de Imagens no Modal de Anúncio
// ===============================
(function() {
  const input = document.getElementById('imagem');
  const preview = document.getElementById('previewImagens');
  const btnFechar = document.getElementById('fechareditmodal2');
  const modal = document.getElementById('modaladdanuncio');
  const form = document.getElementById('form-anuncio'); 
  
  let objectURLs = [];
  const MIN_IMAGENS = 3;

  // Cria (ou acha) o elemento para mensagens de erro
  let erroMsg = document.createElement('p');
  erroMsg.id = 'erro-imagens';
  erroMsg.style.color = 'red';
  erroMsg.style.fontSize = '14px';
  erroMsg.style.marginTop = '8px';
  erroMsg.style.display = 'none';
  input.insertAdjacentElement('afterend', erroMsg);

  function renderPreviews() {
    preview.innerHTML = '';

    const files = Array.from(input.files || []);
    files.forEach((file, index) => {
      const thumbWrap = document.createElement('div');
      thumbWrap.className = 'thumb-wrap';
      thumbWrap.style.position = 'relative';
      thumbWrap.style.display = 'inline-block';
      thumbWrap.style.margin = '5px';

      const img = document.createElement('img');
      const url = URL.createObjectURL(file);
      objectURLs.push(url);
      img.src = url;
      img.alt = file.name;
      img.style.width = '100px';
      img.style.height = '100px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '8px';
      img.style.border = '2px solid #e6e6e6';
      img.style.display = 'block';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerText = '×';
      btn.title = 'Remover imagem';
      btn.style.position = 'absolute';
      btn.style.top = '-8px';
      btn.style.right = '-8px';
      btn.style.width = '26px';
      btn.style.height = '26px';
      btn.style.borderRadius = '50%';
      btn.style.border = 'none';
      btn.style.background = 'linear-gradient(to right,#ff751f,#430097)';
      btn.style.color = '#fff';
      btn.style.cursor = 'pointer';
      btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
      btn.style.fontSize = '16px';
      btn.style.lineHeight = '0.9';

      btn.addEventListener('click', () => {
        removeImageAtIndex(index);
      });

      thumbWrap.appendChild(img);
      thumbWrap.appendChild(btn);
      preview.appendChild(thumbWrap);
    });

    verificarMinimoImagens();
  }

  function setInputFiles(filesArray) {
    const dt = new DataTransfer();
    filesArray.forEach(f => dt.items.add(f));
    input.files = dt.files;
  }

  function removeImageAtIndex(indexToRemove) {
    const files = Array.from(input.files || []);
    if (indexToRemove < 0 || indexToRemove >= files.length) return;
    if (objectURLs[indexToRemove]) {
      URL.revokeObjectURL(objectURLs[indexToRemove]);
    }
    const newFiles = files.filter((_, i) => i !== indexToRemove);
    setInputFiles(newFiles);
    objectURLs.forEach(url => { try { URL.revokeObjectURL(url); } catch(e){} });
    objectURLs = [];
    renderPreviews();
  }

  input.addEventListener('change', () => {
    objectURLs.forEach(url => { try { URL.revokeObjectURL(url); } catch(e){} });
    objectURLs = [];
    renderPreviews();
  });

  function clearImages() {
    objectURLs.forEach(url => { try { URL.revokeObjectURL(url); } catch(e){} });
    objectURLs = [];
    preview.innerHTML = '';
    input.value = '';
    try { input.files = new DataTransfer().files; } catch (e) {}
    erroMsg.style.display = 'none'; // limpa mensagem
  }

  function verificarMinimoImagens() {
    const total = input.files ? input.files.length : 0;
    if (total < MIN_IMAGENS) {
      erroMsg.textContent = `Adicione pelo menos ${MIN_IMAGENS} imagens (${total}/3)`;
      erroMsg.style.display = 'block';
      input.style.outline = '2px solid red';
      return false;
    } else {
      erroMsg.style.display = 'none';
      input.style.outline = 'none';
      return true;
    }
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      if (!verificarMinimoImagens()) {
        e.preventDefault(); // bloqueia envio
        alert('Você precisa enviar pelo menos 3 imagens antes de continuar.');
      }
    });
  }

  if (btnFechar) {
    btnFechar.addEventListener('click', () => {
      clearImages();
    });
  }

  if (modal) {
    modal.addEventListener('click', (evt) => {
      if (evt.target === modal) {
        clearImages();
      }
    });
  }

  window.clearAnuncioImages = clearImages;
})();

// ===============================
// Logout
// ===============================
const btnLogout = document.getElementById("bntlogout");

if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    // Remove token do localStorage
    localStorage.removeItem("token");

    // Redireciona para login
    window.location.href = "./index.html";

    // Substitui o histórico, impedindo voltar
    window.history.pushState(null, "", "./index.html");
    window.onpopstate = function () {
      window.history.go(1);
    };
  });
}


// -----------------------------
// Máscara de telefone
// -----------------------------
function formatPhoneValue(value) {
  // remove tudo que não é dígito
  const digits = value.replace(/\D/g, '').slice(0, 11); // limita a 11 dígitos
  if (!digits) return '';

  const ddd = digits.slice(0, 2);
  const nine = digits.slice(2, 3);
  const part1 = digits.slice(3, 7); // 4 dígitos
  const part2 = digits.slice(7, 11); // 4 dígitos

  let out = `(${ddd})`;
  if (nine) out += ` ${nine}`;
  if (part1) out += ` ${part1}`;
  if (part2) out += `-${part2}`;

  return out;
}

function applyPhoneMaskToInput(input) {
  if (!input) return;

  // quando digitar/colar
  const onInput = (e) => {
    const start = input.selectionStart;
    const oldLen = input.value.length;

    input.value = formatPhoneValue(input.value);

    // posiciona o cursor no final
    const newLen = input.value.length;
    const diff = newLen - oldLen;
    const newPos = Math.max(0, start + diff);
    input.setSelectionRange(newPos, newPos);
  };

  const onPaste = (e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    input.value = formatPhoneValue(paste);
    // move cursor pro final
    const len = input.value.length;
    input.setSelectionRange(len, len);
  };

  input.addEventListener('input', onInput, { passive: true });
  input.addEventListener('paste', onPaste);

}

document.addEventListener('DOMContentLoaded', () => {
  const phoneById = document.getElementById('number');
  if (phoneById) applyPhoneMaskToInput(phoneById);

  const phones = document.querySelectorAll('input.phone');
  phones.forEach(inp => applyPhoneMaskToInput(inp));
});


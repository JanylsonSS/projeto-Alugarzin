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

        // Ao clicar em "Favoritos"
        abaFavoritos.addEventListener("click", () => {
            abaFavoritos.classList.add("ativo");
            abaAnuncios.classList.remove("ativo");
            secFavoritos.classList.remove("hidden");
            secAnuncio.classList.add("hidden");
        });
    }

    // Aplica a máscara de telefone ao campo de número
    const phoneById = document.getElementById('number');
    if (phoneById) applyPhoneMaskToInput(phoneById);
    
   
    setupEditModalListeners();
    setupAddAnuncioListeners();
    setupLogout();

    // Carregar painel do usuário ao iniciar
    carregarPainel();
});


// ===============================
// Componente Painel + Consumo da API
// ===============================
async function carregarPainel() {
    const token = localStorage.getItem("token");


    // Simulação de dados do usuário 
    const dadosUsuario = {
        whatsapp_link: "https://wa.me/5541988887777", // Exemplo de link do WhatsApp
        email: "karina@alugarzin.com" // Exemplo de e-mail
    };

    // Preenche o link do WhatsApp 
    const whatsappLinkElement = document.getElementById("whatsappLink");
    if (whatsappLinkElement && dadosUsuario.whatsapp_link) {
        whatsappLinkElement.href = dadosUsuario.whatsapp_link;
        // Opcional: Altera a cor do ícone se o link estiver disponível
        whatsappLinkElement.querySelector('i').style.color = '#25D366'; 
    }

    // Preenche o link do E-mail (Tarefa 2)
    const emailLinkElement = document.getElementById("emailLink");
    if (emailLinkElement && dadosUsuario.email) {
        emailLinkElement.href = `mailto:${dadosUsuario.email}`;
    }

    try {
        // ... (lógica de carregamento de dados do backend)
    } catch (erro) {
        console.error("Erro ao carregar painel:", erro);
    }
}


// ===============================
// Modal Editar Perfil (Lógica de Abertura/Fechamento)
// ===============================
function abrirEditModal() {
    if (editModal) editModal.style.display = "flex";
}

function fecharModal(modal) {
    if (modal) modal.style.display = "none";
    if (editProfileForm) editProfileForm.reset();
    // Reverter preview de imagem para o padrão, se necessário
    const preview = document.getElementById("previewImage");
    if (preview) preview.src = '/frontend/image/Karina.jpg'; 
}

function setupEditModalListeners() {
    if (fecharEditModal) {
        fecharEditModal.addEventListener("click", () => fecharModal(editModal));
    }

    window.addEventListener("click", (event) => {
        if (event.target === editModal) {
            fecharModal(editModal);
        }
    });

    if (editProfileForm) {
        editProfileForm.addEventListener("submit", async (event) => {
            event.preventDefault();

           
            const dadosEdicao = {
                nome: document.getElementById("name").value,
                telefone: document.getElementById("number").value,
                link_whatsapp: document.getElementById("whatsapp_link").value, 
                email: document.getElementById("email").value,
                cep: document.getElementById("cep").value, 
                rua: document.getElementById("rua").value, 
                numero: document.getElementById("numero").value, 
                bairro: document.getElementById("bairro").value, 
                cidade: document.getElementById("cidade").value, 
                estado: document.getElementById("estado").value 
            };

            console.log("Editar Perfil →", dadosEdicao);

            // ... (lógica de envio para o backend)

            fecharModal(editModal);
        });
        
        // ===================================
        // Implementação da Tarefa 4 (Pré-visualização da Nova Foto)
        // ===================================
        const imageInput = document.getElementById("profileImageInput"); // ID corrigido
        const preview = document.getElementById("previewImage");

        if (imageInput && preview) {
            imageInput.addEventListener('change', () => {
                const file = imageInput.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        // Muda a imagem no modal
                        preview.src = e.target.result; 
                        
                        // Opcional: Se precisar atualizar a imagem no painel principal imediatamente
                        // document.getElementById("profileDisplayImage").src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // ===================================
        // Preenchimento Automático do CEP
        // ===================================
        const cepInput = document.getElementById('cep');
        
        if (cepInput) {
            // Máscara de CEP
            cepInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.slice(0, 8);
                if (value.length > 5) {
                    e.target.value = value.replace(/^(\d{5})(\d{1,3})$/, '$1-$2');
                } else {
                    e.target.value = value;
                }
            });

            // Busca do CEP ao perder o foco (blur)
            cepInput.addEventListener('blur', async (e) => {
                const cep = e.target.value.replace(/\D/g, '');
                if (cep.length !== 8) return;

                // Desativa campos enquanto busca
                document.getElementById('rua').value = '... buscando';
                document.getElementById('cidade').value = '...';
                document.getElementById('estado').value = '...';
                
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await response.json();

                    if (!data.erro) {
                        document.getElementById('rua').value = data.logradouro || '';
                        document.getElementById('bairro').value = data.bairro || '';
                        document.getElementById('cidade').value = data.localidade || '';
                        document.getElementById('estado').value = data.uf || '';

                        // Foca no campo número, ou na rua se estiver vazia
                        if (data.logradouro) {
                           document.getElementById('numero').focus();
                        } else {
                           document.getElementById('rua').focus();
                        }
                    } else {
                        console.log("CEP não encontrado.");
                        document.getElementById('rua').value = '';
                        document.getElementById('cidade').value = '';
                        document.getElementById('estado').value = '';
                    }

                } catch (error) {
                    console.error("Erro ao buscar CEP:", error);
                }
            });
        }
    }
}


// ===============================
// Modal Adicionar Anúncio (Lógica de Abertura/Fechamento)
// ===============================

// Função para abrir o modal
function abrirAddAnuncioModal() {
    addAnuncioModal.style.display = "flex";
}

function setupAddAnuncioListeners() {
    // Fecha o modal ao clicar no X
    if (fecharAddAnuncioModal) {
        fecharAddAnuncioModal.addEventListener("click", () => {
            fecharModal(addAnuncioModal);
            // Limpa pré-visualizações de imagens (adicionado abaixo)
            if (window.clearAnuncioImages) window.clearAnuncioImages();
        });
    }

    // Fecha o modal ao clicar fora dele
    window.addEventListener("click", (event) => {
        if (event.target === addAnuncioModal) {
            fecharModal(addAnuncioModal);
            // Limpa pré-visualizações de imagens (adicionado abaixo)
            if (window.clearAnuncioImages) window.clearAnuncioImages();
        }
    });

    // Envio do formulário
    if (addAnuncioForm) {
        addAnuncioForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            // Certifica-se de que o mínimo de imagens foi atendido antes de prosseguir
            if (window.verificarMinimoImagensAnuncio && !window.verificarMinimoImagensAnuncio()) {
                // A função já exibe a mensagem de erro
                return; 
            }

            const formData = new FormData(addAnuncioForm);
            console.log("Novo Anúncio →", Object.fromEntries(formData.entries()));

            // ... (lógica de envio para o backend)

            fecharModal(addAnuncioModal);
            if (window.clearAnuncioImages) window.clearAnuncioImages();
        });
    }
}


// ===============================
// Controle de Imagens no Modal de Anúncio
// ===============================
(function() {
    // ID corrigido no HTML para 'imagemInput' (era 'imagem' no JS antigo)
    const input = document.getElementById('imagemInput'); 
    const preview = document.getElementById('previewImagens');
    const form = document.getElementById('addAnuncioForm'); 
    
    // Armazena as URLs temporárias para poder revogar
    let objectURLs = []; 
    const MIN_IMAGENS = 3;

    // Cria ou acha o elemento para mensagens de erro
    let erroMsg = document.createElement('p');
    erroMsg.id = 'erro-imagens';
    erroMsg.style.color = 'red';
    erroMsg.style.fontSize = '14px';
    erroMsg.style.marginTop = '8px';
    erroMsg.style.display = 'none';
    
    // Garante que a mensagem seja inserida apenas uma vez
    if (input && !document.getElementById('erro-imagens')) {
        input.insertAdjacentElement('afterend', erroMsg);
    }

    function renderPreviews() {
        // Limpa previews antigos e revoga URLs antigas
        preview.innerHTML = '';
        objectURLs.forEach(url => { try { URL.revokeObjectURL(url); } catch(e){} });
        objectURLs = [];

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

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.innerText = '×';
            btn.title = 'Remover imagem';
            // Estilos para o botão de remover
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

   
    // Antigamente, ele limpava todos os arquivos e adicionava apenas os novos.
    // Agora ele adiciona os novos arquivos aos antigos.
    if (input) {
        input.addEventListener('change', () => {
            const currentFiles = Array.from(input.files || []);
            
            // Cria um array de DataTransfer e adiciona todos os arquivos antigos
            const dataTransfer = new DataTransfer();
            
            // Se houver arquivos existentes, adiciona eles
            if (input.dataset.existingFiles) {
                const existingFiles = JSON.parse(input.dataset.existingFiles);
                existingFiles.forEach(file => dataTransfer.items.add(file));
            }
            
            // Adiciona os novos arquivos
            currentFiles.forEach(file => dataTransfer.items.add(file));

            // Atualiza o input.files
            input.files = dataTransfer.files;

            // Armazena os arquivos existentes para a próxima mudança
            input.dataset.existingFiles = JSON.stringify(Array.from(input.files));

            renderPreviews();
        });
    }


    function setInputFiles(filesArray) {
        const dt = new DataTransfer();
        filesArray.forEach(f => dt.items.add(f));
        input.files = dt.files;
        // Atualiza o dataset para persistir a lista
        input.dataset.existingFiles = JSON.stringify(filesArray);
    }

    function removeImageAtIndex(indexToRemove) {
        const files = Array.from(input.files || []);
        if (indexToRemove < 0 || indexToRemove >= files.length) return;
        
        // Revoga a URL do objeto que será removido
        if (objectURLs[indexToRemove]) {
            URL.revokeObjectURL(objectURLs[indexToRemove]);
        }
        
        const newFiles = files.filter((_, i) => i !== indexToRemove);
        setInputFiles(newFiles);
        renderPreviews();
    }

    function clearImages() {
        // Revoga todas as URLs
        objectURLs.forEach(url => { try { URL.revokeObjectURL(url); } catch(e){} });
        objectURLs = [];
        preview.innerHTML = '';
        input.value = ''; // Limpa o valor do input (para o navegador)
        
        // Limpa a lista de arquivos via DataTransfer e o dataset
        try { 
            input.files = new DataTransfer().files; 
        } catch (e) {
         
        }
        input.dataset.existingFiles = JSON.stringify([]);

        erroMsg.style.display = 'none'; // limpa mensagem
    }

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

    if (form) {
        form.addEventListener('submit', (e) => {
            if (!verificarMinimoImagens()) {
                e.preventDefault(); // bloqueia envio
      
            }
        });
    }
    
    // Expõe a função para ser chamada no fechamento do modal
    window.clearAnuncioImages = clearImages;
    window.verificarMinimoImagensAnuncio = verificarMinimoImagens;

})();


// ===============================
// Logout
// ===============================

function setupLogout() {
    const btnLogout = document.getElementById("bntlogout");

    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            // Remove token do localStorage
            localStorage.removeItem("token");

            // Redireciona para index.html (página de login/landing)
            // Usa replace() para GARANTIR que a página atual seja substituída no histórico
            // impedindo que o botão "Voltar" do navegador retorne para o painel.html
            window.location.replace("./index.html"); 
            
  
        });
    }
}


// -----------------------------
// Máscara de telefone
// -----------------------------
function formatPhoneValue(value) {
    // remove tudo que não é dígito
    const digits = value.replace(/\D/g, '').slice(0, 11); // limita a 11 dígitos
    if (!digits) return '';

    // (XX) X XXXX-XXXX (9 dígitos) ou (XX) XXXX-XXXX (8 dígitos)
    let out = '';
    
    if (digits.length > 0) {
        out += `(${digits.slice(0, 2)}`;
    }
    if (digits.length > 2) {
        out += `) ${digits.slice(2, 3)}`; // Opcional 9º dígito
    }
    
    // Se tem 9º dígito
    if (digits.length > 3 && digits.length <= 7) {
        out += ` ${digits.slice(3, 7)}`;
    } else if (digits.length > 7) {
        out += ` ${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    }
    // Se não tem 9º dígito
    else if (digits.length > 2 && digits.length <= 6) {
         out += ` ${digits.slice(2, 6)}`;
    } else if (digits.length > 6) {
        out += ` ${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
    }

    return out;
}


function applyPhoneMaskToInput(input) {
    if (!input) return;

    // Garante que o input seja do tipo 'text' para o funcionamento ideal da máscara
    input.setAttribute('type', 'text'); 
    
    // Adicionado o tratamento para o CEP
    const onInput = (e) => {
        let value = e.target.value.replace(/\D/g, '').slice(0, 11);
        
        let formattedValue = '';
        if (value.length > 2) {
            formattedValue += `(${value.slice(0, 2)}) `;
            if (value.length > 7 && value.length === 11) { // Telefone com 9º dígito
                formattedValue += `${value.slice(2, 3)} ${value.slice(3, 7)}-${value.slice(7, 11)}`;
            } else if (value.length > 6) { // Telefone padrão (8 dígitos)
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
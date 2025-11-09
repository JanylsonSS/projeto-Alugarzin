import { protectRoute, secureLogout } from './auth-guard.js';


document.addEventListener('DOMContentLoaded', () => {
  protectRoute();

  const loginForm = document.getElementById('loginform');
  const cadastroForm = document.getElementById('cadastroform');
  const messageBox = document.getElementById('messageBox');
  const modalMessageBox = document.getElementById('esqueceusenhabox');
  const esqueceuSenhaModal = document.getElementById('esqueceusenhamodal');
  const fecharModal = document.getElementById('fecharesqueceusenhamodal');
  const esqueceuSenhaForm = document.getElementById('esqueceusenhaForm');

  // ===== Função utilitária =====
  function showMessage(msg, type = 'error', container = messageBox) {
    if (!container) return alert(msg);

    container.textContent = msg;
    container.style.display = 'block';
    container.style.backgroundColor = type === 'error' ? '#ffebeb' : '#e5ffeb';
    container.style.color = type === 'error' ? '#b30000' : '#006600';
    container.style.padding = '10px';
    container.style.borderRadius = '4px';
    container.style.marginTop = '10px';

    setTimeout(() => { container.style.display = 'none'; }, 5000);
  }

  // ===== LOGIN =====
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = loginForm.querySelector('#loginNomeCompleto').value.trim();
    const email = loginForm.querySelector('#loginEmail').value.trim();
    const password = loginForm.querySelector('#loginPassword').value.trim();
    if (!email || !password) return showMessage('Preencha todos os campos.');

    try {
      const response = await axios.post('http://localhost:3000/api/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      showMessage('Login realizado com sucesso!', 'success');
      window.location.href = '/frontend/index.html';
    } catch (error) {
      const msg = error.response?.data?.message || 'Falha ao fazer login.';
      showMessage(msg, 'error');
    }
  });

  // ===== CADASTRO =====
  cadastroForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = cadastroForm.querySelector('#cadastroNomeCompleto').value.trim();
    const email = cadastroForm.querySelector('#cadastroEmail').value.trim();
    const senha = cadastroForm.querySelector('#cadastroSenha').value.trim();

    if (!nome || !email || !senha) return showMessage('Preencha todos os campos.');
    if (senha.length < 6) return showMessage('A senha deve ter pelo menos 6 caracteres.');

    try {
      await axios.post('http://localhost:3000/api/usuarios', { nome, email, senha });
      showMessage('Conta criada com sucesso! Faça login.', 'success');
      mostrarform('login');
    } catch (error) {
      const msg = error.response?.data?.message || 'Erro ao criar conta.';
      showMessage(msg, 'error');
    }
  });

  // ===== Modal "Esqueceu a senha?" =====
  document.getElementById('abrir')?.addEventListener('click', e => {
    e.preventDefault();
    esqueceuSenhaModal.style.display = 'flex';
  });

  fecharModal?.addEventListener('click', () => esqueceuSenhaModal.style.display = 'none');
  window.addEventListener('click', e => {
    if (e.target === esqueceuSenhaModal) esqueceuSenhaModal.style.display = 'none';
  });

  esqueceuSenhaForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value.trim();
    if (!email) return showMessage('Informe seu e-mail.', 'error', modalMessageBox);

    try {
      await axios.post('/api/esqueceu-senha', { email });
      showMessage('Instruções enviadas para seu e-mail.', 'success', modalMessageBox);
      esqueceuSenhaForm.reset();
      esqueceuSenhaModal.style.display = 'none';
    } catch (error) {
      const msg = error.response?.data?.message || 'Erro ao enviar solicitação.';
      showMessage(msg, 'error', modalMessageBox);
    }
  });

  // ===== Alternar entre login e cadastro =====
  window.mostrarform = function(tipo) {
    const loginBtn = document.getElementById('loginbutton');
    const criarBtn = document.getElementById('criarbutton');

    loginForm.classList.toggle('active', tipo === 'login');
    cadastroForm.classList.toggle('active', tipo === 'criarconta');
    loginBtn.classList.toggle('buttonativo', tipo === 'login');
    criarBtn.classList.toggle('buttonativo', tipo === 'criarconta');
  };

  document.getElementById('linkToSignup')?.addEventListener('click', e => {
    e.preventDefault(); 
    mostrarform('criarconta'); 
  });

  document.getElementById('linkToLogin')?.addEventListener('click', e => {
    e.preventDefault(); 
    mostrarform('login'); 
  });

  // Inicializa com login ativo
  mostrarform('login');
});

    // === Alternar visibilidade da senha ===
    document.querySelectorAll('.password .toggle-password').forEach(icon => {
        icon.addEventListener('click', () => {
            const passwordField = icon.previousElementSibling;
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordField.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    

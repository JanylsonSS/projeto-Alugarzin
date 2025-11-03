// validar se o token JWT é válido e não expirou
export function isTokenValid() {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    // Decodifica a parte payload do JWT
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload));

    // Verifica se há expiração
    if (!decoded.exp) return true; // caso o token não tenha expiração
    const isExpired = decoded.exp * 1000 < Date.now();

    return !isExpired;
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return false;
  }
}

// Verifica se há token válido armazenado
export function checkAuthentication() {
  return isTokenValid();
}

//Aplica o token JWT automaticamente nas requisições Axios
if (window.axios) {
  const token = localStorage.getItem('token');
  if (token && isTokenValid()) {
    window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Intercepta respostas 401 (token inválido ou expirado)
  window.axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        console.warn('Sessão expirada ou token inválido.');
        secureLogout(true); // logout com aviso
      }
      return Promise.reject(error);
    }
  );
}

// Protege páginas que exigem autenticação
export function protectRoute() {
  const isAuthenticated = checkAuthentication();
  const currentPage = window.location.pathname;

  // Páginas públicas (login, index etc.)
  const publicPages = [
    '/',
    '/index.html',
    '/frontend/html/login.html',
    '/frontend/login.html',
    '/login.html'
  ];

  const isPublicPage = publicPages.some(page =>
    currentPage === page || currentPage.endsWith(page)
  );

  //Se NÃO autenticado e página é privada → redireciona pro login
  if (!isAuthenticated && !isPublicPage) {
    console.warn('Usuário não autenticado, redirecionando para login...');
    window.location.replace('/frontend/html/login.html?expired=true');
    return false;
  }

  // Se autenticado e estiver em página pública → redireciona pro painel
  if (isAuthenticated && isPublicPage) {
    console.log('Usuário já autenticado, redirecionando para painel...');
    window.location.replace('/frontend/html/painel.html');
    return false;
  }

  return true;
}

// Logout seguro (manual ou automático)
export function secureLogout(expired = false) {
  // Remove dados locais
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  // Impede voltar com botão do navegador
  history.pushState(null, '', '/frontend/html/index.html');

  // Redireciona com mensagem, se for por expiração
  if (expired) {
    window.location.replace('/frontend/html/login.html?expired=true');
  } else {
    window.location.replace('/frontend/html/login.html');
  }
}
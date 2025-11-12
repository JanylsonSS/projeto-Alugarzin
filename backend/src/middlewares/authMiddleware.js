import jwt from "jsonwebtoken";

// Middleware para verificar se o token JWT é válido
export const verifyToken = (req, res, next) => {
  try {
    // Pegar token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        erro: "Token não fornecido",
        codigo: "TOKEN_NAO_FORNECIDO",
      });
    }

    // Formato esperado: "Bearer TOKEN_AQUI"
    const parts = authHeader.split(" ");

    if (parts.length !== 2) {
      return res.status(401).json({
        erro: "Formato de token inválido",
        codigo: "TOKEN_FORMATO_INVALIDO",
      });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({
        erro: "Token mal formatado",
        codigo: "TOKEN_MAL_FORMATADO",
      });
    }

    // Verificar token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          erro: "Token inválido ou expirado",
          codigo: "TOKEN_INVALIDO",
        });
      }

      // Adicionar dados do usuário na requisição
      req.usuario = decoded;
      return next();
    });
  } catch (erro) {
    console.error("Erro ao verificar token:", erro);
    return res.status(401).json({
      erro: "Falha na autenticação",
      codigo: "FALHA_AUTENTICACAO",
    });
  }
};

// Middleware opcional: verificar se usuário é admin (exemplo para futuro)
export const verifyAdmin = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      erro: "Autenticação necessária",
    });
  }

  // Exemplo: verificar se usuário tem papel de admin
  // if (req.usuario.role !== 'admin') {
  //   return res.status(403).json({
  //     erro: "Acesso negado. Apenas administradores."
  //   });
  // }

  next();
};
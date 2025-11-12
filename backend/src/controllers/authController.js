import Usuario from "../models/Usuario.js";
import jwt from "jsonwebtoken";

class AuthController {
  // POST /api/login - Fazer login
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // 1. Validação de campos obrigatórios
      if (!email || !password) {
        return res.status(400).json({
          erro: "Email e senha são obrigatórios",
        });
      }

      // 2. Buscar usuário por email
      const usuario = await Usuario.findOne({
        where: { email: email.toLowerCase().trim() },
      });

      if (!usuario) {
        return res.status(401).json({
          erro: "Email ou senha incorretos",
        });
      }

      // 3. Comparar senha
      const senhaValida = await Usuario.compararSenha(
        password,
        usuario.senha_hash
      );

      if (!senhaValida) {
        return res.status(401).json({
          erro: "Email ou senha incorretos",
        });
      }

      // 4. Gerar token JWT
      const token = jwt.sign(
        {
          id: usuario.id,
          email: usuario.email,
          nome: usuario.nome,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || "24h",
        }
      );

      // 5. Retornar token e dados do usuário (SEM senha)
      return res.status(200).json({
        mensagem: "Login realizado com sucesso!",
        token,
        user: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          telefone: usuario.telefone,
        },
      });
    } catch (erro) {
      console.error("Erro ao fazer login:", erro);
      return res.status(500).json({
        erro: "Erro interno ao fazer login. Tente novamente.",
      });
    }
  }

  // POST /api/logout - Fazer logout (apenas retorna sucesso, token é removido no frontend)
  static async logout(req, res) {
    try {
      return res.status(200).json({
        mensagem: "Logout realizado com sucesso!",
      });
    } catch (erro) {
      console.error("Erro ao fazer logout:", erro);
      return res.status(500).json({
        erro: "Erro ao fazer logout",
      });
    }
  }

  // GET /api/me - Retornar dados do usuário autenticado
  static async me(req, res) {
    try {
      // O middleware verifyToken já adicionou req.usuario
      const usuario = await Usuario.findByPk(req.usuario.id, {
        attributes: ["id", "nome", "email", "telefone", "data_cadastro"],
      });

      if (!usuario) {
        return res.status(404).json({
          erro: "Usuário não encontrado",
        });
      }

      return res.status(200).json({ usuario });
    } catch (erro) {
      console.error("Erro ao buscar usuário:", erro);
      return res.status(500).json({
        erro: "Erro ao buscar dados do usuário",
      });
    }
  }

  // POST /api/verificar-token - Verificar se token é válido
  static async verificarToken(req, res) {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          valido: false,
          erro: "Token não fornecido",
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      return res.status(200).json({
        valido: true,
        usuario: {
          id: decoded.id,
          email: decoded.email,
          nome: decoded.nome,
        },
      });
    } catch (erro) {
      return res.status(401).json({
        valido: false,
        erro: "Token inválido ou expirado",
      });
    }
  }
}

export default AuthController;
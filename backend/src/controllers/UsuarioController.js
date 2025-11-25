import Usuario from "../models/usuario.js";

class UsuarioController {
  // POST /api/usuarios - Cadastrar novo usuário
  static async cadastrar(req, res) {
    try {
      const { nome, email, senha, telefone } = req.body;

      // 1. Validação de campos obrigatórios
      if (!nome || !email || !senha) {
        return res.status(400).json({
          erro: "Campos obrigatórios: nome, email e senha",
        });
      }

      // 2. Validação de nome (mínimo 3 caracteres)
      if (nome.trim().length < 3) {
        return res.status(400).json({
          erro: "O nome deve ter no mínimo 3 caracteres",
        });
      }

      // 3. Validação de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          erro: "Formato de email inválido",
        });
      }

      // 4. Validação de tamanho da senha
      if (senha.length < 6) {
        return res.status(400).json({
          erro: "A senha deve ter no mínimo 6 caracteres",
        });
      }

      // 5. Verificar se email já existe no banco
      const usuarioExistente = await Usuario.findOne({
        where: { email: email.toLowerCase() }
      });

      if (usuarioExistente) {
        return res.status(409).json({
          erro: "E-mail já cadastrado. Deseja recuperar senha?",
          codigo: "EMAIL_DUPLICADO",
        });
      }

      // 6. Criptografar senha usando bcrypt
      const senhaHash = await Usuario.criptografarSenha(senha);

      // 7. Criar usuário no banco de dados
      const novoUsuario = await Usuario.create({
        nome: nome.trim(),
        email: email.toLowerCase().trim(),
        senha_hash: senhaHash,
        telefone: telefone ? telefone.trim() : null,
      });

      // 8. Retornar sucesso (SEM mostrar a senha)
      return res.status(201).json({
        mensagem: "Usuário cadastrado com sucesso!",
        usuario: {
          id: novoUsuario.id,
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          telefone: novoUsuario.telefone,
          data_cadastro: novoUsuario.data_cadastro,
        },
      });

    } catch (erro) {
      console.error("Erro ao cadastrar usuário:", erro);

      // Tratamento de erro do Sequelize (email duplicado via constraint)
      if (erro.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          erro: "E-mail já cadastrado",
          codigo: "EMAIL_DUPLICADO",
        });
      }

      return res.status(500).json({
        erro: "Erro interno ao cadastrar usuário. Tente novamente.",
      });
    }
  }

  // GET /api/usuarios - Listar todos os usuários
  static async listarTodos(req, res) {
    try {
      const usuarios = await Usuario.findAll({
        attributes: ["id", "nome", "email", "telefone", "data_cadastro"],
        order: [["data_cadastro", "DESC"]],
      });

      return res.status(200).json({
        total: usuarios.length,
        usuarios
      });

    } catch (erro) {
      console.error("Erro ao listar usuários:", erro);
      return res.status(500).json({
        erro: "Erro ao listar usuários"
      });
    }
  }

  // GET /api/usuarios/:id - Buscar usuário por ID
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      // Validar se ID é um número
      if (isNaN(id)) {
        return res.status(400).json({
          erro: "ID inválido"
        });
      }

      const usuario = await Usuario.findByPk(id, {
        attributes: ["id", "nome", "email", "telefone", "data_cadastro"],
      });

      if (!usuario) {
        return res.status(404).json({
          erro: "Usuário não encontrado"
        });
      }

      return res.status(200).json({ usuario });

    } catch (erro) {
      console.error("Erro ao buscar usuário:", erro);
      return res.status(500).json({
        erro: "Erro ao buscar usuário"
      });
    }
  }

  // GET /api/usuarios/me - Retorna os dados do usuário logado
  static async usuarioLogado(req, res) {
    try {
      const id = req.usuario.id; // veio do middleware JWT

      const usuario = await Usuario.findByPk(id, {
        attributes: {
          exclude: ["senha_hash"]
        }
      });

      if (!usuario) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
      }

      return res.status(200).json(usuario);

    } catch (error) {
      console.error("Erro ao buscar usuário logado:", error);
      return res.status(500).json({ erro: "Erro ao carregar usuário logado" });
    }
  }

  //ATUALIZAR /api/usuarios/:id - Deletar usuário por ID
  static async atualizar(req, res) {
    try {
      const id = req.params.id;

      const {
        nome,
        email,
        telefone,
        cep,
        rua,
        numero,
        bairro,
        cidade,
        estado
      } = req.body;

      const dados = {
        nome,
        email,
        telefone,
        cep,
        rua,
        numero,
        bairro,
        cidade,
        estado
      };

      // Se recebeu imagem, adiciona caminho dela
      if (req.file) {
        dados.foto = `/uploads/usuarios/${req.file.filename}`;
      }

      await Usuario.update(dados, { where: { id } });

      const usuarioAtualizado = await Usuario.findByPk(id, {
        attributes: { exclude: ["senha_hash"] }
      });

      return res.status(200).json({
        mensagem: "Usuário atualizado com sucesso",
        usuario: usuarioAtualizado
      });

    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      res.status(500).json({ erro: "Erro ao atualizar usuário" });
    }
  }




  // DELETE /api/usuarios/:id - Deletar usuário por ID
  static async deletar(req, res) {
    try {
      const { id } = req.params;

      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).json({
          erro: "Usuário não encontrado"
        });
      }

      await usuario.destroy();

      return res.status(200).json({
        mensagem: "Usuário deletado com sucesso",
      });

    } catch (erro) {
      console.error("Erro ao deletar usuário:", erro);
      return res.status(500).json({
        erro: "Erro ao deletar usuário"
      });
    }
  }
}

export default UsuarioController;
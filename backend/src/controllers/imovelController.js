import { Op } from "sequelize";
import Imovel from "../models/Imovel.js";
import Usuario from "../models/Usuario.js";

export const listarImoveis = async (req, res) => {
  try {
    // Captura parâmetros da URL (ex: /api/imoveis?cidade=Fortaleza&tipo=Casa)
    const { cidade, tipo, precoMin, precoMax, titulo } = req.query;

    // Objeto condicional de filtros
    const filtros = {};

    if (cidade) {
      filtros.cidade = { [Op.like]: `%${cidade}%` };
    }

    if (tipo) {
      filtros.tipo = tipo;
    }

    if (titulo) {
      filtros.titulo = { [Op.like]: `%${titulo}%` };
    }

    if (precoMin || precoMax) {
      filtros.preco = {};
      if (precoMin) filtros.preco[Op.gte] = Number(precoMin);
      if (precoMax) filtros.preco[Op.lte] = Number(precoMax);
    }

    // Busca no banco com os filtros aplicados
    const imoveis = await Imovel.findAll({
      where: filtros,
      order: [["data_cadastro", "DESC"]],
    });

    // Caso não haja imóveis cadastrados
    if (!imoveis || imoveis.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Nenhum imóvel encontrado.",
        dados: [],
      });
    }

    // Sucesso na busca
    return res.status(200).json({
      sucesso: true,
      total: imoveis.length,
      dados: imoveis,
    });

  } catch (erro) {
    console.error("Erro ao listar imóveis:", erro);

    // Retorno padronizado de erro
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno ao listar imóveis. Tente novamente mais tarde.",
      detalhes: process.env.NODE_ENV === "development" ? erro.message : undefined,
    });
  }
};

// POST /api/imoveis - Criar novo imóvel
export const criarImovel = async (req, res) => {
  try {
    const usuario_id = req.usuario.id; // vem do middleware JWT
    const {
      preco,
      periodo,
      cep,
      rua,
      numero,
      bairro,
      cidade,
      estado,
      tipolocal,
      tipoanuncio,
      quartos,
      banheiros,
      vagas,
      comodidades,
    } = req.body;

    // Validações básicas
    if (!preco || !cidade) {
      return res.status(400).json({
        erro: "Preço e cidade são obrigatórios",
      });
    }

    // Processa imagens (múltiplas)
    let imagensArray = [];
    if (req.files && Array.isArray(req.files)) {
      imagensArray = req.files.map(f => `/uploads/imoveis/${f.filename}`);
    }

    // Processa comodidades se for string de formData
    let comodidadesArray = [];
    if (comodidades) {
      if (typeof comodidades === 'string') {
        comodidadesArray = [comodidades];
      } else if (Array.isArray(comodidades)) {
        comodidadesArray = comodidades;
      }
    }

    // Criar imóvel
    const novoImovel = await Imovel.create({
      usuario_id,
      preco: parseFloat(preco),
      periodo,
      cep,
      rua,
      numero,
      bairro,
      cidade,
      estado,
      tipolocal,
      tipoanuncio,
      quartos,
      banheiros,
      vagas,
      comodidades: comodidadesArray,
      imagens: imagensArray,
      imagem_url: imagensArray[0] || null,
    });

    return res.status(201).json({
      mensagem: "Imóvel criado com sucesso!",
      imovel: novoImovel,
    });
  } catch (erro) {
    console.error("Erro ao criar imóvel:", erro);
    return res.status(500).json({
      erro: "Erro ao criar imóvel",
      detalhes: process.env.NODE_ENV === "development" ? erro.message : undefined,
    });
  }
};

// GET /api/imoveis/meus - Listar imóveis do usuário autenticado
export const listarMeusImoveis = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    const imoveis = await Imovel.findAll({
      where: { usuario_id },
      order: [["data_cadastro", "DESC"]],
    });

    return res.status(200).json(imoveis);
  } catch (erro) {
    console.error("Erro ao listar meus imóveis:", erro);
    return res.status(500).json({
      erro: "Erro ao listar imóveis",
    });
  }
};

// DELETE /api/imoveis/:id - Deletar imóvel
export const deletarImovel = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    const imovel = await Imovel.findByPk(id);

    if (!imovel) {
      return res.status(404).json({ erro: "Imóvel não encontrado" });
    }

    if (imovel.usuario_id !== usuario_id) {
      return res.status(403).json({ erro: "Sem permissão para deletar" });
    }

    await imovel.destroy();

    return res.status(200).json({ mensagem: "Imóvel deletado com sucesso" });
  } catch (erro) {
    console.error("Erro ao deletar imóvel:", erro);
    return res.status(500).json({ erro: "Erro ao deletar imóvel" });
  }
};
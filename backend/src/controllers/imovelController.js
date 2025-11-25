import { Op } from "sequelize";
import Imovel from "../models/Imovel.js";

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
/**
 * CRIAR IMÓVEL (POST)
 */

export const criarImovel = async (req, res) => {
  try {
    console.log("BODY RECEBIDO:", req.body);

    const {
      titulo,
      descricao,
      preco,
      cidade,
      tipo,
      imagem_url,
      data_cadastro,
    } = req.body;

    // Validações simples
    if (!titulo || !descricao || !preco || !cidade || !tipo) {
      return res.status(400).json({
        sucesso: false,
        mensagem:
          "Campos obrigatórios: titulo, descricao, preco, cidade, tipo.",
      });
    }

    // Criar o imóvel
    const novoImovel = await Imovel.create({
      titulo,
      descricao,
      preco,
      cidade,
      tipo,
      imagem_url: imagem_url || null,
      data_cadastro: data_cadastro || new Date(),
    });

    return res.status(201).json({
      sucesso: true,
      mensagem: "Imóvel criado com sucesso!",
      dados: novoImovel,
    });
  } catch (erro) {
    console.error("Erro ao criar imóvel:", erro);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno ao criar imóvel.",
      detalhes:
        process.env.NODE_ENV === "development" ? erro.message : undefined,
    });
  }
};

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

    res.status(200).json(imoveis);
  } catch (erro) {
    console.error("Erro ao filtrar imóveis:", erro);
    res.status(500).json({ erro: "Erro ao buscar imóveis." });
  }
};
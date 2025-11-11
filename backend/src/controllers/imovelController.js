import Imovel from "../models/Imovel.js";

export const listarImoveis = async (req, res) => {
  try {
    const imoveis = await Imovel.findAll({
      order: [["data_cadastro", "DESC"]],
    });

    res.status(200).json(imoveis);
  } catch (erro) {
    console.error("Erro ao listar imóveis:", erro);
    res.status(500).json({ erro: "Erro ao listar imóveis." });
  }
};
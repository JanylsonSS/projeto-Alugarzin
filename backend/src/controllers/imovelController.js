import Imovel from "../models/Imovel.js";

export const listarImoveis = async (req, res) => {
  try {
    // Busca todos os imóveis com ordenação decrescente por data de cadastro
    const imoveis = await Imovel.findAll({
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
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
    return res.status(200).json(imoveis);

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

export const buscarImovelPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const imovel = await Imovel.findByPk(id);

    if (!imovel) {
      return res.status(404).json({ error: "Imóvel não encontrado" });
    }

    res.json(imovel);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar imóvel" });
  }
};

export const criarImovel = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const dados = req.body;
    dados.usuario_id = usuarioId;

    // Handle images from multer
    if (req.files && req.files.length > 0) {
      dados.imagens = req.files.map(f => `/uploads/imoveis/${f.filename}`);
      dados.imagem_url = `/uploads/imoveis/${req.files[0].filename}`;
    }

    // Parse comodidades if it's a string (FormData may send single values as string)
    if (typeof dados.comodidades === 'string' && dados.comodidades) {
      try {
        // If frontend sent a JSON array string, parse it
        dados.comodidades = JSON.parse(dados.comodidades);
      } catch (e) {
        // Otherwise keep as string (will be normalized below into an array)
      }
    }

    // Normalize comodidades array and populate boolean flags
    const comods = Array.isArray(dados.comodidades) ? dados.comodidades : (dados.comodidades ? [dados.comodidades] : []);
    const map = {
      mobiliado: 'Mobiliado',
      piscina: 'Piscina',
      garagem: 'Garagem',
      area_gourmet: 'Área Gourmet',
      ar_condicionado: 'Ar Condicionado',
      wifi: 'Wi-Fi',
      aceita_pets: 'Aceita Pets',
      varanda: 'Varanda',
      portaria_24h: 'Portaria 24h',
    };

    Object.keys(map).forEach(k => {
      dados[k] = comods.includes(map[k]);
    });

    const novoImovel = await Imovel.create(dados);
    return res.status(201).json({
      sucesso: true,
      mensagem: "Imóvel criado com sucesso",
      dados: novoImovel,
    });
  } catch (erro) {
    console.error("Erro ao criar imóvel:", erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao criar imóvel",
      detalhes: process.env.NODE_ENV === "development" ? erro.message : undefined,
    });
  }
};

export const listarMeusImoveis = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const imoveis = await Imovel.findAll({
      where: { usuario_id: usuarioId },
      order: [["data_cadastro", "DESC"]],
    });

    return res.status(200).json(imoveis);
  } catch (erro) {
    console.error("Erro ao listar meus imóveis:", erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao listar imóveis",
      detalhes: process.env.NODE_ENV === "development" ? erro.message : undefined,
    });
  }
};

export const deletarImovel = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const imovel = await Imovel.findByPk(id);

    if (!imovel) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Imóvel não encontrado",
      });
    }

    // Verify ownership
    if (imovel.usuario_id !== usuarioId) {
      return res.status(403).json({
        sucesso: false,
        mensagem: "Você não tem permissão para deletar este imóvel",
      });
    }

    await imovel.destroy();

    return res.status(200).json({
      sucesso: true,
      mensagem: "Imóvel deletado com sucesso",
    });
  } catch (erro) {
    console.error("Erro ao deletar imóvel:", erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao deletar imóvel",
      detalhes: process.env.NODE_ENV === "development" ? erro.message : undefined,
    });
  }
};

export const atualizarImovel = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const imovel = await Imovel.findByPk(id);
    if (!imovel) return res.status(404).json({ sucesso: false, mensagem: 'Imóvel não encontrado' });

    // Verifica dono
    if (imovel.usuario_id !== usuarioId) {
      return res.status(403).json({ sucesso: false, mensagem: 'Você não tem permissão para editar este imóvel' });
    }

    const dados = req.body || {};

    // If client didn't send 'periodo' in the form (e.g. user deselected it),
    // explicitly clear it in the database so it no longer appears on listings.
    if (!Object.prototype.hasOwnProperty.call(req.body, 'periodo')) {
      dados.periodo = null;
    }

    // Se foram enviadas novas imagens, substitui
    if (req.files && req.files.length > 0) {
      dados.imagens = req.files.map(f => `/uploads/imoveis/${f.filename}`);
      dados.imagem_url = `/uploads/imoveis/${req.files[0].filename}`;
    }

    // Se comodidades vier como string, tentar parsear
    if (typeof dados.comodidades === 'string' && dados.comodidades) {
      try { dados.comodidades = JSON.parse(dados.comodidades); } catch (e) { /* manter string */ }
    }

    // If comodidades is array/string, normalize and set boolean flags accordingly
    const comods2 = Array.isArray(dados.comodidades) ? dados.comodidades : (dados.comodidades ? [dados.comodidades] : []);
    const map2 = {
      mobiliado: 'Mobiliado',
      piscina: 'Piscina',
      garagem: 'Garagem',
      area_gourmet: 'Área Gourmet',
      ar_condicionado: 'Ar Condicionado',
      wifi: 'Wi-Fi',
      aceita_pets: 'Aceita Pets',
      varanda: 'Varanda',
      portaria_24h: 'Portaria 24h',
    };
    Object.keys(map2).forEach(k => { dados[k] = comods2.includes(map2[k]); });

    await imovel.update(dados);

    return res.status(200).json({ sucesso: true, mensagem: 'Imóvel atualizado', dados: imovel });
  } catch (erro) {
    console.error('Erro ao atualizar imóvel:', erro);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar imóvel', detalhes: process.env.NODE_ENV === 'development' ? erro.message : undefined });
  }
};

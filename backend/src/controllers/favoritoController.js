import Favorito from '../models/Favorito.js';
import Imovel from '../models/Imovel.js';

export const adicionarFavorito = async (req, res) => {
    try {
        const usuarioId = req.usuario && req.usuario.id;
        const { imovel_id } = req.body;
        if (!usuarioId) return res.status(401).json({ erro: 'Não autenticado' });
        if (!imovel_id) return res.status(400).json({ erro: 'Imovel_id requerido' });

        // verifica existência do imóvel
        const imovel = await Imovel.findByPk(imovel_id);
        if (!imovel) return res.status(404).json({ erro: 'Imóvel não encontrado' });

        // não permitir favoritar próprio anúncio
        if (imovel.usuario_id === usuarioId) return res.status(400).json({ erro: 'Não é possível favoritar seu próprio anúncio' });

        // evita duplicatas
        const existente = await Favorito.findOne({ where: { usuario_id: usuarioId, imovel_id } });
        if (existente) return res.status(200).json({ mensagem: 'Já favoritado' });

        const fav = await Favorito.create({ usuario_id: usuarioId, imovel_id });
        return res.status(201).json({ sucesso: true, favorito: fav });
    } catch (err) {
        console.error('Erro ao adicionar favorito:', err);
        return res.status(500).json({ erro: 'Erro interno' });
    }
};

export const removerFavorito = async (req, res) => {
    try {
        const usuarioId = req.usuario && req.usuario.id;
        const imovelId = req.params.imovelId;
        if (!usuarioId) return res.status(401).json({ erro: 'Não autenticado' });

        const fav = await Favorito.findOne({ where: { usuario_id: usuarioId, imovel_id: imovelId } });
        if (!fav) return res.status(404).json({ erro: 'Favorito não encontrado' });

        await fav.destroy();
        return res.status(200).json({ sucesso: true, mensagem: 'Removido' });
    } catch (err) {
        console.error('Erro ao remover favorito:', err);
        return res.status(500).json({ erro: 'Erro interno' });
    }
};

export const listarFavoritosUsuario = async (req, res) => {
    try {
        const usuarioId = req.usuario && req.usuario.id;
        if (!usuarioId) return res.status(401).json({ erro: 'Não autenticado' });

        const registros = await Favorito.findAll({ where: { usuario_id: usuarioId } });
        const imovelIds = registros.map(r => r.imovel_id);
        const imoveis = await Imovel.findAll({ where: { id: imovelIds } });
        return res.status(200).json(imoveis);
    } catch (err) {
        console.error('Erro ao listar favoritos:', err);
        return res.status(500).json({ erro: 'Erro interno' });
    }
};

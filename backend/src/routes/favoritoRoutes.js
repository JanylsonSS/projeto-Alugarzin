import express from 'express';
import { adicionarFavorito, removerFavorito, listarFavoritosUsuario } from '../controllers/favoritoController.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

// POST /api/favoritos - body { imovel_id }
router.post('/favoritos', verifyToken, adicionarFavorito);

// DELETE /api/favoritos/:imovelId
router.delete('/favoritos/:imovelId', verifyToken, removerFavorito);

// GET /api/favoritos/me
router.get('/favoritos/me', verifyToken, listarFavoritosUsuario);

export default router;

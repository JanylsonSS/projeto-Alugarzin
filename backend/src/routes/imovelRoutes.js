import express from "express";
import { listarImoveis, criarImovel, listarMeusImoveis, deletarImovel } from "../controllers/imovelController.js";
import verifyToken from "../middlewares/verifyToken.js";
import uploadImovel from "../config/multerImovel.js";

const router = express.Router();

// GET /api/imoveis - Listar todos
router.get("/imoveis", listarImoveis);

// POST /api/imoveis - Criar novo (requer autenticação)
router.post("/imoveis", verifyToken, uploadImovel.array('imagem', 10), criarImovel);

// GET /api/imoveis/meus - Listar meus anúncios (requer autenticação)
router.get("/imoveis/meus", verifyToken, listarMeusImoveis);

// DELETE /api/imoveis/:id - Deletar imóvel (requer autenticação)
router.delete("/imoveis/:id", verifyToken, deletarImovel);

export default router;
import express from "express";
import { listarImoveis, buscarImovelPorId, criarImovel, listarMeusImoveis, deletarImovel, atualizarImovel } from "../controllers/imovelController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import uploadImovel from "../config/multerImovel.js";

const router = express.Router();

// GET /api/imoveis - Listar todos
router.get("/imoveis", listarImoveis);

// GET /api/imoveis/meus - Listar meus anúncios (DEVE VIR ANTES DE /:id)
router.get("/imoveis/meus", verifyToken, listarMeusImoveis);

// GET /api/imoveis/:id - Buscar por ID
router.get("/imoveis/:id", buscarImovelPorId);

// POST /api/imoveis - Criar novo imóvel
// O frontend envia os arquivos com o nome 'imagens' (plural). Aceitamos esse campo.
router.post("/imoveis", verifyToken, uploadImovel.array("imagens", 10), criarImovel);

// PUT /api/imoveis/:id - Atualizar imóvel (requer proprietário)
router.put("/imoveis/:id", verifyToken, uploadImovel.array("imagens", 10), atualizarImovel);

// DELETE /api/imoveis/:id - Deletar imóvel
router.delete("/imoveis/:id", verifyToken, deletarImovel);

export default router;
import express from "express";
import { listarImoveis, buscarImovelPorId, criarImovel, listarMeusImoveis, deletarImovel, atualizarImovel } from "../controllers/imovelController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import uploadImovel from "../config/multerImovel.js";

const router = express.Router();

// Helper para envolver multer e capturar erros (ex: fileSize, fileFilter)
function multerHandler(fieldName, maxCount) {
	return (req, res, next) => {
		const middleware = uploadImovel.array(fieldName, maxCount);
		middleware(req, res, function (err) {
			if (err) {
				// Retorna mensagem legível em JSON em vez de 500 genérico
				return res.status(400).json({ sucesso: false, mensagem: err.message });
			}
			next();
		});
	};
}

// GET /api/imoveis - Listar todos
router.get("/imoveis", listarImoveis);

// GET /api/imoveis/meus - Listar meus anúncios (DEVE VIR ANTES DE /:id)
router.get("/imoveis/meus", verifyToken, listarMeusImoveis);

// GET /api/imoveis/:id - Buscar por ID
router.get("/imoveis/:id", buscarImovelPorId);

// POST /api/imoveis - Criar novo imóvel
// O frontend envia os arquivos com o nome 'imagens' (plural). Aceitamos esse campo.
router.post("/imoveis", verifyToken, multerHandler("imagens", 10), criarImovel);

// PUT /api/imoveis/:id - Atualizar imóvel (requer proprietário)
router.put("/imoveis/:id", verifyToken, multerHandler("imagens", 10), atualizarImovel);

// DELETE /api/imoveis/:id - Deletar imóvel
router.delete("/imoveis/:id", verifyToken, deletarImovel);

export default router;
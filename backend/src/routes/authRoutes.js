import express from "express";
import AuthController from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/login - Fazer login
router.post("/login", AuthController.login);

// POST /api/logout - Fazer logout
router.post("/logout", AuthController.logout);

// GET /api/me - Obter dados do usuário autenticado (rota protegida)
router.get("/me", verifyToken, AuthController.me);

// POST /api/verificar-token - Verificar se token é válido
router.post("/verificar-token", AuthController.verificarToken);

export default router;
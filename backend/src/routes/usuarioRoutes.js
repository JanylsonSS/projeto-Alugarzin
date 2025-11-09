import express from "express";
import UsuarioController from "../controllers/UsuarioController.js";

const router = express.Router();

// POST /api/usuarios - Cadastrar novo usuário
router.post("/", UsuarioController.cadastrar);

// GET /api/usuarios - Listar todos os usuários
router.get("/", UsuarioController.listarTodos);

// GET /api/usuarios/:id - Buscar usuário por ID
router.get("/:id", UsuarioController.buscarPorId);

// DELETE /api/usuarios/:id - Deletar usuário
router.delete("/:id", UsuarioController.deletar);

export default router;
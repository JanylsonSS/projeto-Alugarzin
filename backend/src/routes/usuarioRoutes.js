import express from "express";
import UsuarioController from "../controllers/UsuarioController.js";
import autenticar from "../middlewares/autenticar.js";

import uploadUsuario from "../config/multerUsuario.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

// POST /api/usuarios - Cadastrar novo usuário
router.post("/", UsuarioController.cadastrar);

// GET /api/usuarios - Listar todos os usuários
router.get("/", UsuarioController.listarTodos);

//Rota protegida para retornar usuário logado
router.get("/me", autenticar, UsuarioController.usuarioLogado);

// GET /api/usuarios/:id - Buscar usuário por ID
router.get("/:id", UsuarioController.buscarPorId);

// DELETE /api/usuarios/:id - Deletar usuário
router.delete("/:id", UsuarioController.deletar);

//Multer na atualização do usuário
router.put(
    "/:id",
    verifyToken,
    uploadUsuario.single("foto_perfil"),
    UsuarioController.atualizar
);

export default router;
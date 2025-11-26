import express from "express";
import { listarImoveis, buscarImovelPorId } from "../controllers/imovelController.js";

const router = express.Router();

// GET /api/imoveis
router.get("/imoveis", listarImoveis);

// GET /api/imoveis/:id
router.get("/imoveis/:id", buscarImovelPorId);

export default router;
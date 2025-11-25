import express from "express";
import { listarImoveis, criarImovel  } from "../controllers/imovelController.js";

const router = express.Router();

// GET /api/imoveis
router.get("/imoveis", listarImoveis);

// POST /api/imoveis
router.post("/imoveis", criarImovel);


export default router;
import express from "express";
import { listarImoveis } from "../controllers/imovelController.js";

const router = express.Router();

// GET /api/imoveis
router.get("/imoveis", listarImoveis);

export default router;
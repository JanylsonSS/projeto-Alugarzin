import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

// Calcular caminho absoluto para a pasta uploads/imoveis a partir deste arquivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'imoveis');

// Garantir que a pasta uploads/imoveis/ existe
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, uniqueName);
    }
});

const uploadImovel = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB por imagem
    },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Apenas imagens JPEG, JPG ou PNG são permitidas."));
        }
        cb(null, true);
    }
});

export default uploadImovel;

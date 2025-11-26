import multer from "multer";
import path from "path";
import fs from "fs";

// Garantir que a pasta uploads/imoveis/ existe
const uploadDir = "uploads/imoveis";
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

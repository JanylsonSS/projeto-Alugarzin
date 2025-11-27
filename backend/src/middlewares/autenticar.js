import jwt from "jsonwebtoken";

export default function autenticar(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ erro: "Token não enviado" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded; // ➜ { id: 10, email: "...", ... }
        next();

    } catch (error) {
        return res.status(401).json({ erro: "Token inválido ou expirado" });
    }
}

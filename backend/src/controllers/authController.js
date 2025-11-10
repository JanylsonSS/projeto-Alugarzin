import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Usuario from '../models/usuario.js'; 

// Login de usuário
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verifica se usuário existe
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // Compara senha com hash
        const senhaValida = await bcrypt.compare(password, usuario.senha_hash);
        if (!senhaValida) {
            return res.status(401).json({ message: 'Senha incorreta.' });
        }

        // Gera token JWT
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET || 'chave-secreta',
            { expiresIn: '2h' }
        );

        res.json({
            message: 'Login bem-sucedido!',
            token,
            user: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao fazer login.' });
    }
};

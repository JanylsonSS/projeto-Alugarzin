import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import sequelize from "./database/connection.js";
// Importar rotas
import usuarioRoutes from "./routes/usuarioRoutes.js";
import imovelRoutes from "./routes/imovelRoutes.js";
import authRoutes from './routes/authRoutes.js';
import favoritoRoutes from './routes/favoritoRoutes.js';
// Importar modelos para associações
import Usuario from "./models/Usuario.js";
import Imovel from "./models/Imovel.js";

// Configurar __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// ========================================
// MIDDLEWARES
// ========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Precisa subir 2 níveis: src -> backend -> projeto-Alugarzin
app.use('/frontend', express.static(path.join(__dirname, '..', '..', 'frontend')));

// Servir uploads (imagens de perfis e anúncios)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Log de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// ROTAS DA API
// ========================================
app.use("/api/usuarios", usuarioRoutes);
app.use("/api", imovelRoutes);
app.use('/api', authRoutes);
app.use('/api', favoritoRoutes);

// Rota raiz
app.get("/", (req, res) => {
  res.json({
    mensagem: "API ALUGARZIN - Backend funcionando!",
    status: "Online",
    frontend: "http://localhost:3000/frontend/login.html",
    rotas: [
      "POST   /api/usuarios - Cadastrar usuário",
      "GET    /api/usuarios - Listar usuários",
      "GET    /api/usuarios/:id - Buscar por ID",
      "DELETE /api/usuarios/:id - Deletar usuário",
    ],
  });
});

// Rota de DEBUG para verificar caminhos
app.get("/debug/paths", (req, res) => {
  const caminhoFrontend = path.join(__dirname, '..', '..', 'frontend');

  res.json({
    servidor_rodando_em: __dirname,
    caminho_frontend_configurado: caminhoFrontend,
    frontend_existe: fs.existsSync(caminhoFrontend),
    arquivos_no_frontend: fs.existsSync(caminhoFrontend)
      ? fs.readdirSync(caminhoFrontend)
      : [],
    login_html_existe: fs.existsSync(path.join(caminhoFrontend, 'login.html'))
  });
});


// TRATAMENTO DE ERROS
app.use((req, res) => {
  res.status(404).json({
    erro: "Rota não encontrada",
    path: req.path,
    dica: "Verifique se o caminho está correto"
  });
});

app.use((err, req, res, next) => {
  console.error("Erro global:", err && (err.stack || err));
  res.status(500).json({
    erro: "Erro interno do servidor",
    detalhes: process.env.NODE_ENV === 'development' ? (err && err.message) : undefined,
  });
});

// INICIAR SERVIDOR
const PORT = process.env.PORT || 3000;

const iniciarServidor = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexão com MySQL estabelecida");
    // Configurar associações entre modelos
    try {
      Usuario.hasMany(Imovel, { foreignKey: 'usuario_id' });
      Imovel.belongsTo(Usuario, { foreignKey: 'usuario_id' });
      console.log('🔗 Associações entre Usuario <-> Imovel configuradas');
    } catch (assocErr) {
      console.warn('⚠️ Falha ao configurar associações:', assocErr.message);
    }
    const syncOptions = process.env.NODE_ENV === 'production' ? { alter: false } : { alter: true };
    console.log(`Synchronizing models with database (alter: ${syncOptions.alter})`);
    await sequelize.sync(syncOptions);
    console.log("✅ Modelos sincronizados com o banco");

    app.listen(PORT, () => {
      console.log(`\n${"=".repeat(60)}`);
      console.log(` Servidor ALUGARZIN rodando na porta ${PORT}`);
      console.log(`${"=".repeat(60)}`);
      console.log(`\n📍 API Backend:`);
      console.log(`   http://localhost:${PORT}`);
      console.log(`\n Frontend (LOGIN):`);
      console.log(`   http://localhost:${PORT}/frontend/login.html`);
      console.log(`\n Debug de caminhos:`);
      console.log(`   http://localhost:${PORT}/debug/paths`);
      console.log(`\n Rotas da API:`);
      console.log(`   POST   /api/usuarios - Cadastrar usuário`);
      console.log(`   GET    /api/usuarios - Listar todos`);
      console.log(`   GET    /api/usuarios/:id - Buscar por ID`);
      console.log(`   DELETE /api/usuarios/:id - Deletar usuário`);
      console.log(`\n${"=".repeat(60)}\n`);

      // Verificar se o frontend foi encontrado
      const frontendPath = path.join(__dirname, '..', '..', 'frontend');
      if (fs.existsSync(frontendPath)) {
        console.log(`✅ Pasta frontend encontrada em:`);
        console.log(`   ${frontendPath}\n`);
      } else {
        console.log(`❌ ATENÇÃO: Pasta frontend NÃO encontrada em:`);
        console.log(`   ${frontendPath}\n`);
      }
    });
  } catch (erro) {
    console.error("❌ Erro ao iniciar servidor:", erro.message);
    process.exit(1);
  }
};

iniciarServidor();
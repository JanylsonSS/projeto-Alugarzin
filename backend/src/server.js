import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./database/connection.js";
import Usuario from "./models/Usuario.js";



const app = express();
app.use(express.json());

sequelize
  .sync()
  .then(() => console.log("Banco conectado e tabela sincronizada!"))
  .catch((err) => console.error("Erro na conexão:", err));

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));

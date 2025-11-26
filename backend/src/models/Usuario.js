import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";
import bcrypt from "bcryptjs";

const Usuario = sequelize.define(
  "Usuario",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    senha_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    foto_perfil: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cep: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    rua: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    numero: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    bairro: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cidade: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    estado: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    whatsapp_link: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    data_cadastro: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "usuarios",
    timestamps: false,
  }
);

Usuario.criptografarSenha = async (senha) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(senha, salt);
};

Usuario.compararSenha = async (senhaPlana, senhaHash) => {
  return await bcrypt.compare(senhaPlana, senhaHash);
};

export default Usuario;


import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";

const Imovel = sequelize.define("Imovel", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  titulo: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  preco: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  periodo: {
    type: DataTypes.STRING(20),
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
    type: DataTypes.STRING(80),
    allowNull: true,
  },
  estado: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  tipolocal: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  tipoanuncio: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  quartos: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  banheiros: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  vagas: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  comodidades: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  mobiliado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  piscina: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  area_gourmet: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  ar_condicionado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  wifi: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  aceita_pets: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  varanda: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  portaria_24h: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  garagem: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  imagens: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  imagem_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  data_cadastro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'imoveis',
  timestamps: false,
});

export default Imovel;
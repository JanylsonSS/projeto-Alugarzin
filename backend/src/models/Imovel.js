
import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";

const Imovel = sequelize.define("Imovel", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  titulo: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  preco: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  cidade: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  tipo: {
    type: DataTypes.STRING(50), // Ex: "Casa", "Apartamento"
    allowNull: false,
  },
  imagem_url: {
    type: DataTypes.STRING(255),
    allowNull: true, // Pode ser nulo se não houver imagem
  },
  data_cadastro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default Imovel;

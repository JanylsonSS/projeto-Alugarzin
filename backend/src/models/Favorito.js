import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';
import Imovel from './Imovel.js';
import Usuario from './Usuario.js';

const Favorito = sequelize.define('Favorito', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    imovel_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    data_cadastro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'favoritos',
    timestamps: false,
});

// Associations (optional convenience)
Usuario.belongsToMany(Imovel, { through: Favorito, foreignKey: 'usuario_id', otherKey: 'imovel_id' });
Imovel.belongsToMany(Usuario, { through: Favorito, foreignKey: 'imovel_id', otherKey: 'usuario_id' });

export default Favorito;

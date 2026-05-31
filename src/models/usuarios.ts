import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Usuarios extends Model {
  public id_usuario!: number;
  public nombre_usuario!: string;
  public contrasena!: string;
  public estado!: number;
  public id_rol!: number;
}

Usuarios.init({
  id_usuario: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre_usuario: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  contrasena: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  estado: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
  },
  id_rol: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'usuarios',
  timestamps: false,
});


export default Usuarios;
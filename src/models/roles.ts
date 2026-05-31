import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Roles extends Model {
  public id_rol!: number;
  public nombre_rol!: string;
}

//Definición del modelo Roles con sus atributos y configuración
Roles.init({
  id_rol: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre_rol: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
}, {
  sequelize,
  tableName: 'roles',
  timestamps: false,
});

export default Roles;
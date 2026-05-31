import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Tratamientos extends Model {
  public id_tratamiento!: number;
  public nombre!: string;
  public descripcion!: string | null;
  public costo!: number;
}

Tratamientos.init({
  id_tratamiento: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  descripcion: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  costo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
}, {
  sequelize,
  tableName: 'tratamientos',
  timestamps: false,
});

export default Tratamientos;
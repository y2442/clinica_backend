import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Especialidad extends Model {
  public id_especialidad!: number;
  public nombre!: string;
}

Especialidad.init({
  id_especialidad: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
}, {
  sequelize,
  tableName: 'especialidades',
  timestamps: false,
});

export default Especialidad;
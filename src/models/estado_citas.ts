import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class EstadoCitas extends Model {
  public id_estado!: number;
  public nombre!: string;
}

EstadoCitas.init({
  id_estado: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
}, {
  sequelize,
  tableName: 'estado_citas',
  timestamps: false,
});

export default EstadoCitas;
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CitasTratamientos extends Model {
  public id_cita_tratamiento!: number;
  public id_cita!: number;
  public id_tratamiento!: number;
  public observacion!: string | null;
}

CitasTratamientos.init({
  id_cita_tratamiento: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_cita: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_tratamiento: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  observacion: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'citas_tratamientos',
  timestamps: false,
});

export default CitasTratamientos;
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Citas extends Model {
  public id_cita!: number;
  public id_paciente!: number;
  public id_medico!: number;
  public id_estado!: number;
  public id_usuario!: number;
  public fecha_cita!: Date;
  public hora_cita!: string;
  public motivo!: string | null;
  public observaciones!: string | null;
  public fecha_registro!: Date;
}

Citas.init({
  id_cita: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_paciente: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_medico: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_estado: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fecha_cita: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  hora_cita: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  motivo: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  observaciones: {
    type: DataTypes.STRING(300),
    allowNull: true,
  },
  fecha_registro: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  tableName: 'citas',
  timestamps: false,
});

export default Citas;
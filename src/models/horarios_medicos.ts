import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class HorarioMedico extends Model {
  public id_horario!: number;
  public dia_semana!: number;
  public hora_inicio!: string;
  public hora_fin!: string;
  public id_medico!: number;
}

HorarioMedico.init({
  id_horario: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  dia_semana: {
    type: DataTypes.TINYINT,
    allowNull: false,
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  hora_fin: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  id_medico: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'horarios_medicos',
  timestamps: false,
});


export default HorarioMedico;
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class MedicoEspecialidad extends Model {
  public id_medico!: number;
  public id_especialidad!: number;
}

MedicoEspecialidad.init({
  id_medico: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  id_especialidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
}, {
  sequelize,
  tableName: 'medico_especialidad',
  timestamps: false,
});

export default MedicoEspecialidad;

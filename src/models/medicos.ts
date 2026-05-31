import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Medicos extends Model {
  public id_medico!: number;
  public dpi!: string;
  public nombre!: string;
  public apellido!: string;
  public telefono!: string;
  public correo!: string | null;
  public direccion!: string | null;
  public fecha_nacimiento!: Date;
  public id_usuario!: number;
}

Medicos.init({
  id_medico: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  dpi: {
    type: DataTypes.STRING(13),
    allowNull: false,
    unique: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING(8),
    allowNull: false,
  },
  correo: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  direccion: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
}, {
  sequelize,
  tableName: 'medicos',
  timestamps: false,
});

export default Medicos;
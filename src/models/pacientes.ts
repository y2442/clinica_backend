import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Pacientes extends Model {
  public id_paciente!: number;
  public dpi!: string;
  public nombre!: string;
  public apellido!: string;
  public telefono!: string;
  public correo!: string | null;
  public direccion!: string | null;
  public fecha_nacimiento!: Date;
  public fecha_registro!: Date;
  public estado!: number;
}

//Definición del modelo Pacientes con sus atributos y configuración
Pacientes.init({
  id_paciente: {
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
  fecha_registro: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  estado: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  sequelize,
  tableName: 'pacientes',
  timestamps: false,
});

export default Pacientes;
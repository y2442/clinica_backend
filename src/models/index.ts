//PRUEBA 1
/*export { default as Roles } from './roles';
export { default as Usuarios } from './usuarios';
export { default as Pacientes } from './pacientes';
export { default as Especialidad } from './especialidades';
export { default as Medicos } from './medicos';
export { default as HorarioMedico } from './horarios_medicos';
export { default as EstadoCitas } from './estado_citas';
export { default as Citas } from './citas';
export { default as Tratamientos } from './tratamientos';*/

//PRUEBA 2

// Primero importamos todos los modelos
import Roles from './roles';
import Usuarios from './usuarios';
import Pacientes from './pacientes';
import Especialidad from './especialidades';
import Medicos from './medicos';
import HorarioMedico from './horarios_medicos';
import EstadoCitas from './estado_citas';
import Citas from './citas';
import Tratamientos from './tratamientos';

// ─── Asociaciones ────────────────────────────────────────────

// Usuarios ↔ Roles
Usuarios.belongsTo(Roles, { foreignKey: 'id_rol', as: 'rol' });
Roles.hasMany(Usuarios, { foreignKey: 'id_rol', as: 'usuarios' });

// Medicos ↔ Usuarios
Medicos.belongsTo(Usuarios, { foreignKey: 'id_usuario', as: 'usuario' });

// Medicos ↔ Especialidades (muchos a muchos)
Medicos.belongsToMany(Especialidad, {
  through: 'medico_especialidad',
  foreignKey: 'id_medico',
  otherKey: 'id_especialidad',
  as: 'especialidades',
});
Especialidad.belongsToMany(Medicos, {
  through: 'medico_especialidad',
  foreignKey: 'id_especialidad',
  otherKey: 'id_medico',
  as: 'medicos',
});

// HorarioMedico ↔ Medicos
HorarioMedico.belongsTo(Medicos, { foreignKey: 'id_medico', as: 'medico' });
Medicos.hasMany(HorarioMedico, { foreignKey: 'id_medico', as: 'horarios' });

// Citas ↔ Pacientes, Medicos, EstadoCitas, Usuarios
Citas.belongsTo(Pacientes, { foreignKey: 'id_paciente', as: 'paciente' });
Citas.belongsTo(Medicos, { foreignKey: 'id_medico', as: 'medico' });
Citas.belongsTo(EstadoCitas, { foreignKey: 'id_estado', as: 'estado' });
Citas.belongsTo(Usuarios, { foreignKey: 'id_usuario', as: 'recepcionista' });

// Citas ↔ Tratamientos (muchos a muchos)
Citas.belongsToMany(Tratamientos, {
  through: 'citas_tratamientos',
  foreignKey: 'id_cita',
  otherKey: 'id_tratamiento',
  as: 'tratamientos',
});
Tratamientos.belongsToMany(Citas, {
  through: 'citas_tratamientos',
  foreignKey: 'id_tratamiento',
  otherKey: 'id_cita',
  as: 'citas',
});

// Luego los exportamos
export {
  Roles,
  Usuarios,
  Pacientes,
  Especialidad,
  Medicos,
  HorarioMedico,
  EstadoCitas,
  Citas,
  Tratamientos,
};

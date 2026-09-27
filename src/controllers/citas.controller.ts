import { Request, Response } from 'express';
import { Op } from 'sequelize';
import {
  Citas, Pacientes, Medicos, EstadoCitas,
  Usuarios, Tratamientos, HorarioMedico, CitasTratamientos
} from '../models';
import { AuthRequest } from '../middlewares/auth.middleware';

//listar citas con filtros
export const listarCitas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha, id_medico, id_estado, busqueda } = req.query;
    const where: any = {};

    if (fecha) where.fecha_cita = fecha;
    if (id_medico) where.id_medico = id_medico;
    if (id_estado) where.id_estado = id_estado;

    const citas = await Citas.findAll({
      where,
      include: [
        { model: Pacientes, as: 'paciente', attributes: ['id_paciente', 'nombre', 'apellido', 'telefono'] },
        { model: Medicos, as: 'medico', attributes: ['id_medico', 'nombre', 'apellido'] },
        { model: EstadoCitas, as: 'estado', attributes: ['id_estado', 'nombre'] },
        { model: Usuarios, as: 'recepcionista', attributes: ['nombre_usuario'] },
      ],
      order: [['fecha_cita', 'ASC'], ['hora_cita', 'ASC']],
    });

    //filtro por nombre de paciente
    const resultado = busqueda
      ? citas.filter((c: any) =>
          `${c.paciente.nombre} ${c.paciente.apellido}`
            .toLowerCase()
            .includes((busqueda as string).toLowerCase())
        )
      : citas;

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener citas', error });
  }
};

//citas de hoy
export const citasHoy = async (_req: Request, res: Response): Promise<void> => {
  try {
    const hoy = new Date();
    const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

    const citas = await Citas.findAll({
      where: {
        fecha_cita: fechaHoy,
        id_estado: { [Op.notIn]: [2] }, // excluye canceladas
      },
      include: [
        { model: Pacientes, as: 'paciente', attributes: ['nombre', 'apellido', 'telefono'] },
        { model: Medicos, as: 'medico', attributes: ['nombre', 'apellido'] },
        { model: EstadoCitas, as: 'estado', attributes: ['nombre'] },
      ],
      order: [['hora_cita', 'ASC']],
    });

    res.json(citas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener citas de hoy', error });
  }
};

//detalle de cita
export const obtenerCita = async (req: Request, res: Response): Promise<void> => {
  try {
    const cita = await Citas.findByPk(req.params.id, {
      include: [
        { model: Pacientes, as: 'paciente' },
        { model: Medicos, as: 'medico' },
        { model: EstadoCitas, as: 'estado' },
        { model: Usuarios, as: 'recepcionista', attributes: ['nombre_usuario'] },
        { model: Tratamientos, as: 'tratamientos', through: { attributes: ['observacion'] } },
      ],
    });

    if (!cita) {
      res.status(404).json({ message: 'Cita no encontrada' });
      return;
    }

    res.json(cita);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener cita', error });
  }
};

//agendar cita
export const agendarCita = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id_paciente, id_medico, fecha_cita, hora_cita, motivo, observaciones } = req.body;

  try {
    //verificar que el paciente existe y está activo
    const paciente = await Pacientes.findOne({ where: { id_paciente, estado: 1 } });
    if (!paciente) {
      res.status(400).json({ message: 'Paciente no encontrado o inactivo' });
      return;
    }

    //verificar que el médico existe y está activo
    const medico = await Medicos.findByPk(id_medico, {
      include: [{ model: Usuarios, as: 'usuario' }],
    });
    if (!medico || (medico as any).usuario?.estado === 0) {
      res.status(400).json({ message: 'Médico no encontrado o inactivo' });
      return;
    }

    //verificar disponibilidad (que no haya otra cita a esa hora)
    const citaExistente = await Citas.findOne({
      where: {
        id_medico,
        fecha_cita,
        hora_cita,
        id_estado: { [Op.notIn]: [2] }, //excluye canceladas
      },
    });
    if (citaExistente) {
      res.status(400).json({ message: 'El médico ya tiene una cita a esa hora' });
      return;
    }

    //verificar que la hora está dentro del horario del médico
    const [anio, mes, dia] = (fecha_cita as string).split('-').map(Number);
    const fechaDate = new Date(anio, mes - 1, dia);
    const diaSemanaJS = fechaDate.getDay();
    const diaSemana = diaSemanaJS === 0 ? 7 : diaSemanaJS;

    const horario = await HorarioMedico.findOne({
      where: {
        id_medico,
        dia_semana: diaSemana,
        hora_inicio: { [Op.lte]: hora_cita },
        hora_fin: { [Op.gt]: hora_cita },
      },
    });
    if (!horario) {
      res.status(400).json({ message: 'La hora seleccionada está fuera del horario del médico' });
      return;
    }

    //obtener estado "Programada" (id_estado = 1)
    const estadoProgramada = await EstadoCitas.findOne({ where: { nombre: 'Programada' } });
    if (!estadoProgramada) {
      res.status(500).json({ message: 'No se encontró el estado Programada en la BD' });
      return;
    }

    const cita = await Citas.create({
      id_paciente,
      id_medico,
      id_estado: estadoProgramada.id_estado,
      id_usuario: req.usuario!.id_usuario,
      fecha_cita,
      hora_cita,
      motivo: motivo || null,
      observaciones: observaciones || null,
    });

    res.status(201).json({ message: 'Cita agendada correctamente', cita });
  } catch (error) {
    res.status(500).json({ message: 'Error al agendar cita', error });
  }
};

//cambiar estado de cita
export const cambiarEstado = async (req: Request, res: Response): Promise<void> => {
  const { id_estado, observaciones } = req.body;

  try {
    const cita = await Citas.findByPk(req.params.id);
    if (!cita) {
      res.status(404).json({ message: 'Cita no encontrada' });
      return;
    }

    const estado = await EstadoCitas.findByPk(id_estado);
    if (!estado) {
      res.status(400).json({ message: 'Estado no válido' });
      return;
    }

    await cita.update({
      id_estado,
      ...(observaciones && { observaciones }),
    });

    res.json({ message: `Cita ${estado.nombre.toLowerCase()} correctamente` });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar estado', error });
  }
};

//reprogramar cita
export const reprogramarCita = async (req: Request, res: Response): Promise<void> => {
  const { fecha_cita, hora_cita, observaciones } = req.body;

  try {
    const cita = await Citas.findByPk(req.params.id);
    if (!cita) {
      res.status(404).json({ message: 'Cita no encontrada' });
      return;
    }

    //verificar disponibilidad en la nueva fecha/hora
    const citaExistente = await Citas.findOne({
      where: {
        id_medico: cita.id_medico,
        fecha_cita,
        hora_cita,
        id_estado: { [Op.notIn]: [2] },
        id_cita: { [Op.ne]: cita.id_cita },
      },
    });
    if (citaExistente) {
      res.status(400).json({ message: 'El médico ya tiene una cita a esa hora' });
      return;
    }

    //verificar horario del médico
    const [anio, mes, dia] = (fecha_cita as string).split('-').map(Number);
    const fechaDate = new Date(anio, mes - 1, dia);
    const diaSemanaJS = fechaDate.getDay();
    const diaSemana = diaSemanaJS === 0 ? 7 : diaSemanaJS;

    const horario = await HorarioMedico.findOne({
      where: {
        id_medico: cita.id_medico,
        dia_semana: diaSemana,
        hora_inicio: { [Op.lte]: hora_cita },
        hora_fin: { [Op.gt]: hora_cita },
      },
    });
    if (!horario) {
      res.status(400).json({ message: 'La hora seleccionada está fuera del horario del médico' });
      return;
    }

    //obtener estado "Reprogramada"
    const estadoReprogramada = await EstadoCitas.findOne({ where: { nombre: 'Reprogramada' } });

    await cita.update({
      fecha_cita,
      hora_cita,
      id_estado: estadoReprogramada!.id_estado,
      ...(observaciones && { observaciones }),
    });

    res.json({ message: 'Cita reprogramada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al reprogramar cita', error });
  }
};

//asignar tratamientos a una cita
export const asignarTratamientos = async (req: Request, res: Response): Promise<void> => {
  const { tratamientos } = req.body;
  // tratamientos = [{ id_tratamiento, observacion }]

  try {
    const cita = await Citas.findByPk(req.params.id);
    if (!cita) {
      res.status(404).json({ message: 'Cita no encontrada' });
      return;
    }

    //eliminar tratamientos anteriores de la cita y agregar los nuevos
    await CitasTratamientos.destroy({ where: { id_cita: req.params.id } });

    if (Array.isArray(tratamientos) && tratamientos.length > 0) {
      const registros = tratamientos.map((t: any) => ({
        id_cita: Number(req.params.id),
        id_tratamiento: Number(t.id_tratamiento),
        observacion: t.observacion || null,
      }));
      await CitasTratamientos.bulkCreate(registros);
    }

    res.json({ message: 'Tratamientos asignados correctamente' });
  } catch (error) {
    console.error('ERROR asignarTratamientos:', error);
    res.status(500).json({ message: 'Error al asignar tratamientos', error });
  }
};

//listar estados de cita
export const listarEstados = async (_req: Request, res: Response): Promise<void> => {
  try {
    const estados = await EstadoCitas.findAll();
    res.json(estados);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estados', error });
  }
};
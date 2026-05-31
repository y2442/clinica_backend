import { Request, Response } from 'express';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import {
  Medicos, Usuarios, Roles, Especialidad,
  HorarioMedico, Citas, EstadoCitas
} from '../models';

const DIAS_SEMANA: Record<number, string> = {
  1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves',
  5: 'Viernes', 6: 'Sábado', 7: 'Domingo',
};

//listar médicos
export const listarMedicos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { busqueda } = req.query;

    const whereUsuario: any = {};
    if (req.query.estado !== undefined && req.query.estado !== '') {
      whereUsuario.estado = Number(req.query.estado);
    }

    const whereMedico: any = {};
    if (busqueda && busqueda !== '') {
      whereMedico[Op.or] = [
        { nombre: { [Op.like]: `%${busqueda}%` } },
        { apellido: { [Op.like]: `%${busqueda}%` } },
        { dpi: { [Op.like]: `%${busqueda}%` } },
      ];
    }

    const medicos = await Medicos.findAll({
      where: whereMedico,
      include: [
        {
          model: Usuarios,
          as: 'usuario',
          where: whereUsuario,
          attributes: ['id_usuario', 'nombre_usuario', 'estado'],
          include: [{ model: Roles, as: 'rol', attributes: ['nombre_rol'] }],
        },
        { model: Especialidad, as: 'especialidades', through: { attributes: [] } },
      ],
      order: [['nombre', 'ASC']],
    });

    res.json(medicos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener médicos', error });
  }
};

//obtener detalle de médico
export const obtenerMedico = async (req: Request, res: Response): Promise<void> => {
  try {
    const medico = await Medicos.findByPk(req.params.id, {
      include: [
        {
          model: Usuarios,
          as: 'usuario',
          attributes: ['id_usuario', 'nombre_usuario', 'estado'],
          include: [{ model: Roles, as: 'rol', attributes: ['nombre_rol'] }],
        },
        { model: Especialidad, as: 'especialidades', through: { attributes: [] } },
        { model: HorarioMedico, as: 'horarios', attributes: ['id_horario', 'dia_semana', 'hora_inicio', 'hora_fin'] },
      ],
    });

    if (!medico) {
      res.status(404).json({ message: 'Médico no encontrado' });
      return;
    }

    //agregar nombre del día a cada horario
    const medicoJSON = medico.toJSON() as any;
    medicoJSON.horarios = medicoJSON.horarios.map((h: any) => ({
      ...h,
      dia_nombre: DIAS_SEMANA[h.dia_semana],
    }));

    res.json(medicoJSON);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener médico', error });
  }
};

//registrar médico
export const crearMedico = async (req: Request, res: Response): Promise<void> => {
  const {
    dpi, nombre, apellido, telefono, correo, direccion,
    fecha_nacimiento, nombre_usuario, contrasena,
  } = req.body;

  try {
    //verificar DPI unico
    const existeDpi = await Medicos.findOne({ where: { dpi } });
    if (existeDpi) {
      res.status(400).json({ message: 'Ya existe un médico con ese DPI' });
      return;
    }

    //verificar nombre de usuario unico
    const existeUsuario = await Usuarios.findOne({ where: { nombre_usuario } });
    if (existeUsuario) {
      res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
      return;
    }

    //obtener rol Médico
    const rolMedico = await Roles.findOne({ where: { nombre_rol: 'Médico' } });
    if (!rolMedico) {
      res.status(400).json({ message: 'No se encontró el rol Médico en la BD' });
      return;
    }

    //crear usuario del medico
    const contrasenaHash = await bcrypt.hash(contrasena, 10);
    const usuario = await Usuarios.create({
      nombre_usuario,
      contrasena: contrasenaHash,
      estado: 1,
      id_rol: rolMedico.id_rol,
    });

    //crear medico
    const medico = await Medicos.create({
      dpi, nombre, apellido, telefono,
      correo: correo || null,
      direccion: direccion || null,
      fecha_nacimiento,
      id_usuario: usuario.id_usuario,
    });

    res.status(201).json({ message: 'Médico registrado correctamente', medico });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar médico', error });
  }
};

//editar datos personales del medico
export const editarMedico = async (req: Request, res: Response): Promise<void> => {
  const { nombre, apellido, telefono, correo, direccion, fecha_nacimiento } = req.body;

  try {
    const medico = await Medicos.findByPk(req.params.id);
    if (!medico) {
      res.status(404).json({ message: 'Médico no encontrado' });
      return;
    }

    await medico.update({ nombre, apellido, telefono, correo: correo || null, direccion: direccion || null, fecha_nacimiento });
    res.json({ message: 'Médico actualizado correctamente', medico });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar médico', error });
  }
};

//activar/desactivar medico por medio del estado del usuario asociado
export const cambiarEstado = async (req: Request, res: Response): Promise<void> => {
  try {
    const medico = await Medicos.findByPk(req.params.id, {
      include: [{ model: Usuarios, as: 'usuario' }],
    });

    if (!medico) {
      res.status(404).json({ message: 'Médico no encontrado' });
      return;
    }

    const usuario = await Usuarios.findByPk(medico.id_usuario);
    if (!usuario) {
      res.status(404).json({ message: 'Usuario del médico no encontrado' });
      return;
    }

    const nuevoEstado = usuario.estado === 1 ? 0 : 1;
    await usuario.update({ estado: nuevoEstado });

    res.json({
      message: `Médico ${nuevoEstado === 1 ? 'activado' : 'desactivado'} correctamente`,
      estado: nuevoEstado,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar estado', error });
  }
};

//asignar especialidades al médico
export const asignarEspecialidades = async (req: Request, res: Response): Promise<void> => {
  const { especialidades } = req.body; //array de id_especialidad

  try {
    const medico = await Medicos.findByPk(req.params.id);
    if (!medico) {
      res.status(404).json({ message: 'Médico no encontrado' });
      return;
    }

    //sequelize maneja la tabla medico_especialidad automáticamente
    await (medico as any).setEspecialidades(especialidades);
    res.json({ message: 'Especialidades actualizadas correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al asignar especialidades', error });
  }
};

//quitar una especialidad
export const quitarEspecialidad = async (req: Request, res: Response): Promise<void> => {
  try {
    const medico = await Medicos.findByPk(req.params.id);
    if (!medico) {
      res.status(404).json({ message: 'Médico no encontrado' });
      return;
    }

    await (medico as any).removeEspecialidad(Number(req.params.idEsp));
    res.json({ message: 'Especialidad removida correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al quitar especialidad', error });
  }
};

//agregar horario
export const agregarHorario = async (req: Request, res: Response): Promise<void> => {
  const { dia_semana, hora_inicio, hora_fin } = req.body;

  try {
    const medico = await Medicos.findByPk(req.params.id);
    if (!medico) {
      res.status(404).json({ message: 'Médico no encontrado' });
      return;
    }

    //verificar que no haya conflicto de horario ese día
    const conflicto = await HorarioMedico.findOne({
      where: {
        id_medico: medico.id_medico,
        dia_semana,
        [Op.or]: [
          { hora_inicio: { [Op.between]: [hora_inicio, hora_fin] } },
          { hora_fin: { [Op.between]: [hora_inicio, hora_fin] } },
        ],
      },
    });

    if (conflicto) {
      res.status(400).json({ message: 'Ya existe un horario que se superpone ese día' });
      return;
    }

    const horario = await HorarioMedico.create({
      id_medico: medico.id_medico,
      dia_semana,
      hora_inicio,
      hora_fin,
    });

    res.status(201).json({
      message: 'Horario agregado correctamente',
      horario: { ...horario.toJSON(), dia_nombre: DIAS_SEMANA[dia_semana] },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar horario', error });
  }
};

//eliminar horario
export const eliminarHorario = async (req: Request, res: Response): Promise<void> => {
  try {
    const horario = await HorarioMedico.findOne({
      where: {
        id_horario: req.params.idHorario,
        id_medico: req.params.id,
      },
    });

    if (!horario) {
      res.status(404).json({ message: 'Horario no encontrado' });
      return;
    }

    await horario.destroy();
    res.json({ message: 'Horario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar horario', error });
  }
};

//consultar disponibilidad del medico por fecha
export const consultarDisponibilidad = async (req: Request, res: Response): Promise<void> => {
  const { fecha } = req.query;

  try {
    if (!fecha) {
      res.status(400).json({ message: 'Debes proporcionar una fecha' });
      return;
    }

    //convertir fecha a objeto Date y obtener día de la semana
    /*const fechaDate = new Date(fecha as string);
    // getDay() → 0=Domingo, 1=Lunes... convertimos a nuestro formato 1=Lunes...7=Domingo
    const diaSemanaJS = fechaDate.getDay();
    const diaSemana = diaSemanaJS === 0 ? 7 : diaSemanaJS;*/

    //para evitar problemas de zona horaria, parseamos la fecha manualmente
    const [anio, mes, dia] = (fecha as string).split('-').map(Number);
    const fechaDate = new Date(anio, mes - 1, dia); // fecha local sin UTC
    const diaSemanaJS = fechaDate.getDay();
    const diaSemana = diaSemanaJS === 0 ? 7 : diaSemanaJS;

    // Horarios del médico ese día
    const horarios = await HorarioMedico.findAll({
      where: { id_medico: req.params.id, dia_semana: diaSemana },
    });

    if (horarios.length === 0) {
      res.json({ disponible: false, message: 'El médico no trabaja ese día', slots: [] });
      return;
    }

    // Citas ya agendadas ese día
    const citasAgendadas = await Citas.findAll({
      where: {
        id_medico: req.params.id,
        fecha_cita: fecha as string,
      },
      include: [{ model: EstadoCitas, as: 'estado' }],
    });

    const horasOcupadas = citasAgendadas
      .filter((c: any) => c.estado.nombre !== 'Cancelada')
      .map((c: any) => c.hora_cita);

    //generar slots de 30 minutos por cada horario
    const slots: { hora: string; disponible: boolean }[] = [];

    for (const horario of horarios) {
      const [hIni, mIni] = horario.hora_inicio.split(':').map(Number);
      const [hFin, mFin] = horario.hora_fin.split(':').map(Number);

      let minutos = hIni * 60 + mIni;
      const minutosFin = hFin * 60 + mFin;

      while (minutos < minutosFin) {
        const hh = String(Math.floor(minutos / 60)).padStart(2, '0');
        const mm = String(minutos % 60).padStart(2, '0');
        const hora = `${hh}:${mm}:00`;

        slots.push({
          hora: `${hh}:${mm}`,
          disponible: !horasOcupadas.includes(hora),
        });

        minutos += 30;
      }
    }

    res.json({
      disponible: slots.some(s => s.disponible),
      dia_nombre: DIAS_SEMANA[diaSemana],
      slots,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al consultar disponibilidad', error });
  }
};

//listar todas las especialidades (para el formulario)
export const listarEspecialidades = async (_req: Request, res: Response): Promise<void> => {
  try {
    const especialidades = await Especialidad.findAll({ order: [['nombre', 'ASC']] });
    res.json(especialidades);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener especialidades', error });
  }
};
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Pacientes, Citas, Medicos, EstadoCitas } from '../models';

//listar pacientes con filtros
export const listarPacientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { estado, busqueda } = req.query;

    const where: any = {};

    //filtro por estado (activo/inactivo)
    if (estado !== undefined && estado !== '') {
      where.estado = Number(estado);
    }

    //búsqueda por nombre o DPI
    if (busqueda && busqueda !== '') {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${busqueda}%` } },
        { apellido: { [Op.like]: `%${busqueda}%` } },
        { dpi: { [Op.like]: `%${busqueda}%` } },
      ];
    }

    const pacientes = await Pacientes.findAll({
      where,
      order: [['fecha_registro', 'DESC']],
    });

    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pacientes', error });
  }
};

//ver detalle de un paciente mas historial de citas
export const obtenerPaciente = async (req: Request, res: Response): Promise<void> => {
  try {
    const paciente = await Pacientes.findByPk(req.params.id);

    if (!paciente) {
      res.status(404).json({ message: 'Paciente no encontrado' });
      return;
    }

    //historial de citas del paciente
    const citas = await Citas.findAll({
      where: { id_paciente: paciente.id_paciente },
      include: [
        { model: Medicos, as: 'medico', attributes: ['nombre', 'apellido'] },
        { model: EstadoCitas, as: 'estado', attributes: ['nombre'] },
      ],
      order: [['fecha_cita', 'DESC']],
    });

    res.json({ paciente, citas });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener paciente', error });
  }
};

//registrar paciente
export const crearPaciente = async (req: Request, res: Response): Promise<void> => {
  const { dpi, nombre, apellido, telefono, correo, direccion, fecha_nacimiento } = req.body;

  try {
    //verificar DPI único
    const existe = await Pacientes.findOne({ where: { dpi } });
    if (existe) {
      res.status(400).json({ message: 'Ya existe un paciente con ese DPI' });
      return;
    }

    const paciente = await Pacientes.create({
      dpi,
      nombre,
      apellido,
      telefono,
      correo: correo || null,
      direccion: direccion || null,
      fecha_nacimiento,
      estado: 1,
    });

    res.status(201).json({ message: 'Paciente registrado correctamente', paciente });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar paciente', error });
  }
};

//editar paciente (sin DPI)
export const editarPaciente = async (req: Request, res: Response): Promise<void> => {
  const { nombre, apellido, telefono, correo, direccion, fecha_nacimiento } = req.body;

  try {
    const paciente = await Pacientes.findByPk(req.params.id);
    if (!paciente) {
      res.status(404).json({ message: 'Paciente no encontrado' });
      return;
    }

    await paciente.update({
      nombre,
      apellido,
      telefono,
      correo: correo || null,
      direccion: direccion || null,
      fecha_nacimiento,
    });

    res.json({ message: 'Paciente actualizado correctamente', paciente });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar paciente', error });
  }
};

//activar/desactivar paciente
export const cambiarEstado = async (req: Request, res: Response): Promise<void> => {
  try {
    const paciente = await Pacientes.findByPk(req.params.id);
    if (!paciente) {
      res.status(404).json({ message: 'Paciente no encontrado' });
      return;
    }

    const nuevoEstado = paciente.estado === 1 ? 0 : 1;
    await paciente.update({ estado: nuevoEstado });

    res.json({
      message: `Paciente ${nuevoEstado === 1 ? 'activado' : 'desactivado'} correctamente`,
      estado: nuevoEstado,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar estado', error });
  }
};
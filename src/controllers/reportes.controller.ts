import { Request, Response } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import { Citas, Medicos, Pacientes, Tratamientos, EstadoCitas } from '../models';

//reporte general
export const reporteGeneral = async (req: Request, res: Response): Promise<void> => {
  try {
    const { desde, hasta } = req.query;

    const whereFecha: any = {};
    if (desde && hasta) {
      whereFecha.fecha_cita = { [Op.between]: [desde, hasta] };
    } else if (desde) {
      whereFecha.fecha_cita = { [Op.gte]: desde };
    } else {
      // Por defecto el mes actual
      const hoy = new Date();
      const primerDia = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
      const ultimoDia = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-31`;
      whereFecha.fecha_cita = { [Op.between]: [primerDia, ultimoDia] };
    }

    //total citas y por estado
    const totalCitas = await Citas.count({ where: whereFecha });
    const citasPorEstado = await Citas.findAll({
      where: whereFecha,
      include: [{ model: EstadoCitas, as: 'estado', attributes: ['nombre'] }],
      attributes: ['id_estado', [fn('COUNT', col('Citas.id_cita')), 'total']],
      group: ['id_estado', 'estado.id_estado'],
    });

    //nuevos pacientes en el período
    const nuevoPacientesWhere: any = {};
    if (desde && hasta) {
      nuevoPacientesWhere.fecha_registro = { [Op.between]: [desde, hasta] };
    } else {
      const hoy = new Date();
      const primerDia = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
      nuevoPacientesWhere.fecha_registro = { [Op.gte]: primerDia };
    }
    const nuevosPacientes = await Pacientes.count({ where: nuevoPacientesWhere });

    //citas por médico
    const citasPorMedico = await Citas.findAll({
      where: whereFecha,
      include: [
        { model: Medicos, as: 'medico', attributes: ['nombre', 'apellido'] },
        { model: EstadoCitas, as: 'estado', attributes: ['nombre'] },
      ],
      attributes: ['id_medico', [fn('COUNT', col('Citas.id_cita')), 'total']],
      group: ['id_medico', 'medico.id_medico', 'estado.id_estado', 'estado.nombre'],
    });

    //agrupar citas por médico con sus estados
    const medicoMap: Record<number, any> = {};
    for (const c of citasPorMedico as any[]) {
      const idMedico = c.id_medico;
      if (!medicoMap[idMedico]) {
        medicoMap[idMedico] = {
          id_medico: idMedico,
          nombre: `${c.medico.nombre} ${c.medico.apellido}`,
          total: 0,
          completadas: 0,
          canceladas: 0,
          programadas: 0,
          reprogramadas: 0,
        };
      }
      const total = Number(c.dataValues.total);
      medicoMap[idMedico].total += total;
      const estado = c.estado.nombre;
      if (estado === 'Completada') medicoMap[idMedico].completadas += total;
      else if (estado === 'Cancelada') medicoMap[idMedico].canceladas += total;
      else if (estado === 'Programada') medicoMap[idMedico].programadas += total;
      else if (estado === 'Reprogramada') medicoMap[idMedico].reprogramadas += total;
    }

    const resumenMedicos = Object.values(medicoMap).map((m: any) => ({
      ...m,
      efectividad: m.total > 0 ? Math.round((m.completadas / m.total) * 100) : 0,
    }));

    res.json({
      totalCitas,
      nuevosPacientes,
      citasPorEstado: citasPorEstado.map((c: any) => ({
        estado: c.estado.nombre,
        total: Number(c.dataValues.total),
      })),
      resumenMedicos,
    });
  } catch (error) {
    console.error('ERROR reporteGeneral:', error);
    res.status(500).json({ message: 'Error al generar reporte', error });
  }
};

//citas por mes (últimos 12 meses)
export const citasPorMes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const hoy = new Date();
    const hace12Meses = new Date(hoy.getFullYear(), hoy.getMonth() - 11, 1);
    const desde = `${hace12Meses.getFullYear()}-${String(hace12Meses.getMonth() + 1).padStart(2, '0')}-01`;

    const citas = await Citas.findAll({
        where: { fecha_cita: { [Op.gte]: desde } },
        attributes: [
            [fn('YEAR', col('fecha_cita')), 'anio'],
            [fn('MONTH', col('fecha_cita')), 'mes'],
            [fn('COUNT', col('id_cita')), 'total'],
        ],
        group: [
            fn('YEAR', col('fecha_cita')),
            fn('MONTH', col('fecha_cita')),
        ],
        order: [
            [fn('YEAR', col('fecha_cita')), 'ASC'],
            [fn('MONTH', col('fecha_cita')), 'ASC'],
        ],
    });

    //generar array de los últimos 12 meses
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const resultado = [];

    for (let i = 11; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const anio = fecha.getFullYear();
      const mes = fecha.getMonth() + 1;
      const encontrado = (citas as any[]).find(c =>
        Number(c.dataValues.anio) === anio && Number(c.dataValues.mes) === mes
      );
      resultado.push({
        label: `${meses[mes - 1]} ${anio}`,
        mes: meses[mes - 1],
        total: encontrado ? Number(encontrado.dataValues.total) : 0,
      });
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener citas por mes', error });
  }
};

//tratamientos más realizados
export const tratamientosMasRealizados = async (_req: Request, res: Response): Promise<void> => {
  try {
    const resultado = await Tratamientos.findAll({
      attributes: [
        'id_tratamiento',
        'nombre',
        'costo',
        [fn('COUNT', col('citas.id_cita')), 'total_usos'],
      ],
      include: [{
        model: Citas,
        as: 'citas',
        attributes: [],
        through: { attributes: [] },
        required: false,
      }],
      group: [
        'Tratamientos.id_tratamiento',
        'Tratamientos.nombre',
        'Tratamientos.costo',
      ],
      order: [[fn('COUNT', col('citas.id_cita')), 'DESC']],
      limit: 8,
      subQuery: false,
    });

    res.json(resultado.map((t: any) => ({
      id_tratamiento: t.id_tratamiento,
      nombre: t.nombre,
      costo: Number(t.costo),
      total_usos: Number(t.dataValues.total_usos),
    })));
  } catch (error) {
    console.error('ERROR tratamientosMasRealizados:', error);
    res.status(500).json({ message: 'Error al obtener tratamientos', error });
  }
};
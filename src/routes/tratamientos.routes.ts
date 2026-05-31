import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import { Tratamientos } from '../models';
import { verifyToken } from '../middlewares/auth.middleware';
import { verifyRole } from '../middlewares/role.middleware';

const router = Router();
router.use(verifyToken);

// Listar tratamientos con búsqueda opcional
router.get('/', async (req: Request, res: Response) => {
  try {
    const { busqueda } = req.query;
    const where: any = {};

    if (busqueda && busqueda !== '') {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${busqueda}%` } },
        { descripcion: { [Op.like]: `%${busqueda}%` } },
      ];
    }

    const tratamientos = await Tratamientos.findAll({
      where,
      order: [['nombre', 'ASC']],
    });
    res.json(tratamientos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tratamientos', error });
  }
});

// Obtener un tratamiento por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const tratamiento = await Tratamientos.findByPk(req.params.id);
    if (!tratamiento) {
      res.status(404).json({ message: 'Tratamiento no encontrado' });
      return;
    }
    res.json(tratamiento);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tratamiento', error });
  }
});

// Crear tratamiento
router.post('/', verifyRole('Administrador'), async (req: Request, res: Response) => {
  const { nombre, descripcion, costo } = req.body;
  try {
    // Verificar nombre único
    const existe = await Tratamientos.findOne({ where: { nombre } });
    if (existe) {
      res.status(400).json({ message: 'Ya existe un tratamiento con ese nombre' });
      return;
    }

    const tratamiento = await Tratamientos.create({
      nombre,
      descripcion: descripcion || null,
      costo: costo || 0,
    });

    res.status(201).json({ message: 'Tratamiento creado correctamente', tratamiento });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear tratamiento', error });
  }
});

// Editar tratamiento
router.put('/:id', verifyRole('Administrador'), async (req: Request, res: Response) => {
  const { nombre, descripcion, costo } = req.body;
  try {
    const tratamiento = await Tratamientos.findByPk(req.params.id);
    if (!tratamiento) {
      res.status(404).json({ message: 'Tratamiento no encontrado' });
      return;
    }

    // Verificar nombre único si cambió
    if (nombre && nombre !== tratamiento.nombre) {
      const existe = await Tratamientos.findOne({ where: { nombre } });
      if (existe) {
        res.status(400).json({ message: 'Ya existe un tratamiento con ese nombre' });
        return;
      }
    }

    await tratamiento.update({
      nombre,
      descripcion: descripcion || null,
      costo,
    });

    res.json({ message: 'Tratamiento actualizado correctamente', tratamiento });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar tratamiento', error });
  }
});

// Eliminar tratamiento
router.delete('/:id', verifyRole('Administrador'), async (req: Request, res: Response) => {
  try {
    const tratamiento = await Tratamientos.findByPk(req.params.id);
    if (!tratamiento) {
      res.status(404).json({ message: 'Tratamiento no encontrado' });
      return;
    }

    await tratamiento.destroy();
    res.json({ message: 'Tratamiento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar tratamiento', error });
  }
});

export default router;
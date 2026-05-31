import { Router } from 'express';
import {
  listarMedicos, obtenerMedico, crearMedico, editarMedico,
  cambiarEstado, asignarEspecialidades, quitarEspecialidad,
  agregarHorario, eliminarHorario, consultarDisponibilidad,
  listarEspecialidades,
} from '../controllers/medicos.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { verifyRole } from '../middlewares/role.middleware';

const router = Router();

router.use(verifyToken);

//todos los roles pueden ver médicos y disponibilidad
router.get('/', listarMedicos);
router.get('/especialidades', listarEspecialidades);
router.get('/:id', obtenerMedico);
router.get('/:id/disponibilidad', consultarDisponibilidad);

//solo admin gestiona médicos
router.post('/', verifyRole('Administrador'), crearMedico);
router.put('/:id', verifyRole('Administrador'), editarMedico);
router.patch('/:id/estado', verifyRole('Administrador'), cambiarEstado);
router.post('/:id/especialidades', verifyRole('Administrador'), asignarEspecialidades);
router.delete('/:id/especialidades/:idEsp', verifyRole('Administrador'), quitarEspecialidad);
router.post('/:id/horarios', verifyRole('Administrador'), agregarHorario);
router.delete('/:id/horarios/:idHorario', verifyRole('Administrador'), eliminarHorario);

export default router;
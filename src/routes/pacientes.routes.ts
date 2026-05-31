import { Router } from 'express';
import {
  listarPacientes,
  obtenerPaciente,
  crearPaciente,
  editarPaciente,
  cambiarEstado,
} from '../controllers/pacientes.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { verifyRole } from '../middlewares/role.middleware';

const router = Router();

router.use(verifyToken);

//todos los roles pueden ver y buscar pacientes
router.get('/', listarPacientes);
router.get('/:id', obtenerPaciente);

//solo admin y recepcionista pueden crear/editar
router.post('/', verifyRole('Administrador', 'Recepcionista'), crearPaciente);
router.put('/:id', verifyRole('Administrador', 'Recepcionista'), editarPaciente);
router.patch('/:id/estado', verifyRole('Administrador', 'Recepcionista'), cambiarEstado);

export default router;
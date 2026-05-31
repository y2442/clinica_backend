import { Router } from 'express';
import {
  listarCitas, citasHoy, obtenerCita, agendarCita,
  cambiarEstado, reprogramarCita, asignarTratamientos, listarEstados,
} from '../controllers/citas.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { verifyRole } from '../middlewares/role.middleware';

const router = Router();

router.use(verifyToken);

//todos pueden ver citas
router.get('/', listarCitas);
router.get('/hoy', citasHoy);
router.get('/estados', listarEstados);
router.get('/:id', obtenerCita);

//solo recepcionista y admin agendan y gestionan
router.post('/', verifyRole('Administrador', 'Recepcionista'), agendarCita);
router.patch('/:id/estado', verifyRole('Administrador', 'Recepcionista'), cambiarEstado);
router.put('/:id/reprogramar', verifyRole('Administrador', 'Recepcionista'), reprogramarCita);

//Solo médico y admin asignan tratamientos
router.post('/:id/tratamientos', verifyRole('Administrador', 'Médico'), asignarTratamientos);

export default router;

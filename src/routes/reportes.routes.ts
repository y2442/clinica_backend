import { Router } from 'express';
import {
  reporteGeneral,
  citasPorMes,
  tratamientosMasRealizados,
} from '../controllers/reportes.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { verifyRole } from '../middlewares/role.middleware';

const router = Router();

router.use(verifyToken);
router.use(verifyRole('Administrador'));

router.get('/general', reporteGeneral);
router.get('/citas-por-mes', citasPorMes);
router.get('/tratamientos', tratamientosMasRealizados);

export default router;
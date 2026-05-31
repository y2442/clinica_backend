import { Router } from 'express';
import {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  editarUsuario,
  cambiarEstado,
  listarRoles,
} from '../controllers/usuarios.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { verifyRole } from '../middlewares/role.middleware';

const router = Router();

//todas las rutas requieren token y rol Administrador
router.use(verifyToken);
router.use(verifyRole('Administrador'));

router.get('/', listarUsuarios);
router.get('/roles', listarRoles);
router.get('/:id', obtenerUsuario);
router.post('/', crearUsuario);
router.put('/:id', editarUsuario);
router.patch('/:id/estado', cambiarEstado);

export default router;
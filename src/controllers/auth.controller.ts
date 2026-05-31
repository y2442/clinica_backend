import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuarios } from '../models';
import { Roles } from '../models';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { nombre_usuario, contrasena } = req.body; 

  try {
    //buscar el usuario incluyendo su rol
    const usuario = await Usuarios.findOne({
      where: { nombre_usuario, estado: 1 },
      include: [{ model: Roles, as: 'rol' }],
    });

    if (!usuario) {
      res.status(401).json({ message: 'Usuario no encontrado o inactivo' });
      return;
    }

    //verificar contraseña
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      res.status(401).json({ message: 'Contraseña incorrecta' });
      return;
    }

    //generar JWT para el usuario, permite acceder a rutas protegidas
    const payload = {
      id_usuario: usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      id_rol: usuario.id_rol,
      nombre_rol: (usuario as any).rol.nombre_rol,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '8h' });

    res.json({
      message: 'Login exitoso',
      token,
      usuario: payload,
    });

  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};
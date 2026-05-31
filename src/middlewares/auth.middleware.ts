import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  usuario?: {
    id_usuario: number;
    nombre_usuario: string;
    id_rol: number;
    nombre_rol: string;
  };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ message: 'Token no proporcionado' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthRequest['usuario'];
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Token inválido o expirado' });
  }
};
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const verifyRole = (...rolesPermitidos: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const rol = req.usuario?.nombre_rol;

    if (!rol || !rolesPermitidos.includes(rol)) {
      res.status(403).json({
        message: `Acceso denegado. Se requiere uno de estos roles: ${rolesPermitidos.join(', ')}`
      });
      return;
    }

    next();
  };
};
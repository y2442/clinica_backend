import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Usuarios, Roles } from '../models';

//listar todos los usuarios
export const listarUsuarios = async (_req: Request, res: Response): Promise<void> => {
  try {
    const usuarios = await Usuarios.findAll({
      include: [{ model: Roles, as: 'rol' }],
      attributes: { exclude: ['contrasena'] }, //nunca devolver la contraseña aunque esté encriptada
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error });
  }
};

//obtener un usuario por ID
export const obtenerUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuario = await Usuarios.findByPk(req.params.id, {
      include: [{ model: Roles, as: 'rol' }],
      attributes: { exclude: ['contrasena'] },
    });

    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuario', error });
  }
};

//crear usuario
export const crearUsuario = async (req: Request, res: Response): Promise<void> => {
  const { nombre_usuario, contrasena, id_rol } = req.body;

  try {
    //verificar si el nombre de usuario ya existe
    const existe = await Usuarios.findOne({ where: { nombre_usuario } });
    if (existe) {
      res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
      return;
    }

    //verificar que el rol existe
    const rol = await Roles.findByPk(id_rol);
    if (!rol) {
      res.status(400).json({ message: 'El rol especificado no existe' });
      return;
    }

    //encriptar contraseña
    const contrasenaHash = await bcrypt.hash(contrasena, 10);

    const nuevoUsuario = await Usuarios.create({
      nombre_usuario,
      contrasena: contrasenaHash,
      id_rol,
      estado: 1,
    });

    res.status(201).json({
      message: 'Usuario creado correctamente',
      usuario: {
        id_usuario: nuevoUsuario.id_usuario,
        nombre_usuario: nuevoUsuario.nombre_usuario,
        id_rol: nuevoUsuario.id_rol,
        estado: nuevoUsuario.estado,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear usuario', error });
  }
};

//editar usuario
export const editarUsuario = async (req: Request, res: Response): Promise<void> => {
  const { nombre_usuario, contrasena, id_rol } = req.body;

  try {
    const usuario = await Usuarios.findByPk(req.params.id);
    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    //verificar que el nuevo nombre no esté en uso por otro usuario
    if (nombre_usuario && nombre_usuario !== usuario.nombre_usuario) {
      const existe = await Usuarios.findOne({ where: { nombre_usuario } });
      if (existe) {
        res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
        return;
      }
    }

    //verificar que el rol existe
    if (id_rol) {
      const rol = await Roles.findByPk(id_rol);
      if (!rol) {
        res.status(400).json({ message: 'El rol especificado no existe' });
        return;
      }
    }

    //si viene nueva contraseña, encriptarla
    const datosActualizar: any = { nombre_usuario, id_rol };
    if (contrasena) {
      datosActualizar.contrasena = await bcrypt.hash(contrasena, 10);
    }

    await usuario.update(datosActualizar);

    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario', error });
  }
};

//cambiar estado (activar/desactivar)
export const cambiarEstado = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuario = await Usuarios.findByPk(req.params.id);
    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    const nuevoEstado = usuario.estado === 1 ? 0 : 1;
    await usuario.update({ estado: nuevoEstado });

    res.json({
      message: `Usuario ${nuevoEstado === 1 ? 'activado' : 'desactivado'} correctamente`,
      estado: nuevoEstado,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar estado', error });
  }
};

//listar roles (para el formulario de crear/editar usuario)
export const listarRoles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const roles = await Roles.findAll();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener roles', error });
  }
};
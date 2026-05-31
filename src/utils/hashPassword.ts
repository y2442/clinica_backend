//este script se ejecuta una sola vez para encriptar las contraseñas existentes en la base de datos.

import dotenv from 'dotenv';
dotenv.config();  // ← agrega esto antes de todo

import bcrypt from 'bcryptjs';
import { Usuarios } from '../models';
import sequelize from '../config/database';

async function hashExistingPasswords() {
  await sequelize.authenticate();

  const usuarios = await Usuarios.findAll();

  for (const usuario of usuarios) {
    const yaEncriptada = usuario.contrasena.startsWith('$2');
    if (!yaEncriptada) {
      const hash = await bcrypt.hash(usuario.contrasena, 10);
      await usuario.update({ contrasena: hash });
      console.log(`Contraseña encriptada para: ${usuario.nombre_usuario}`);
    }
  }

  console.log('Proceso completado');
  process.exit(0);
}

hashExistingPasswords();

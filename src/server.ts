import dotenv from 'dotenv';
dotenv.config(); //carga las variables de entorno desde el archivo .env

import app from './app';
import sequelize from './config/database';
import './models'; //se asegura que todos los modelos y asociaciones se registren

const PORT = process.env.PORT || 3000;

//inicia el servidor después de verificar la conexión a la base de datos y sincronizar los modelos
/*async function main() {
  try {
    // Verifica la conexión a la base de datos
    await sequelize.authenticate();
    console.log('Conexión a MySQL establecida correctamente');

    // Sincroniza los modelos con la base de datos
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados con la base de datos');

    // Inicia el servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}*/

//versión mejorada con manejo de errores más robusto y logging de rutas para depuración
async function main() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a MySQL establecida correctamente');

    await sequelize.sync({ alter: false });
    console.log('Modelos sincronizados con la base de datos');

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);

      // Debug de rutas aquí, cuando el servidor ya está listo
      console.log('\nRutas registradas:');
      (app as any)._router.stack.forEach((r: any) => {
        if (r.route) {
          console.log(' -', Object.keys(r.route.methods), r.route.path);
        }
        if (r.handle && r.handle.stack) {
          r.handle.stack.forEach((sr: any) => {
            if (sr.route) console.log(' -', Object.keys(sr.route.methods), sr.route.path);
          });
        }
      });
    });

  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

main();

import { Sequelize } from 'sequelize'; // Importa Sequelize para manejar la conexión a la base de datos
//import dotenv from 'dotenv'; // Importa dotenv para cargar las variables de entorno desde el archivo .env

//dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME as string, 
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  { // Configuración de la conexión a la base de datos */
    host: process.env.DB_HOST, 
    port: Number(process.env.DB_PORT), 
    dialect: 'mysql',
    logging: false, //cambiar a console.log si se quiere ver las queries
  }
);

export default sequelize;
import express, { Application } from 'express'; // Importa Express y el tipo Application para definir la aplicación
import cors from 'cors'; // Importa CORS para manejar las solicitudes de origen cruzado
//import dotenv from 'dotenv';
//import './models'
import authRoutes from './routes/auth.routes';
import usuariosRoutes from './routes/usuarios.routes'; //importa las rutas de usuarios
import pacientesRoutes from './routes/pacientes.routes'; //importar rutas de pacientes
import medicosRoutes from './routes/medicos.routes';
import citasRoutes from './routes/citas.routes';
import tratamientosRoutes from './routes/tratamientos.routes';
import reportesRoutes from './routes/reportes.routes';

//dotenv.config();

const app: Application = express();

//middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//ruta de prueba
app.get('/api/health', (_req, res) => {
  res.json({ message: 'Servidor funcionando correctamente' });
});

//rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes); //usa las rutas de usuarios
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/medicos', medicosRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/tratamientos', tratamientosRoutes);
app.use('/api/reportes', reportesRoutes);

export default app;

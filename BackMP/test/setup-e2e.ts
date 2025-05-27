import { AppDataSource } from '../src/config/database';
import { clearDatabase } from './utils/test-helpers';

beforeAll(async () => {
  // Inicializar la base de datos de prueba
  await AppDataSource.initialize();
});

afterEach(async () => {
  // Limpiar la base de datos después de cada test
  await clearDatabase();
});

afterAll(async () => {
  // Cerrar la conexión a la base de datos
  await AppDataSource.destroy();
}); 
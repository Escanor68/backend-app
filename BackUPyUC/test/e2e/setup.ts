import { Application } from 'express';
import request from 'supertest';
import { createConnection, Connection } from 'typeorm';
import { app } from '../../src/index';
import { config } from '../../src/config';

let connection: Connection;
let testApp: Application;

beforeAll(async () => {
  // Conexión a la base de datos de test
  connection = await createConnection({
    ...config.database,
    database: config.database.database + '_test'
  });
  
  testApp = app;
});

afterAll(async () => {
  // Cerrar conexión después de los tests
  if (connection) {
    await connection.close();
  }
});

export { testApp, connection }; 
import { connection } from '../e2e/setup';

export const clearDatabase = async () => {
  const entities = connection.entityMetadatas;
  
  for (const entity of entities) {
    const repository = connection.getRepository(entity.name);
    await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
  }
};

export const createTestUser = async (userService: any, userData: any) => {
  return await userService.create({
    email: userData.email || 'test@example.com',
    password: userData.password || 'Test123!',
    name: userData.name || 'Test User',
    role: userData.role || 'user'
  });
}; 
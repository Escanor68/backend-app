export const mockUser = {
  id: '1',
  email: 'test@example.com',
  password: '$2b$10$abcdefghijklmnopqrstuvwxyz', // hashed password
  name: 'Test User',
  role: 'user',
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockUserInput = {
  email: 'test@example.com',
  password: 'Test123!',
  name: 'Test User'
};

export const mockUsers = [
  mockUser,
  {
    id: '2',
    email: 'admin@example.com',
    password: '$2b$10$abcdefghijklmnopqrstuvwxyz',
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]; 
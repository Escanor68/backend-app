// Jest setup file for BackMP tests

// Mock console methods to reduce noise during tests
global.console = {
    ...console,
    // Silence console during tests for cleaner output
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.MP_ACCESS_TOKEN = 'TEST-TOKEN';
process.env.MP_PUBLIC_KEY = 'TEST-PUBLIC-KEY';
process.env.MP_WEBHOOK_SECRET = 'test-webhook-secret';
process.env.DATABASE_URL = 'memory';

// Setup test timeout
jest.setTimeout(30000);

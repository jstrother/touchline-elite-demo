import 'reflect-metadata';
import { beforeEach, vi } from 'vitest';

vi.mock('$env/static/private', () => ({
  MONGODB_URI: 'mongodb://localhost:27017/touchline-elite-test',
  SPORTMONKS_API_TOKEN: 'test-token',
}));

vi.mock('$env/static/public', () => ({
  PUBLIC_GRAPHQL_ENDPOINT: '/api/graphql',
}));

beforeEach(() => {
  vi.clearAllMocks();
});
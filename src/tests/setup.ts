import 'reflect-metadata';
import { beforeEach, vi } from 'vitest';
import { setupCustomMatchers } from './helpers/matchers';

// Set up custom domain matchers
setupCustomMatchers();

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
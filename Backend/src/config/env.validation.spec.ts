import 'reflect-metadata';
import { validateEnvironment } from './env.validation';

const validEnvironment = (overrides: Record<string, unknown> = {}) => ({
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'r'.repeat(32),
  ...overrides
});

describe('validateEnvironment', () => {
  it('accepts supported JWT duration formats', () => {
    expect(validateEnvironment(validEnvironment({ JWT_ACCESS_TTL: '30m', JWT_REFRESH_TTL: '2w' })).JWT_ACCESS_TTL).toBe('30m');
  });

  it('rejects invalid JWT duration formats', () => {
    expect(() => validateEnvironment(validEnvironment({ JWT_ACCESS_TTL: '900' }))).toThrow();
    expect(() => validateEnvironment(validEnvironment({ JWT_REFRESH_TTL: '0d' }))).toThrow();
  });
});

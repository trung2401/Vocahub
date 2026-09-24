import { durationToMilliseconds } from './duration';

describe('durationToMilliseconds', () => {
  it.each([
    ['1ms', 1],
    ['30s', 30 * 1000],
    ['15m', 15 * 60 * 1000],
    ['2h', 2 * 60 * 60 * 1000],
    ['21d', 21 * 24 * 60 * 60 * 1000],
    ['2w', 2 * 7 * 24 * 60 * 60 * 1000]
  ])('converts %s', (duration, expected) => {
    expect(durationToMilliseconds(duration)).toBe(expected);
  });

  it('rejects unsupported durations', () => {
    expect(() => durationToMilliseconds('900')).toThrow();
    expect(() => durationToMilliseconds('0d')).toThrow();
  });
});

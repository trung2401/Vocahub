const durationUnitsInMilliseconds: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
  w: 7 * 24 * 60 * 60 * 1000
};

export const durationPattern = /^([1-9]\d*)(ms|s|m|h|d|w)$/;

export function durationToMilliseconds(duration: string): number {
  const match = durationPattern.exec(duration);
  if (!match) throw new Error(`Invalid duration: ${duration}`);

  const milliseconds = Number(match[1]) * durationUnitsInMilliseconds[match[2]];
  if (!Number.isSafeInteger(milliseconds)) throw new Error(`Duration is too large: ${duration}`);
  return milliseconds;
}

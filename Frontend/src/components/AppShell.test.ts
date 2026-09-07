import { describe, expect, it } from 'vitest';
import { navItems } from './navigation';

describe('AppShell navigation', () => {
  it('only exposes routes that are implemented', () => {
    expect(navItems.map((item) => item.href)).toEqual(['/', '/import']);
    expect(navItems.map((item) => item.label)).not.toEqual(expect.arrayContaining(['Bộ từ vựng', 'Luyện tập', 'Cài đặt']));
  });
});

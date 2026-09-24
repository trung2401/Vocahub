import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiClientError, apiRequest } from './httpClient';

afterEach(() => vi.restoreAllMocks());

describe('apiRequest', () => {
  it('refreshes once after a 401 and retries the original request', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: 'invalid_token', message: 'expired' } }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'user-1' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 'deck-1' }]), { status: 200 }));

    await expect(apiRequest('/decks')).resolves.toEqual([{ id: 'deck-1' }]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toContain('/auth/refresh');
    expect(fetchMock.mock.calls[2][0]).toContain('/decks');
  });

  it('surfaces the original 401 when refresh fails', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: 'invalid_token', message: 'expired' } }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: 'invalid_token', message: 'expired' } }), { status: 401 }));

    await expect(apiRequest('/decks')).rejects.toEqual(expect.objectContaining({ status: 401, code: 'invalid_token' }));
  });

  it('shares one refresh request between concurrent 401 responses', async () => {
    const unauthorized = () => new Response(JSON.stringify({ error: { code: 'invalid_token', message: 'expired' } }), { status: 401 });
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 'deck-1' }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 'deck-1' }]), { status: 200 }));

    await expect(Promise.all([apiRequest('/decks'), apiRequest('/decks')])).resolves.toEqual([
      [{ id: 'deck-1' }],
      [{ id: 'deck-1' }]
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(5);
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/auth/refresh'))).toHaveLength(1);
  });
});

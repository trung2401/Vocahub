import { randomUUID } from 'node:crypto';

const runE2e = process.env.RUN_E2E === 'true';
const apiUrl = (process.env.BACKEND_E2E_URL ?? 'http://localhost:4001/api/v1').replace(/\/$/, '');

interface ApiResult<T> { response: Response; body: T; }

const cookieHeader = (response: Response): string => {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] };
  const setCookies = headers.getSetCookie?.() ?? [headers.get('set-cookie') ?? ''];
  return setCookies.flatMap((setCookie) => [...setCookie.matchAll(/(?:access_token|refresh_token)=[^;,]+/g)])
    .map((match) => match[0])
    .join('; ');
};

const request = async <T>(path: string, init: RequestInit = {}, cookies = ''): Promise<ApiResult<T>> => {
  const headers = new Headers(init.headers);
  if (cookies) headers.set('cookie', cookies);
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');
  const response = await fetch(`${apiUrl}${path}`, { ...init, headers });
  const body = await response.json().catch(() => null) as T;
  return { response, body };
};

describe('VocaHub backend golden path', () => {
  beforeAll(() => {
    if (!runE2e) throw new Error('E2E is not configured. Start the backend/MySQL and run with RUN_E2E=true.');
  });
  it('registers, creates, studies, refreshes, imports and deletes a deck', async () => {
    const email = `e2e-${randomUUID()}@example.test`;
    const credentials = JSON.stringify({ email, password: 'E2e-password-123' });
    const registered = await request<{ id: string }>('/auth/register', { method: 'POST', body: credentials });
    expect(registered.response.status).toBe(201);
    let cookies = cookieHeader(registered.response);
    expect(cookies).toContain('access_token=');

    const created = await request<{ id: string }>('/decks', { method: 'POST', body: JSON.stringify({ name: 'E2E deck', source: 'manual' }) }, cookies);
    expect(created.response.status).toBe(201);
    const deckId = created.body.id;
    const entries = Array.from({ length: 4 }, (_, index) => ({ term: `e2e-term-${index}`, meaning: `e2e-meaning-${index}` }));
    const bulk = await request(`/decks/${deckId}/entries/bulk`, { method: 'POST', body: JSON.stringify({ entries }) }, cookies);
    expect(bulk.response.status).toBe(201);
    const firstEntry = (bulk.body as Array<{ id: string }>)[0].id;
    const due = await request<Array<{ id: string }>>(`/decks/${deckId}/due?now=${encodeURIComponent(new Date().toISOString())}`, {}, cookies);
    expect(due.response.status).toBe(200);
    expect(due.body).toHaveLength(4);
    const paged = await request<Array<{ id: string }>>(`/decks/${deckId}/entries?limit=2&offset=1`, {}, cookies);
    expect(paged.response.status).toBe(200);
    expect(paged.body).toHaveLength(2);

    const concurrentReviews = await Promise.all([
      request(`/entries/${firstEntry}/review`, { method: 'POST', body: JSON.stringify({ rating: 'good', mode: 'flashcard' }) }, cookies),
      request(`/entries/${firstEntry}/review`, { method: 'POST', body: JSON.stringify({ rating: 'good', mode: 'flashcard' }) }, cookies)
    ]);
    expect(concurrentReviews.map(({ response }) => response.status).sort()).toEqual([201, 201]);
    const review = await request(`/entries/${firstEntry}/review`, { method: 'POST', body: JSON.stringify({ rating: 'good', mode: 'flashcard' }) }, cookies);
    expect(review.response.status).toBe(201);

    const imported = await request<{ deck: { id: string } }>('/imports/decks', { method: 'POST', body: JSON.stringify({ name: 'E2E imported', fileName: 'words.csv', entries }) }, cookies);
    expect(imported.response.status).toBe(201);
    const refreshAttempts = await Promise.all([
      request('/auth/refresh', { method: 'POST' }, cookies),
      request('/auth/refresh', { method: 'POST' }, cookies)
    ]);
    expect(refreshAttempts.map(({ response }) => response.status).sort()).toEqual([201, 401]);
    const staleCookies = cookies;
    const refreshed = refreshAttempts.find(({ response }) => response.status === 201);
    cookies = refreshed ? cookieHeader(refreshed.response) || cookies : cookies;
    const listed = await request<Array<{ id: string }>>('/decks', {}, cookies);
    expect(listed.body.map((deck) => deck.id)).toEqual(expect.arrayContaining([deckId, imported.body.deck.id]));

    const secondCredentials = JSON.stringify({ email: `e2e-other-${randomUUID()}@example.test`, password: 'E2e-password-123' });
    const secondUser = await request('/auth/register', { method: 'POST', body: secondCredentials });
    expect(secondUser.response.status).toBe(201);
    expect((await request(`/decks/${deckId}`, {}, cookieHeader(secondUser.response))).response.status).toBe(404);

    expect((await request(`/decks/${deckId}`, { method: 'DELETE' }, cookies)).response.status).toBe(200);
    expect((await request(`/decks/${imported.body.deck.id}`, { method: 'DELETE' }, cookies)).response.status).toBe(200);

    const replayed = await request('/auth/refresh', { method: 'POST' }, staleCookies);
    expect(replayed.response.status).toBe(401);

    const loggedInAgain = await request('/auth/login', { method: 'POST', body: credentials });
    expect(loggedInAgain.response.status).toBe(201);
    const logoutCookies = cookieHeader(loggedInAgain.response);
    expect((await request('/auth/logout', { method: 'POST' }, logoutCookies)).response.status).toBe(201);
    expect((await request('/auth/refresh', { method: 'POST' }, logoutCookies)).response.status).toBe(401);
  }, 30_000);
});

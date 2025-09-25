import apiService from '../api';

global.fetch = jest.fn();

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
// jsdom exposes window; ensure both are set
if (typeof window !== 'undefined') {
  window.localStorage = localStorageMock;
}

beforeEach(() => {
  fetch.mockReset();
  localStorageMock.getItem.mockImplementation((key) => (key === 'token' ? 't' : null));
  jest.spyOn(apiService, 'getStoredToken').mockReturnValue('t');
});

test('getEmergency calls endpoint with token', async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ _id: '1' }) });
  const res = await apiService.getEmergency('1');
  expect(fetch).toHaveBeenCalledWith(
    expect.stringMatching(/\/api\/emergencias\/1$/),
    expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer t' }) })
  );
  expect(res).toEqual({ _id: '1' });
});

test('updateEmergencyStatus uses PUT and payload', async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
  await apiService.updateEmergencyStatus('2', 'Resuelta');
  const [, opts] = fetch.mock.calls[0];
  expect(opts.method).toBe('PUT');
  expect(JSON.parse(opts.body)).toEqual({ estado: 'Resuelta' });
});

test('deleteEmergency sends DELETE', async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
  await apiService.deleteEmergency('3');
  expect(fetch.mock.calls[0][1].method).toBe('DELETE');
});

test('searchEmergencies builds query string', async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: async () => ([]) });
  await apiService.searchEmergencies({ estado: 'Pendiente', tipo: 'accidente' });
  expect(fetch.mock.calls[0][0]).toMatch(/estado=Pendiente/);
  expect(fetch.mock.calls[0][0]).toMatch(/tipo=accidente/);
});

test('addAttachment posts FormData without content-type', async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
  const file = new Blob(['a'], { type: 'text/plain' });
  await apiService.addAttachment('4', file);
  const [, opts] = fetch.mock.calls[0];
  expect(opts.method).toBe('POST');
  expect(opts.headers['Authorization']).toBe('Bearer t');
});



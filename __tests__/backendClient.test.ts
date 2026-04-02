import { request, requestFormData } from '../src/services/backendClient';

type DevGlobal = typeof globalThis & {
  __DEV__?: boolean;
};

describe('backendClient logging', () => {
  const devGlobal = globalThis as DevGlobal;
  const originalDev = devGlobal.__DEV__;
  const fetchMock = jest.fn();

  beforeEach(() => {
    devGlobal.__DEV__ = true;
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    devGlobal.__DEV__ = originalDev;
    jest.restoreAllMocks();
  });

  it('redacts sensitive request and response data in logs', async () => {
    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          data: {
            access_token: 'server-token',
            phone: '+79991234567',
            ok: true
          }
        })
    });

    await request('/secure-endpoint', {
      method: 'POST',
      accessToken: 'client-token',
      body: {
        phone: '+79991234567',
        token: 'invite-secret'
      }
    });

    const requestPayload = debugSpy.mock.calls.find(([message]) =>
      String(message).includes('[BackendClient] Request started')
    )?.[1] as Record<string, unknown>;

    const responsePayload = infoSpy.mock.calls.find(([message]) =>
      String(message).includes('[BackendClient] Request succeeded')
    )?.[1] as Record<string, unknown>;

    expect(requestPayload).toMatchObject({
      hasAccessToken: true,
      headers: expect.objectContaining({ Authorization: 'Bearer <redacted>' }),
      body: expect.objectContaining({ phone: '79***67', token: '<redacted>' })
    });

    const serializedLogs = JSON.stringify({ requestPayload, responsePayload });
    expect(serializedLogs).not.toContain('client-token');
    expect(serializedLogs).not.toContain('server-token');
    expect(serializedLogs).not.toContain('+79991234567');
  });

  it('summarizes multipart request bodies without logging raw contents', async () => {
    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ uploaded: true })
    });

    const formData = new FormData();
    formData.append('photos', 'raw-binary-content');

    await requestFormData('/upload', {
      method: 'POST',
      accessToken: 'client-token',
      body: formData
    });

    const requestPayload = debugSpy.mock.calls.find(([message]) =>
      String(message).includes('[BackendClient] Request started')
    )?.[1] as Record<string, unknown>;

    expect(requestPayload).toMatchObject({
      body: expect.objectContaining({ type: 'FormData' })
    });

    const serializedLogs = JSON.stringify({ requestPayload, infoCalls: infoSpy.mock.calls });
    expect(serializedLogs).not.toContain('raw-binary-content');
    expect(serializedLogs).not.toContain('client-token');
  });
});

import AsyncStorage from '@react-native-async-storage/async-storage';

import { createAuthRepository } from '../src/repositories/authRepository';
import { createAuthService } from '../src/services/authService';

describe('authService', () => {
  const fetchMock = jest.fn();

  beforeEach(async () => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    await AsyncStorage.clear();
  });

  it('starts MAX auth and stores pending session', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          data: {
            session_id: 'session-1',
            max_link: 'https://max.ru/session-1',
            expires_at: '2099-01-01T00:00:00Z'
          }
        })
    });

    const service = createAuthService({ authRepository: createAuthRepository(AsyncStorage) });
    const pendingSession = await service.startMaxAuth();

    expect(fetchMock).toHaveBeenCalledWith('https://mpit-bot.kostya1024.ru/api/v1/auth/max/start', expect.objectContaining({ method: 'POST' }));
    expect(pendingSession).toEqual({
      sessionId: 'session-1',
      maxLink: 'https://max.ru/session-1',
      expiresAt: '2099-01-01T00:00:00Z'
    });
    expect(JSON.parse((await AsyncStorage.getItem('@event-organizer/auth-pending-session')) ?? '{}')).toEqual(pendingSession);
  });

  it('reads session status values from backend', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          data: {
            session_id: 'session-1',
            status: 'completed',
            expires_at: '2099-01-01T00:00:00Z'
          }
        })
    });

    const service = createAuthService({ authRepository: createAuthRepository(AsyncStorage) });
    await expect(service.getMaxSessionStatus('session-1')).resolves.toBe('completed');
  });

  it('exchanges MAX session, persists auth and clears pending session', async () => {
    await AsyncStorage.setItem(
      '@event-organizer/auth-pending-session',
      JSON.stringify({ sessionId: 'session-1', maxLink: 'https://max.ru/session-1', expiresAt: '2099-01-01T00:00:00Z' })
    );

    fetchMock.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          data: {
            access_token: 'token-1',
            token_type: 'Bearer',
            expires_at: '2099-01-01T00:00:00Z',
            user: {
              id: 'user-1',
              full_name: 'Николай',
              phone: '+79991234567',
              created_at: '2026-03-31T14:56:46.060397Z',
              updated_at: '2026-03-31T14:56:46.060397Z'
            }
          }
        })
    });

    const service = createAuthService({ authRepository: createAuthRepository(AsyncStorage) });
    const authSession = await service.exchangeMaxSession('session-1');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://mpit-bot.kostya1024.ru/api/v1/auth/max/exchange',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ session_id: 'session-1' })
      })
    );
    expect(authSession.tokens.accessToken).toBe('token-1');
    expect(await AsyncStorage.getItem('@event-organizer/auth-pending-session')).toBeNull();
    expect(JSON.parse((await AsyncStorage.getItem('@event-organizer/auth-session')) ?? '{}')).toEqual(authSession);
  });

  it('clears expired auth and pending sessions during restore', async () => {
    await AsyncStorage.setItem(
      '@event-organizer/auth-session',
      JSON.stringify({
        tokens: {
          accessToken: 'token-1',
          tokenType: 'Bearer',
          expiresAt: '2000-01-01T00:00:00Z'
        },
        user: {
          id: 'user-1',
          fullName: 'Николай',
          phone: null,
          createdAt: '2026-03-31T14:56:46.060397Z',
          updatedAt: '2026-03-31T14:56:46.060397Z'
        }
      })
    );
    await AsyncStorage.setItem(
      '@event-organizer/auth-pending-session',
      JSON.stringify({
        sessionId: 'session-1',
        maxLink: 'https://max.ru/session-1',
        expiresAt: '2000-01-01T00:00:00Z'
      })
    );

    const service = createAuthService({ authRepository: createAuthRepository(AsyncStorage) });
    const restored = await service.restore();

    expect(restored).toEqual({ auth: null, pending: null });
    expect(await AsyncStorage.getItem('@event-organizer/auth-session')).toBeNull();
    expect(await AsyncStorage.getItem('@event-organizer/auth-pending-session')).toBeNull();
  });
});

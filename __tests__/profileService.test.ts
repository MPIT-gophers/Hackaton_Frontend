import { createProfileService } from '../src/services/profileService';

describe('profileService', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('sends PATCH /me with Bearer token and maps response', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          data: {
            id: 'user-1',
            full_name: 'Николай Тест',
            phone: '+79991234567',
            created_at: '2026-03-31T14:56:46.060397Z',
            updated_at: '2026-03-31T15:04:53.200424Z'
          }
        })
    });

    const service = createProfileService();
    const result = await service.updateMe('token-1', {
      fullName: 'Николай Тест',
      phone: '+79991234567'
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://mpit-bot.kostya1024.ru/api/v1/me',
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-1',
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
          full_name: 'Николай Тест',
          phone: '+79991234567'
        })
      })
    );
    expect(result).toEqual({
      id: 'user-1',
      fullName: 'Николай Тест',
      phone: '+79991234567',
      createdAt: '2026-03-31T14:56:46.060397Z',
      updatedAt: '2026-03-31T15:04:53.200424Z'
    });
  });
});

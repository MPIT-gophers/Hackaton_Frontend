import { createEventsRepository } from '../src/repositories/eventsRepository';

describe('eventsRepository', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('loads my events from backend', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          data: [
            {
              id: 'event-1',
              title: 'День рождение',
              city: 'Якутск',
              budget: '50000',
              event_date: '2026-04-05',
              event_time: '14:00',
              expected_guest_count: 12
            }
          ]
        })
    });

    const repository = createEventsRepository();
    const events = await repository.listMyEvents('token-1');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://mpit-bot.kostya1024.ru/api/v1/events/my',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-1'
        })
      })
    );
    expect(events[0].title).toBe('День рождение');
  });

  it('creates an event from supported backend fields only', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          data: {
            id: 'event-1',
            title: 'Мероприятие',
            city: 'Якутск',
            budget: '50000',
            event_date: '2026-04-05',
            event_time: '14:00',
            expected_guest_count: 12
          }
        })
    });

    const repository = createEventsRepository();
    await repository.createEvent('token-1', {
      occasion: 'День рождения',
      city: 'Якутск',
      date: '2026-04-05',
      budget: '50000',
      guests: '12',
      placeType: 'Ресторан',
      location: 'Центр',
      wishes: 'Уютный'
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://mpit-bot.kostya1024.ru/api/v1/events',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          city: 'Якутск',
          budget: '50000',
          date: '2026-04-05',
          time: '14:00',
          scale: 12,
          energy: ''
        })
      })
    );
  });

  it('uses double-prefix wishlist and photos routes', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ items: [] })
    });

    const repository = createEventsRepository();
    await repository.getWishlist('token-1', '123');
    await repository.getEventPhotos('token-1', '123');

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://mpit-bot.kostya1024.ru/api/v1/api/v1/events/123/wishlist',
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://mpit-bot.kostya1024.ru/api/v1/api/v1/events/123/photos',
      expect.any(Object)
    );
  });

  it('uploads photos as multipart form data', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ uploaded: true })
    });

    const repository = createEventsRepository();
    await repository.uploadEventPhotos('token-1', '123', [
      {
        uri: 'file:///photo-1.jpg',
        name: 'photo-1.jpg',
        type: 'image/jpeg'
      }
    ]);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://mpit-bot.kostya1024.ru/api/v1/api/v1/events/123/photos/upload',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-1'
        }),
        body: expect.any(FormData)
      })
    );
  });
});

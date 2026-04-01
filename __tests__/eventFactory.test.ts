import { createBookedEvent } from '../src/utils/eventFactory';

describe('createBookedEvent', () => {
  it('builds a booked event with a fixed start time', () => {
    const event = createBookedEvent(
      {
        occasion: 'День рождения',
        city: 'Якутск',
        date: '2026-04-05',
        budget: '50000',
        guests: '12',
        placeType: 'Ресторан',
        location: 'Центр',
        wishes: 'Уютный'
      },
      {
        id: 'vinzavod',
        name: 'Винзавод',
        summary: '',
        rating: '4.7',
        imageKey: 'venueCover1',
        addressLine: '',
        address: '',
        schedule: '',
        averageCheck: '1600',
        cuisine: 'Европейская',
        tags: []
      }
    );

    expect(event.title).toBe('День рождения');
    expect(event.date).toBe('5 апреля 2026 г.');
    expect(event.time).toBe('14:00');
    expect(event.venueId).toBe('vinzavod');
  });
});

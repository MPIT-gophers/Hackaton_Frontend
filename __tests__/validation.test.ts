import { validateEventDraft } from '../src/utils/validation';

describe('validateEventDraft', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 3, 1, 12));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('marks required fields as invalid when they are blank', () => {
    expect(
      validateEventDraft({
        occasion: '',
        city: '',
        date: '',
        budget: '',
        guests: '',
        placeType: '',
        location: '',
        wishes: ''
      })
    ).toEqual({
      occasion: true,
      city: true,
      date: true,
      budget: true,
      guests: true
    });
  });

  it('marks date as invalid when it cannot be parsed', () => {
    expect(
      validateEventDraft({
        occasion: 'День рождения',
        city: 'Москва',
        date: '31.02.2026',
        budget: '30000',
        guests: '12',
        placeType: '',
        location: '',
        wishes: ''
      })
    ).toEqual({
      date: true
    });
  });

  it('marks date as invalid when it is in the past', () => {
    expect(
      validateEventDraft({
        occasion: 'День рождения',
        city: 'Москва',
        date: '31.03.2026',
        budget: '30000',
        guests: '12',
        placeType: '',
        location: '',
        wishes: ''
      })
    ).toEqual({
      date: true
    });
  });

  it('accepts a valid future event date', () => {
    expect(
      validateEventDraft({
        occasion: 'День рождения',
        city: 'Москва',
        date: '05.04.2026',
        budget: '30000',
        guests: '12',
        placeType: '',
        location: '',
        wishes: ''
      })
    ).toEqual({});
  });
});

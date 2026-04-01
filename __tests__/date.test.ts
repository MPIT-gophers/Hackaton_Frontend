import { formatDateDisplay, isEventDateValid } from '../src/utils/date';

describe('formatDateDisplay', () => {
  it('formats ISO date to Russian display format', () => {
    expect(formatDateDisplay('2026-04-05')).toBe('5 апреля 2026 г.');
  });

  it('returns preformatted date with year suffix', () => {
    expect(formatDateDisplay('5 апреля 2026')).toBe('5 апреля 2026 г.');
  });
});

describe('isEventDateValid', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 3, 1, 12));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('accepts a future date in Russian display format', () => {
    expect(isEventDateValid('5 апреля 2026 г.')).toBe(true);
  });

  it('rejects an impossible date', () => {
    expect(isEventDateValid('31.02.2026')).toBe(false);
  });
});

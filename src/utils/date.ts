const RUSSIAN_MONTHS: Record<string, number> = {
  января: 0,
  февраля: 1,
  марта: 2,
  апреля: 3,
  мая: 4,
  июня: 5,
  июля: 6,
  августа: 7,
  сентября: 8,
  октября: 9,
  ноября: 10,
  декабря: 11
};

function createValidDate(year: number, monthIndex: number, day: number): Date | null {
  const candidate = new Date(year, monthIndex, day, 12);

  if (
    Number.isNaN(candidate.getTime()) ||
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== monthIndex ||
    candidate.getDate() !== day
  ) {
    return null;
  }

  return candidate;
}

function parseIsoDate(raw: string): Date | null {
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;

  return createValidDate(Number(year), Number(month) - 1, Number(day));
}

function parseDottedDate(raw: string): Date | null {
  const match = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);

  if (!match) {
    return null;
  }

  const [, day, month, year] = match;

  return createValidDate(Number(year), Number(month) - 1, Number(day));
}

function parseRussianTextDate(raw: string): Date | null {
  const normalized = raw.trim().toLowerCase().replace(/\s*г\.?$/u, '').replace(/ё/gu, 'е');
  const match = normalized.match(/^(\d{1,2})\s+([а-я]+)\s+(\d{4})$/u);

  if (!match) {
    return null;
  }

  const [, day, monthName, year] = match;
  const monthIndex = RUSSIAN_MONTHS[monthName];

  if (monthIndex === undefined) {
    return null;
  }

  return createValidDate(Number(year), monthIndex, Number(day));
}

function parseNativeDate(raw: string): Date | null {
  const timestamp = Date.parse(raw);

  if (Number.isNaN(timestamp)) {
    return null;
  }

  const parsedDate = new Date(timestamp);

  return createValidDate(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseEventDate(value: string): Date | null {
  const raw = String(value ?? '').trim();

  if (!raw) {
    return null;
  }

  return parseIsoDate(raw) ?? parseDottedDate(raw) ?? parseRussianTextDate(raw) ?? parseNativeDate(raw);
}

export function isEventDateValid(value: string): boolean {
  const parsedDate = parseEventDate(value);

  if (!parsedDate) {
    return false;
  }

  return startOfDay(parsedDate).getTime() >= startOfDay(new Date()).getTime();
}

export function formatDateDisplay(value: string): string {
  const raw = String(value ?? '').trim();

  if (!raw) {
    return '';
  }

  const parsedDate = parseEventDate(raw);

  if (!parsedDate) {
    return raw;
  }

  const formatted = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(parsedDate);

  return `${formatted.replace(/\s?г\.?$/u, '')} г.`;
}

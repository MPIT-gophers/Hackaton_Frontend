import { BookedEvent, EventDraft, Venue } from '../domain/types';
import { formatDateDisplay } from './date';

function createEventId(): string {
  return `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createBookedEvent(draft: EventDraft, venue: Venue): BookedEvent {
  return {
    id: createEventId(),
    title: draft.occasion.trim() || 'День рождение',
    date: formatDateDisplay(draft.date) || '5 апреля 2026 г.',
    time: '14:00',
    venueId: venue.id,
    venueName: venue.name
  };
}

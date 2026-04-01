import AsyncStorage from '@react-native-async-storage/async-storage';

import { BookedEvent, EventDraft, Venue } from '../domain/types';
import { createBookedEvent } from '../utils/eventFactory';

const EVENTS_STORAGE_KEY = '@event-organizer/events';

export type EventsRepository = {
  listEvents(): Promise<BookedEvent[]>;
  createEvent(draft: EventDraft, venue: Venue): Promise<BookedEvent>;
};

async function readStoredEvents(storage = AsyncStorage): Promise<BookedEvent[]> {
  try {
    const raw = await storage.getItem(EVENTS_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? (parsed as BookedEvent[]) : [];
  } catch {
    return [];
  }
}

export function createEventsRepository(storage = AsyncStorage): EventsRepository {
  return {
    async listEvents() {
      return readStoredEvents(storage);
    },

    async createEvent(draft, venue) {
      const nextEvent = createBookedEvent(draft, venue);
      const currentEvents = await readStoredEvents(storage);
      const nextEvents = [nextEvent, ...currentEvents];

      await storage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(nextEvents));

      return nextEvent;
    }
  };
}

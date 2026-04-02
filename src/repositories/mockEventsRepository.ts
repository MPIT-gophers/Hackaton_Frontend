import { VENUES } from '../data/venues';
import {
  AttendanceStatus,
  BackendEvent,
  BackendLocation,
  BackendVariant,
  EventDraft,
  EventGuest,
  EventGuestStats,
  InviteTokenInfo,
  PhotosResponse,
  UploadablePhoto,
  WishlistResponse
} from '../domain/types';
import type { EventsRepository } from './eventsRepository';
import { getRecommendedVenues } from '../utils/venueRanking';

type MockWishlistItem = {
  id: string;
  title: string;
  bookedBy: string | null;
  currentFund: number;
  targetAmount: number;
};

type MockPhoto = {
  id: string;
  url: string;
  caption: string;
};

type MockEventRecord = {
  event: BackendEvent;
  guests: EventGuest[];
  wishlist: MockWishlistItem[];
  photos: MockPhoto[];
};

type SeedEventOptions = {
  id: string;
  title: string;
  city: string;
  budget: string;
  description: string;
  eventDate: string;
  eventTime: string;
  expectedGuestCount: number;
  status: string;
  attendanceStatus: string;
  venueIds: string[];
};

const MOCK_CONTACT_PHONE = '+7 (4112) 00-00-00';
const MOCK_SOURCE = 'mock-catalog';
const catalogById = new Map(VENUES.map((venue) => [venue.id, venue]));

const GUEST_TEMPLATES = [
  { fullName: 'Анна Петрова', phone: '+79990000011', plusOneCount: 1, approvalStatus: 'approved', attendanceStatus: 'confirmed' },
  { fullName: 'Максим Сидоров', phone: '+79990000012', plusOneCount: 0, approvalStatus: 'approved', attendanceStatus: 'pending' },
  { fullName: 'Елизавета Миронова', phone: '+79990000013', plusOneCount: 1, approvalStatus: 'approved', attendanceStatus: 'confirmed' },
  { fullName: 'Игорь Волков', phone: '+79990000014', plusOneCount: 0, approvalStatus: 'pending', attendanceStatus: 'pending' },
  { fullName: 'Виктория Николаева', phone: '+79990000015', plusOneCount: 2, approvalStatus: 'approved', attendanceStatus: 'declined' },
  { fullName: 'Даниил Козлов', phone: '+79990000016', plusOneCount: 0, approvalStatus: 'rejected', attendanceStatus: 'declined' },
  { fullName: 'Мария Андреева', phone: '+79990000017', plusOneCount: 0, approvalStatus: 'approved', attendanceStatus: 'confirmed' },
  { fullName: 'Степан Ким', phone: '+79990000018', plusOneCount: 1, approvalStatus: 'approved', attendanceStatus: 'pending' }
] as const;

let mockEventCounter = 100;
let mockWishlistCounter = 1000;
let mockPhotoCounter = 5000;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function nowIso() {
  return new Date().toISOString();
}

function requireVenue(venueId: string) {
  const venue = catalogById.get(venueId);

  if (!venue) {
    throw new Error(`Unknown mock venue: ${venueId}`);
  }

  return venue;
}

function createLocationFromVenue(eventId: string, variantId: string, venueId: string, sortOrder: number): BackendLocation {
  const venue = requireVenue(venueId);

  return {
    id: venue.id,
    title: venue.name,
    address: venue.addressLine || venue.address,
    aiComment: venue.summary,
    aiScore: venue.rating,
    contacts: MOCK_CONTACT_PHONE,
    source: MOCK_SOURCE,
    sortOrder,
    isRejected: false,
    eventId,
    variantId
  };
}

function createVariant(eventId: string, variantId: string, venueIds: string[]): BackendVariant {
  return {
    id: variantId,
    title: 'Основная подборка',
    description: 'Лучшие варианты под выбранные параметры события.',
    status: 'ready',
    variantNumber: 1,
    locations: venueIds.map((venueId, index) => createLocationFromVenue(eventId, variantId, venueId, index + 1))
  };
}

function buildGuests(eventId: string, expectedGuestCount: number, offset = 0): EventGuest[] {
  const totalGuests = Math.max(4, Math.min(GUEST_TEMPLATES.length, expectedGuestCount || 6));

  return Array.from({ length: totalGuests }, (_, index) => {
    const template = GUEST_TEMPLATES[(index + offset) % GUEST_TEMPLATES.length];

    return {
      id: `${eventId}-guest-${index + 1}`,
      eventId,
      userId: `mock-user-${index + 1}`,
      fullName: template.fullName,
      phone: template.phone,
      plusOneCount: template.plusOneCount,
      approvalStatus: template.approvalStatus as EventGuest['approvalStatus'],
      attendanceStatus: template.attendanceStatus as EventGuest['attendanceStatus'],
      createdAt: nowIso()
    };
  });
}

function buildWishlist(eventId: string, title: string): MockWishlistItem[] {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes('свад')) {
    return [
      { id: `${eventId}-wish-${mockWishlistCounter++}`, title: 'Сертификат на романтический weekend', bookedBy: null, currentFund: 15000, targetAmount: 40000 },
      { id: `${eventId}-wish-${mockWishlistCounter++}`, title: 'Набор дизайнерской посуды', bookedBy: 'Анна Петрова', currentFund: 0, targetAmount: 18000 },
      { id: `${eventId}-wish-${mockWishlistCounter++}`, title: 'Винный шкаф для дома', bookedBy: null, currentFund: 22000, targetAmount: 65000 }
    ];
  }

  if (normalizedTitle.includes('корп')) {
    return [
      { id: `${eventId}-wish-${mockWishlistCounter++}`, title: 'Фотозона с брендингом', bookedBy: null, currentFund: 10000, targetAmount: 25000 },
      { id: `${eventId}-wish-${mockWishlistCounter++}`, title: 'DJ-сет на 2 часа', bookedBy: 'Максим Сидоров', currentFund: 0, targetAmount: 30000 },
      { id: `${eventId}-wish-${mockWishlistCounter++}`, title: 'Подарочные боксы для команды', bookedBy: null, currentFund: 18000, targetAmount: 35000 }
    ];
  }

  return [
    { id: `${eventId}-wish-${mockWishlistCounter++}`, title: 'Сертификат в travel-магазин', bookedBy: null, currentFund: 12000, targetAmount: 30000 },
    { id: `${eventId}-wish-${mockWishlistCounter++}`, title: 'Настольная игра для компании', bookedBy: 'Виктория Николаева', currentFund: 0, targetAmount: 7000 },
    { id: `${eventId}-wish-${mockWishlistCounter++}`, title: 'Плед и набор для уютных вечеров', bookedBy: null, currentFund: 3500, targetAmount: 12000 },
    { id: `${eventId}-wish-${mockWishlistCounter++}`, title: 'Колонка для домашних вечеринок', bookedBy: null, currentFund: 0, targetAmount: 18000 }
  ];
}

function buildPhotos(eventId: string, title: string): MockPhoto[] {
  const encodedTitle = encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'));

  return Array.from({ length: 4 }, (_, index) => ({
    id: `${eventId}-photo-${mockPhotoCounter++}`,
    url: `https://picsum.photos/seed/${encodedTitle}-${index + 1}/600/600`,
    caption: `Фото события ${index + 1}`
  }));
}

function createSeedEvent(options: SeedEventOptions): MockEventRecord {
  const createdAt = nowIso();
  const variantId = `${options.id}-variant-main`;
  const event: BackendEvent = {
    id: options.id,
    title: options.title,
    city: options.city,
    budget: options.budget,
    description: options.description,
    eventDate: options.eventDate,
    eventTime: options.eventTime,
    expectedGuestCount: options.expectedGuestCount,
    inviteToken: `invite-${options.id}`,
    selectedVariantId: variantId,
    status: options.status,
    accessRole: 'owner',
    approvalStatus: 'approved',
    attendanceStatus: options.attendanceStatus,
    createdAt,
    updatedAt: createdAt,
    variants: [createVariant(options.id, variantId, options.venueIds)]
  };

  return {
    event,
    guests: buildGuests(options.id, options.expectedGuestCount, options.id.length),
    wishlist: buildWishlist(options.id, options.title),
    photos: buildPhotos(options.id, options.title)
  };
}

function createInitialRecords() {
  const records = [
    createSeedEvent({
      id: 'event-100',
      title: 'День рождения Насти',
      city: 'Якутск',
      budget: '55000',
      description: 'Уютный вечер с близкими, десертным столом и DJ-сетом на финал.',
      eventDate: '2026-04-18',
      eventTime: '18:30',
      expectedGuestCount: 12,
      status: 'planned',
      attendanceStatus: 'confirmed',
      venueIds: ['vinzavod', 'panorama-sky', 'sakura-room', 'north-garden']
    }),
    createSeedEvent({
      id: 'event-101',
      title: 'Корпоратив продуктовой команды',
      city: 'Якутск',
      budget: '160000',
      description: 'Большой командный вечер с welcome-зоной, фотозоной и отдельной сценой.',
      eventDate: '2026-05-07',
      eventTime: '19:00',
      expectedGuestCount: 46,
      status: 'active',
      attendanceStatus: 'pending',
      venueIds: ['taiga-hall', 'surasan-loft', 'aurora-lounge', 'berry-bar']
    }),
    createSeedEvent({
      id: 'event-102',
      title: 'Годовщина свадьбы родителей',
      city: 'Якутск',
      budget: '90000',
      description: 'Семейный ужин с живой музыкой, красивым видом и спокойной атмосферой.',
      eventDate: '2026-05-22',
      eventTime: '17:00',
      expectedGuestCount: 18,
      status: 'draft',
      attendanceStatus: 'pending',
      venueIds: ['panorama-sky', 'north-garden', 'vinzavod', 'mosaic-atelier']
    })
  ];

  return new Map(records.map((record) => [record.event.id, record]));
}

const mockEventStore = createInitialRecords();

function ensureRecord(eventId: string): MockEventRecord {
  const record = mockEventStore.get(eventId);

  if (!record) {
    throw new Error('Мероприятие не найдено');
  }

  return record;
}

function listSortedEvents() {
  return Array.from(mockEventStore.values())
    .map((record) => clone(record.event))
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
}

function buildEventDescription(draft: EventDraft) {
  return [
    draft.placeType.trim() ? `Формат: ${draft.placeType.trim()}` : null,
    draft.location.trim() ? `Локация: ${draft.location.trim()}` : null,
    draft.wishes.trim() ? `Пожелания: ${draft.wishes.trim()}` : null
  ]
    .filter(Boolean)
    .join(' · ');
}

function createEventFromDraft(draft: EventDraft): BackendEvent {
  mockEventCounter += 1;
  const eventId = `event-${mockEventCounter}`;
  const createdAt = nowIso();
  const variantId = `${eventId}-variant-main`;
  const venues = getRecommendedVenues(VENUES, draft).slice(0, 6);

  const event: BackendEvent = {
    id: eventId,
    title: draft.occasion.trim() || 'Новое мероприятие',
    city: draft.city.trim() || 'Якутск',
    budget: draft.budget.trim() || '0',
    description: buildEventDescription(draft),
    eventDate: draft.date.trim(),
    eventTime: '14:00',
    expectedGuestCount: Number.parseInt(draft.guests, 10) || 0,
    inviteToken: `invite-${eventId}`,
    selectedVariantId: variantId,
    status: 'draft',
    accessRole: 'owner',
    approvalStatus: 'approved',
    attendanceStatus: 'pending',
    createdAt,
    updatedAt: createdAt,
    variants: [createVariant(eventId, variantId, venues.map((venue) => venue.id))]
  };

  mockEventStore.set(eventId, {
    event,
    guests: buildGuests(eventId, event.expectedGuestCount, mockEventCounter),
    wishlist: buildWishlist(eventId, event.title),
    photos: buildPhotos(eventId, event.title)
  });

  return clone(event);
}

function computeStats(guests: EventGuest[]): EventGuestStats {
  return guests.reduce<EventGuestStats>(
    (stats, guest) => {
      if (guest.approvalStatus === 'approved') {
        stats.approved += 1;
      }
      if (guest.approvalStatus === 'pending') {
        stats.pendingApproval += 1;
      }
      if (guest.approvalStatus === 'rejected') {
        stats.rejected += 1;
      }
      if (guest.attendanceStatus === 'pending') {
        stats.attendancePending += 1;
      }
      if (guest.attendanceStatus === 'confirmed') {
        stats.confirmed += 1;
      }
      if (guest.attendanceStatus === 'declined') {
        stats.declined += 1;
      }
      return stats;
    },
    {
      approved: 0,
      attendancePending: 0,
      confirmed: 0,
      declined: 0,
      pendingApproval: 0,
      rejected: 0
    }
  );
}

function formatWishlistStatus(item: MockWishlistItem) {
  if (item.bookedBy) {
    return `Забронировано: ${item.bookedBy}`;
  }

  if (item.currentFund > 0) {
    return `Собрано ${item.currentFund.toLocaleString('ru-RU')} ₽ из ${item.targetAmount.toLocaleString('ru-RU')} ₽`;
  }

  return `Открыт сбор до ${item.targetAmount.toLocaleString('ru-RU')} ₽`;
}

function serializeWishlist(record: MockEventRecord) {
  return {
    event_id: record.event.id,
    items: record.wishlist.map((item) => ({
      id: item.id,
      title: item.title,
      status: formatWishlistStatus(item),
      booked_by: item.bookedBy,
      current_fund: item.currentFund,
      target_amount: item.targetAmount
    }))
  };
}

function serializePhotos(record: MockEventRecord) {
  return {
    event_id: record.event.id,
    photos: record.photos.map((photo) => ({
      id: photo.id,
      url: photo.url,
      caption: photo.caption
    }))
  };
}

export function createMockEventsRepository(): EventsRepository {
  return {
    async listMyEvents() {
      return listSortedEvents();
    },

    async createEvent(_accessToken, draft) {
      return createEventFromDraft(draft);
    },

    async getEventById(_accessToken, eventId) {
      return clone(ensureRecord(eventId).event);
    },

    async getEventGuests(_accessToken, eventId, approvalStatus) {
      const guests = ensureRecord(eventId).guests;
      const filteredGuests = approvalStatus ? guests.filter((guest) => guest.approvalStatus === approvalStatus) : guests;

      return clone(filteredGuests);
    },

    async getEventStats(_accessToken, eventId) {
      return computeStats(ensureRecord(eventId).guests);
    },

    async getEventInviteToken(_accessToken, eventId) {
      const event = ensureRecord(eventId).event;
      const inviteToken: InviteTokenInfo = {
        token: event.inviteToken
      };

      return inviteToken;
    },

    async updateGuestAttendance(_accessToken, eventId, guestId, attendanceStatus) {
      const record = ensureRecord(eventId);
      const guest = record.guests.find((entry) => entry.id === guestId);

      if (!guest) {
        throw new Error('Гость не найден');
      }

      guest.attendanceStatus = attendanceStatus;
      record.event.updatedAt = nowIso();

      return clone(guest);
    },

    async getWishlist(_accessToken, eventId) {
      return serializeWishlist(ensureRecord(eventId)) as WishlistResponse;
    },

    async submitWishlistIdea(_accessToken, eventId, text) {
      const record = ensureRecord(eventId);
      const trimmedText = text.trim();

      if (trimmedText) {
        record.wishlist.unshift({
          id: `${eventId}-wish-${mockWishlistCounter++}`,
          title: trimmedText,
          bookedBy: null,
          currentFund: 0,
          targetAmount: 15000
        });
      }

      record.event.updatedAt = nowIso();

      return {
        added: Boolean(trimmedText),
        item: trimmedText || null,
        ...serializeWishlist(record)
      } as WishlistResponse;
    },

    async parseWishlistText(_accessToken, eventId, text) {
      const record = ensureRecord(eventId);
      const items = text
        .split(/[\n,;]+/)
        .map((item) => item.trim())
        .filter(Boolean);

      items.forEach((item, index) => {
        record.wishlist.unshift({
          id: `${eventId}-wish-${mockWishlistCounter++}`,
          title: item,
          bookedBy: null,
          currentFund: 0,
          targetAmount: 9000 + index * 3000
        });
      });

      record.event.updatedAt = nowIso();

      return {
        addedCount: items.length,
        ...serializeWishlist(record)
      } as WishlistResponse;
    },

    async bookWishlistItem(_accessToken, eventId, itemId) {
      const record = ensureRecord(eventId);
      const item = record.wishlist.find((entry) => entry.id === itemId);

      if (!item) {
        throw new Error('Подарок не найден');
      }

      item.bookedBy = 'Вы';
      record.event.updatedAt = nowIso();

      return serializeWishlist(record) as WishlistResponse;
    },

    async fundWishlistItem(_accessToken, eventId, itemId, amount) {
      const record = ensureRecord(eventId);
      const item = record.wishlist.find((entry) => entry.id === itemId);

      if (!item) {
        throw new Error('Подарок не найден');
      }

      item.currentFund += amount;
      record.event.updatedAt = nowIso();

      return serializeWishlist(record) as WishlistResponse;
    },

    async getEventPhotos(_accessToken, eventId) {
      return serializePhotos(ensureRecord(eventId)) as PhotosResponse;
    },

    async uploadEventPhotos(_accessToken, eventId, photos: UploadablePhoto[]) {
      const record = ensureRecord(eventId);
      const nextPhotos = photos.slice(0, 10).map((photo, index) => ({
        id: `${eventId}-photo-${mockPhotoCounter++}`,
        url: photo.uri,
        caption: photo.name || `Фото ${index + 1}`
      }));

      record.photos = [...nextPhotos, ...record.photos];
      record.event.updatedAt = nowIso();

      return serializePhotos(record) as PhotosResponse;
    }
  };
}

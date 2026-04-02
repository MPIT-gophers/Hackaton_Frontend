import {
  AttendanceStatus,
  BackendEvent,
  EventDraft,
  EventGuest,
  EventGuestStats,
  InviteTokenInfo,
  PhotosResponse,
  UploadablePhoto,
  WishlistResponse
} from '../domain/types';
import { request, requestFormData } from '../services/backendClient';

type SuccessEnvelope<T> = {
  data: T;
};

type BackendEventResponse = {
  access_role?: string;
  approval_status?: string;
  attendance_status?: string;
  budget?: string;
  city?: string;
  created_at?: string;
  description?: string;
  event_date?: string;
  event_time?: string;
  expected_guest_count?: number;
  id?: string;
  invite_token?: string;
  selected_variant_id?: string;
  status?: string;
  title?: string;
  updated_at?: string;
  variants?: Record<string, unknown>[];
};

type BackendEventGuestResponse = {
  approval_status?: string;
  attendance_status?: string;
  created_at?: string;
  event_id?: string;
  full_name?: string;
  id?: string;
  phone?: string;
  plus_one_count?: number;
  user_id?: string;
};

type BackendEventGuestStatsResponse = {
  approved?: number;
  attendance_pending?: number;
  confirmed?: number;
  declined?: number;
  pending_approval?: number;
  rejected?: number;
};

type InviteTokenResponse = {
  token?: string;
  invite_token?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function unwrapData<T>(payload: T | SuccessEnvelope<T>): T {
  if (isRecord(payload) && 'data' in payload) {
    return payload.data as T;
  }

  return payload as T;
}

function mapBackendEvent(event: BackendEventResponse): BackendEvent {
  return {
    id: String(event.id ?? ''),
    title: event.title?.trim() || 'Мероприятие',
    city: event.city?.trim() || '',
    budget: event.budget?.trim() || '',
    description: event.description?.trim() || '',
    eventDate: event.event_date?.trim() || '',
    eventTime: event.event_time?.trim() || '',
    expectedGuestCount: Number(event.expected_guest_count ?? 0),
    inviteToken: event.invite_token?.trim() || '',
    selectedVariantId: event.selected_variant_id?.trim() || '',
    status: event.status?.trim() || '',
    accessRole: event.access_role?.trim() || '',
    approvalStatus: event.approval_status?.trim() || '',
    attendanceStatus: event.attendance_status?.trim() || '',
    createdAt: event.created_at?.trim() || '',
    updatedAt: event.updated_at?.trim() || '',
    variants: Array.isArray(event.variants) ? event.variants : []
  };
}

function mapEventGuest(guest: BackendEventGuestResponse): EventGuest {
  return {
    id: String(guest.id ?? ''),
    eventId: String(guest.event_id ?? ''),
    userId: String(guest.user_id ?? ''),
    fullName: guest.full_name?.trim() || 'Гость',
    phone: guest.phone?.trim() || '',
    plusOneCount: Number(guest.plus_one_count ?? 0),
    approvalStatus: (guest.approval_status ?? 'pending') as EventGuest['approvalStatus'],
    attendanceStatus: (guest.attendance_status ?? 'pending') as EventGuest['attendanceStatus'],
    createdAt: guest.created_at?.trim() || ''
  };
}

function mapEventGuestStats(stats: BackendEventGuestStatsResponse): EventGuestStats {
  return {
    approved: Number(stats.approved ?? 0),
    attendancePending: Number(stats.attendance_pending ?? 0),
    confirmed: Number(stats.confirmed ?? 0),
    declined: Number(stats.declined ?? 0),
    pendingApproval: Number(stats.pending_approval ?? 0),
    rejected: Number(stats.rejected ?? 0)
  };
}

function mapInviteToken(payload: unknown): InviteTokenInfo | null {
  const data = unwrapData<InviteTokenResponse | string | null>(payload as InviteTokenResponse | string | null);

  if (typeof data === 'string' && data.trim()) {
    return {
      token: data.trim()
    };
  }

  if (isRecord(data)) {
    const token = typeof data.token === 'string' ? data.token : typeof data.invite_token === 'string' ? data.invite_token : null;

    if (token?.trim()) {
      return {
        token: token.trim()
      };
    }
  }

  return null;
}

function createPhotosFormData(photos: UploadablePhoto[]) {
  const formData = new FormData();

  photos.forEach((photo, index) => {
    formData.append('photos', {
      uri: photo.uri,
      name: photo.name || `photo-${index + 1}.jpg`,
      type: photo.type || 'image/jpeg'
    } as never);
  });

  return formData;
}

export type EventsRepository = {
  listMyEvents(accessToken: string): Promise<BackendEvent[]>;
  createEvent(accessToken: string, draft: EventDraft): Promise<BackendEvent>;
  getEventById(accessToken: string, eventId: string): Promise<BackendEvent>;
  getEventGuests(accessToken: string, eventId: string, approvalStatus?: string): Promise<EventGuest[]>;
  getEventStats(accessToken: string, eventId: string): Promise<EventGuestStats>;
  getEventInviteToken(accessToken: string, eventId: string): Promise<InviteTokenInfo | null>;
  updateGuestAttendance(accessToken: string, eventId: string, guestId: string, attendanceStatus: AttendanceStatus): Promise<EventGuest>;
  getWishlist(accessToken: string, eventId: string): Promise<WishlistResponse>;
  submitWishlistIdea(accessToken: string, eventId: string, text: string): Promise<WishlistResponse>;
  parseWishlistText(accessToken: string, eventId: string, text: string): Promise<WishlistResponse>;
  bookWishlistItem(accessToken: string, eventId: string, itemId: string): Promise<WishlistResponse>;
  fundWishlistItem(accessToken: string, eventId: string, itemId: string, amount: number): Promise<WishlistResponse>;
  getEventPhotos(accessToken: string, eventId: string): Promise<PhotosResponse>;
  uploadEventPhotos(accessToken: string, eventId: string, photos: UploadablePhoto[]): Promise<PhotosResponse>;
};

export function createEventsRepository(): EventsRepository {
  return {
    async listMyEvents(accessToken) {
      const payload = await request<SuccessEnvelope<BackendEventResponse[]>>('/events/my', {
        accessToken
      });

      const events = unwrapData(payload);
      return Array.isArray(events) ? events.map(mapBackendEvent) : [];
    },

    async createEvent(accessToken, draft) {
      const payload = await request<SuccessEnvelope<BackendEventResponse>>('/events', {
        method: 'POST',
        accessToken,
        body: {
          city: draft.city.trim(),
          budget: draft.budget.trim(),
          date: draft.date.trim(),
          time: '14:00',
          scale: Number.parseInt(draft.guests, 10) || 0,
          energy: ''
        }
      });

      return mapBackendEvent(unwrapData(payload));
    },

    async getEventById(accessToken, eventId) {
      const payload = await request<SuccessEnvelope<BackendEventResponse>>(`/events/${eventId}`, {
        accessToken
      });

      return mapBackendEvent(unwrapData(payload));
    },

    async getEventGuests(accessToken, eventId, approvalStatus) {
      const query = approvalStatus ? `?approval_status=${encodeURIComponent(approvalStatus)}` : '';
      const payload = await request<SuccessEnvelope<BackendEventGuestResponse[]>>(`/events/${eventId}/guests${query}`, {
        accessToken
      });

      const guests = unwrapData(payload);
      return Array.isArray(guests) ? guests.map(mapEventGuest) : [];
    },

    async getEventStats(accessToken, eventId) {
      const payload = await request<SuccessEnvelope<BackendEventGuestStatsResponse>>(`/events/${eventId}/stats`, {
        accessToken
      });

      return mapEventGuestStats(unwrapData(payload));
    },

    async getEventInviteToken(accessToken, eventId) {
      const payload = await request<unknown>(`/events/${eventId}/invite`, {
        accessToken
      });

      return mapInviteToken(payload);
    },

    async updateGuestAttendance(accessToken, eventId, guestId, attendanceStatus) {
      const payload = await request<SuccessEnvelope<BackendEventGuestResponse>>(`/events/${eventId}/guests/${guestId}/status`, {
        method: 'PATCH',
        accessToken,
        body: {
          attendance_status: attendanceStatus
        }
      });

      return mapEventGuest(unwrapData(payload));
    },

    async getWishlist(accessToken, eventId) {
      const payload = await request<WishlistResponse>(`/api/v1/events/${eventId}/wishlist`, {
        accessToken
      });

      return unwrapData(payload);
    },

    async submitWishlistIdea(accessToken, eventId, text) {
      const payload = await request<WishlistResponse>(`/api/v1/events/${eventId}/wishlist/ideas`, {
        method: 'POST',
        accessToken,
        body: {
          text
        }
      });

      return unwrapData(payload);
    },

    async parseWishlistText(accessToken, eventId, text) {
      const payload = await request<WishlistResponse>(`/api/v1/events/${eventId}/wishlist/parse`, {
        method: 'POST',
        accessToken,
        body: {
          text
        }
      });

      return unwrapData(payload);
    },

    async bookWishlistItem(accessToken, eventId, itemId) {
      const payload = await request<WishlistResponse>(`/api/v1/events/${eventId}/wishlist/${itemId}/book`, {
        method: 'POST',
        accessToken
      });

      return unwrapData(payload);
    },

    async fundWishlistItem(accessToken, eventId, itemId, amount) {
      const payload = await request<WishlistResponse>(`/api/v1/events/${eventId}/wishlist/${itemId}/fund`, {
        method: 'POST',
        accessToken,
        body: {
          amount
        }
      });

      return unwrapData(payload);
    },

    async getEventPhotos(accessToken, eventId) {
      const payload = await request<PhotosResponse>(`/api/v1/events/${eventId}/photos`, {
        accessToken
      });

      return unwrapData(payload);
    },

    async uploadEventPhotos(accessToken, eventId, photos) {
      const formData = createPhotosFormData(photos.slice(0, 10));
      const payload = await requestFormData<PhotosResponse>(`/api/v1/events/${eventId}/photos/upload`, {
        method: 'POST',
        accessToken,
        body: formData
      });

      return unwrapData(payload);
    }
  };
}

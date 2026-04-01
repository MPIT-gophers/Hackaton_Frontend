export type Venue = {
  id: string;
  name: string;
  summary: string;
  rating: string;
  imageKey: 'venueCover1' | 'venueCover2';
  addressLine: string;
  address: string;
  schedule: string;
  averageCheck: string;
  cuisine: string;
  tags: string[];
};

export type EventDraft = {
  occasion: string;
  city: string;
  date: string;
  budget: string;
  guests: string;
  placeType: string;
  location: string;
  wishes: string;
};

export type RequiredEventField = 'occasion' | 'city' | 'date' | 'budget' | 'guests';
export type EventDraftErrors = Partial<Record<RequiredEventField, true>>;

export type BookedEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  venueId: string;
  venueName: string;
};

export type AuthStatus = 'anonymous' | 'starting' | 'waiting_confirmation' | 'exchanging' | 'authenticated' | 'error';

export type BackendUser = {
  id: string;
  fullName: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthTokens = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresAt: string;
};

export type PendingAuthSession = {
  sessionId: string;
  maxLink: string;
  expiresAt: string;
};

export type StoredAuthSession = {
  tokens: AuthTokens;
  user: BackendUser;
};

export type UserProfile = {
  fullName: string;
  phone: string;
  about: string;
  notificationsEnabled: boolean;
};

export type AppSession = {
  isAuthenticated: boolean;
  status: AuthStatus;
  accessToken: string | null;
  tokenType: 'Bearer' | null;
  expiresAt: string | null;
  pendingSessionId: string | null;
  pendingMaxLink: string | null;
  errorMessage: string | null;
};

export type VenueQuery = Pick<EventDraft, 'placeType' | 'location' | 'wishes'>;

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

export type BackendEventVariant = Record<string, unknown>;

export type BackendEvent = {
  id: string;
  title: string;
  city: string;
  budget: string;
  description: string;
  eventDate: string;
  eventTime: string;
  expectedGuestCount: number;
  inviteToken: string;
  selectedVariantId: string;
  status: string;
  accessRole: string;
  approvalStatus: string;
  attendanceStatus: string;
  createdAt: string;
  updatedAt: string;
  variants: BackendEventVariant[];
};

export type AttendanceStatus = 'pending' | 'confirmed' | 'declined';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type EventGuest = {
  id: string;
  eventId: string;
  userId: string;
  fullName: string;
  phone: string;
  plusOneCount: number;
  approvalStatus: ApprovalStatus;
  attendanceStatus: AttendanceStatus;
  createdAt: string;
};

export type EventGuestStats = {
  approved: number;
  attendancePending: number;
  confirmed: number;
  declined: number;
  pendingApproval: number;
  rejected: number;
};

export type InviteTokenInfo = {
  token: string;
};

export type WishlistResponse = unknown;
export type PhotosResponse = unknown;

export type UploadablePhoto = {
  uri: string;
  name: string;
  type: string;
};

export type NormalizedWishlistItem = {
  id: string;
  title: string;
  subtitle?: string;
  raw: unknown;
};

export type NormalizedPhoto = {
  id: string;
  url: string;
  raw: unknown;
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

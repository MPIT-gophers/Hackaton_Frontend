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

export type UserProfile = {
  name: string;
  about: string;
  notificationsEnabled: boolean;
};

export type AppSession = {
  isAuthenticated: boolean;
};

export type VenueQuery = Pick<EventDraft, 'placeType' | 'location' | 'wishes'>;

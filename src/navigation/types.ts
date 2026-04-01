export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Profile: undefined;
  EventForm: undefined;
  VenuesList: undefined;
  VenueDetails: undefined;
  EventSummary: undefined;
  EventDetails: { eventId: string };
  EventGuests: { eventId: string };
  EventWishlist: { eventId: string };
  EventPhotos: { eventId: string };
};

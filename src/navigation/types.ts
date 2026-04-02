export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Profile: undefined;
  EventForm:
    | {
        mode?: 'create' | 'edit';
        returnTo?: 'EventSummary' | 'VenuesList';
      }
    | undefined;
  VenuesList: undefined;
  VenueDetails: undefined;
  EventSummary: undefined;
  EventDetails: { eventId: string };
  EventGuests: { eventId: string };
  EventWishlist: { eventId: string };
  EventPhotos: { eventId: string };
  AgentChatWelcome: undefined;
  AgentChatConversation: undefined;
};

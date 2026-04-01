import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

import { EventDraft, EventDraftErrors, AppSession, UserProfile, BookedEvent, Venue } from '../domain/types';
import { authService as defaultAuthService, AuthService } from '../services/authService';
import { createEventsRepository, EventsRepository } from '../repositories/eventsRepository';
import { createProfileRepository, defaultUserProfile, ProfileRepository } from '../repositories/profileRepository';
import { venuesRepository as defaultVenuesRepository, VenuesRepository } from '../repositories/venuesRepository';
import { getSelectedVenue } from '../utils/venueRanking';
import { validateEventDraft } from '../utils/validation';

export type AppState = {
  isHydrated: boolean;
  session: AppSession;
  draft: EventDraft;
  draftErrors: EventDraftErrors;
  profile: UserProfile;
  events: BookedEvent[];
  venues: Venue[];
  selectedVenueId: string | null;
};

type HydrationPayload = Pick<AppState, 'profile' | 'events' | 'venues'>;

type AppAction =
  | { type: 'hydrate'; payload: HydrationPayload }
  | { type: 'sign-in' }
  | { type: 'set-draft-field'; field: keyof EventDraft; value: string }
  | { type: 'set-draft-errors'; errors: EventDraftErrors }
  | { type: 'set-selected-venue'; venueId: string | null }
  | { type: 'reset-draft' }
  | { type: 'set-profile'; profile: UserProfile }
  | { type: 'add-event'; event: BookedEvent };

export type AppDependencies = {
  authService: AuthService;
  profileRepository: ProfileRepository;
  eventsRepository: EventsRepository;
  venuesRepository: VenuesRepository;
};

export type AppProviderProps = {
  children: ReactNode;
  initialState?: Partial<AppState>;
  dependencies?: Partial<AppDependencies>;
  skipHydration?: boolean;
};

function createBlankDraft(): EventDraft {
  return {
    occasion: '',
    city: '',
    date: '',
    budget: '',
    guests: '',
    placeType: '',
    location: '',
    wishes: ''
  };
}

export function createInitialState(overrides: Partial<AppState> = {}): AppState {
  return {
    isHydrated: overrides.isHydrated ?? false,
    session: {
      isAuthenticated: overrides.session?.isAuthenticated ?? false
    },
    draft: {
      ...createBlankDraft(),
      ...overrides.draft
    },
    draftErrors: overrides.draftErrors ?? {},
    profile: {
      ...defaultUserProfile,
      ...overrides.profile
    },
    events: overrides.events ?? [],
    venues: overrides.venues ?? [],
    selectedVenueId: overrides.selectedVenueId ?? null
  };
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'hydrate':
      return {
        ...state,
        isHydrated: true,
        profile: action.payload.profile,
        events: action.payload.events,
        venues: action.payload.venues
      };
    case 'sign-in':
      return {
        ...state,
        session: {
          isAuthenticated: true
        }
      };
    case 'set-draft-field': {
      const nextErrors = { ...state.draftErrors };
      delete nextErrors[action.field as keyof EventDraftErrors];

      return {
        ...state,
        draft: {
          ...state.draft,
          [action.field]: action.value
        },
        draftErrors: nextErrors
      };
    }
    case 'set-draft-errors':
      return {
        ...state,
        draftErrors: action.errors
      };
    case 'set-selected-venue':
      return {
        ...state,
        selectedVenueId: action.venueId
      };
    case 'reset-draft':
      return {
        ...state,
        draft: createBlankDraft(),
        draftErrors: {},
        selectedVenueId: null
      };
    case 'set-profile':
      return {
        ...state,
        profile: action.profile
      };
    case 'add-event':
      return {
        ...state,
        events: [action.event, ...state.events],
        draft: createBlankDraft(),
        draftErrors: {},
        selectedVenueId: null
      };
    default:
      return state;
  }
}

function createDependencies(overrides: Partial<AppDependencies> = {}): AppDependencies {
  return {
    authService: overrides.authService ?? defaultAuthService,
    profileRepository: overrides.profileRepository ?? createProfileRepository(),
    eventsRepository: overrides.eventsRepository ?? createEventsRepository(),
    venuesRepository: overrides.venuesRepository ?? defaultVenuesRepository
  };
}

type AppContextValue = {
  state: AppState;
  actions: {
    signIn(): Promise<void>;
    startEventDraft(): void;
    updateDraftField(field: keyof EventDraft, value: string): void;
    validateDraft(): boolean;
    chooseVenue(venueId: string): void;
    toggleNotifications(): Promise<void>;
    updateAbout(about: string): Promise<void>;
    confirmBooking(): Promise<BookedEvent | null>;
  };
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children, initialState, dependencies, skipHydration = false }: AppProviderProps) {
  const deps = useMemo(() => createDependencies(dependencies), [dependencies]);
  const [state, dispatch] = useReducer(appReducer, createInitialState(initialState));

  useEffect(() => {
    if (skipHydration) {
      return;
    }

    let isMounted = true;

    async function hydrate() {
      const [profile, events, venues] = await Promise.all([
        deps.profileRepository.getProfile(),
        deps.eventsRepository.listEvents(),
        deps.venuesRepository.getVenues({
          placeType: '',
          location: '',
          wishes: ''
        })
      ]);

      if (!isMounted) {
        return;
      }

      dispatch({
        type: 'hydrate',
        payload: {
          profile,
          events,
          venues
        }
      });
    }

    hydrate();

    return () => {
      isMounted = false;
    };
  }, [deps, skipHydration]);

  const signIn = useCallback(async () => {
    await deps.authService.signIn();
    dispatch({ type: 'sign-in' });
  }, [deps.authService]);

  const startEventDraft = useCallback(() => {
    dispatch({ type: 'reset-draft' });
  }, []);

  const updateDraftField = useCallback((field: keyof EventDraft, value: string) => {
    dispatch({ type: 'set-draft-field', field, value });
  }, []);

  const validateDraft = useCallback(() => {
    const errors = validateEventDraft(state.draft);
    dispatch({ type: 'set-draft-errors', errors });

    if (Object.keys(errors).length > 0) {
      return false;
    }

    const venue = getSelectedVenue(state.venues, state.draft, state.selectedVenueId);

    if (venue) {
      dispatch({ type: 'set-selected-venue', venueId: venue.id });
    }

    return true;
  }, [state.draft, state.selectedVenueId, state.venues]);

  const chooseVenue = useCallback((venueId: string) => {
    dispatch({ type: 'set-selected-venue', venueId });
  }, []);

  const persistProfile = useCallback(
    async (profile: UserProfile) => {
      dispatch({ type: 'set-profile', profile });
      await deps.profileRepository.saveProfile(profile);
    },
    [deps.profileRepository]
  );

  const toggleNotifications = useCallback(async () => {
    const nextProfile = {
      ...state.profile,
      notificationsEnabled: !state.profile.notificationsEnabled
    };

    await persistProfile(nextProfile);
  }, [persistProfile, state.profile]);

  const updateAbout = useCallback(
    async (about: string) => {
      const nextProfile = {
        ...state.profile,
        about
      };

      await persistProfile(nextProfile);
    },
    [persistProfile, state.profile]
  );

  const confirmBooking = useCallback(async () => {
    const selectedVenue = getSelectedVenue(state.venues, state.draft, state.selectedVenueId);

    if (!selectedVenue) {
      return null;
    }

    const event = await deps.eventsRepository.createEvent(state.draft, selectedVenue);
    dispatch({ type: 'add-event', event });

    return event;
  }, [deps.eventsRepository, state.draft, state.selectedVenueId, state.venues]);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      actions: {
        signIn,
        startEventDraft,
        updateDraftField,
        validateDraft,
        chooseVenue,
        toggleNotifications,
        updateAbout,
        confirmBooking
      }
    }),
    [chooseVenue, confirmBooking, signIn, startEventDraft, state, toggleNotifications, updateAbout, updateDraftField, validateDraft]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider');
  }

  return context;
}

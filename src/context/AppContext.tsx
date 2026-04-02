import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { AppState as RNAppState, Linking, Platform } from 'react-native';

import {
  AppSession,
  AttendanceStatus,
  BackendEvent,
  BackendUser,
  EventDraft,
  EventDraftErrors,
  EventGuest,
  EventGuestStats,
  PendingAuthSession,
  PhotosResponse,
  StoredAuthSession,
  UploadablePhoto,
  UserProfile,
  Venue,
  WishlistResponse
} from '../domain/types';
import { createEventsRepository, EventsRepository } from '../repositories/eventsRepository';
import {
  createProfileRepository,
  defaultLocalProfile,
  defaultUserProfile,
  ProfileRepository
} from '../repositories/profileRepository';
import { authService as defaultAuthService, AuthService } from '../services/authService';
import {
  BackendError,
  getBackendErrorMessage,
  isUnauthorizedBackendError
} from '../services/backendClient';
import { ProfileService } from '../services/profileService';
import { mockProfileService as defaultProfileService } from '../services/mockProfileService';
import { venuesRepository as defaultVenuesRepository, VenuesRepository } from '../repositories/venuesRepository';
import { extractVenuesFromEvent, getSelectedVenue, hasEventLocations } from '../utils/venueRanking';
import { validateEventDraft } from '../utils/validation';
import { logger } from '../utils/logger';

const AUTH_SESSION_EXPIRED_MESSAGE = 'Сессия входа истекла, начните заново';
const AUTH_START_FAILED_MESSAGE = 'Не удалось начать вход. Попробуйте снова.';
const AUTH_COMPLETE_FAILED_MESSAGE = 'Не удалось завершить вход. Попробуйте снова.';
const OPEN_MAX_FAILED_MESSAGE = 'Не удалось открыть MAX автоматически';
const MOBILE_ONLY_AUTH_MESSAGE = 'Авторизация через MAX доступна в мобильной версии';
const PROFILE_UPDATE_FAILED_MESSAGE = 'Не удалось сохранить профиль. Попробуйте снова.';
const SESSION_EXPIRED_MESSAGE = 'Сессия истекла, войдите снова';
const EVENTS_LOAD_FAILED_MESSAGE = 'Не удалось загрузить мероприятия. Попробуйте снова.';
const EVENT_CREATE_FAILED_MESSAGE = 'Не удалось сохранить мероприятие. Попробуйте снова.';
const EVENT_DETAILS_FAILED_MESSAGE = 'Не удалось загрузить мероприятие. Попробуйте снова.';
const EVENT_GUESTS_FAILED_MESSAGE = 'Не удалось загрузить гостей. Попробуйте снова.';
const EVENT_STATS_FAILED_MESSAGE = 'Не удалось загрузить статистику. Попробуйте снова.';
const EVENT_INVITE_FAILED_MESSAGE = 'Не удалось получить invite token. Попробуйте снова.';
const EVENT_GUEST_UPDATE_FAILED_MESSAGE = 'Не удалось обновить статус гостя. Попробуйте снова.';
const WISHLIST_LOAD_FAILED_MESSAGE = 'Не удалось загрузить wishlist. Попробуйте снова.';
const WISHLIST_PARSE_FAILED_MESSAGE = 'Не удалось разобрать wishlist. Попробуйте снова.';
const WISHLIST_IDEA_FAILED_MESSAGE = 'Не удалось отправить идею. Попробуйте снова.';
const WISHLIST_BOOK_FAILED_MESSAGE = 'Не удалось забронировать item. Попробуйте снова.';
const WISHLIST_FUND_FAILED_MESSAGE = 'Не удалось отправить финансирование. Попробуйте снова.';
const PHOTOS_LOAD_FAILED_MESSAGE = 'Не удалось загрузить фотографии. Попробуйте снова.';
const PHOTOS_UPLOAD_FAILED_MESSAGE = 'Не удалось загрузить фотографии. Попробуйте снова.';
const POLLING_INTERVAL_MS = 1500;

export type AppState = {
  isHydrated: boolean;
  session: AppSession;
  draft: EventDraft;
  draftErrors: EventDraftErrors;
  profile: UserProfile;
  events: BackendEvent[];
  venues: Venue[];
  selectedVenueId: string | null;
  pendingEventId: string | null;
};

type InitialStateOverrides = Partial<Omit<AppState, 'session' | 'profile'>> & {
  session?: Partial<AppSession>;
  profile?: Partial<UserProfile>;
};

type HydrationPayload = Pick<AppState, 'profile' | 'events' | 'venues' | 'session'>;

type AppAction =
  | { type: 'hydrate'; payload: HydrationPayload }
  | { type: 'auth-start' }
  | { type: 'auth-waiting'; pendingSession: PendingAuthSession; errorMessage?: string | null }
  | { type: 'auth-exchanging' }
  | { type: 'auth-success'; authSession: StoredAuthSession; profile: UserProfile; events: BackendEvent[] }
  | { type: 'auth-error'; errorMessage: string }
  | { type: 'auth-clear' }
  | { type: 'set-draft-field'; field: keyof EventDraft; value: string }
  | { type: 'set-draft-errors'; errors: EventDraftErrors }
  | { type: 'set-selected-venue'; venueId: string | null }
  | { type: 'reset-draft' }
  | { type: 'set-profile'; profile: UserProfile }
  | { type: 'set-events'; events: BackendEvent[] }
  | { type: 'add-event'; event: BackendEvent }
  | { type: 'set-pending-event-id'; eventId: string | null }
  | { type: 'set-venues'; venues: Venue[] };

export type AppDependencies = {
  authService: AuthService;
  profileRepository: ProfileRepository;
  profileService: ProfileService;
  eventsRepository: EventsRepository;
  venuesRepository: VenuesRepository;
};

export type AppProviderProps = {
  children: ReactNode;
  initialState?: InitialStateOverrides;
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

function createAnonymousSession(overrides: Partial<AppSession> = {}): AppSession {
  return {
    isAuthenticated: false,
    status: 'anonymous',
    accessToken: null,
    tokenType: null,
    expiresAt: null,
    pendingSessionId: null,
    pendingMaxLink: null,
    errorMessage: null,
    ...overrides
  };
}

function createAuthenticatedSession(authSession: StoredAuthSession): AppSession {
  return createAnonymousSession({
    isAuthenticated: true,
    status: 'authenticated',
    accessToken: authSession.tokens.accessToken,
    tokenType: authSession.tokens.tokenType,
    expiresAt: authSession.tokens.expiresAt
  });
}

function createWaitingSession(pendingSession: PendingAuthSession, errorMessage: string | null = null): AppSession {
  return createAnonymousSession({
    status: 'waiting_confirmation',
    pendingSessionId: pendingSession.sessionId,
    pendingMaxLink: pendingSession.maxLink,
    expiresAt: pendingSession.expiresAt,
    errorMessage
  });
}

function summarizeSession(session: AppSession) {
  return {
    isAuthenticated: session.isAuthenticated,
    status: session.status,
    hasAccessToken: Boolean(session.accessToken),
    hasPendingSession: Boolean(session.pendingSessionId),
    hasPendingMaxLink: Boolean(session.pendingMaxLink),
    expiresAt: session.expiresAt
  };
}

function summarizeDraft(draft: EventDraft) {
  return {
    occasion: draft.occasion,
    city: draft.city,
    date: draft.date,
    budget: draft.budget,
    guests: draft.guests,
    hasPlaceType: Boolean(draft.placeType.trim()),
    hasLocation: Boolean(draft.location.trim()),
    hasWishes: Boolean(draft.wishes.trim())
  };
}

function getPendingSessionFromState(session: AppSession): PendingAuthSession | null {
  if (!session.pendingSessionId || !session.pendingMaxLink || !session.expiresAt) {
    return null;
  }

  return {
    sessionId: session.pendingSessionId,
    maxLink: session.pendingMaxLink,
    expiresAt: session.expiresAt
  };
}

function isExpiredAuthError(error: unknown) {
  return (
    error instanceof BackendError &&
    ['auth session expired', 'max init data expired', 'not found'].includes(error.message.toLowerCase())
  );
}

function isAlreadyExchangedError(error: unknown) {
  return error instanceof BackendError && error.message.toLowerCase() === 'auth session already exchanged';
}

export function createInitialState(overrides: InitialStateOverrides = {}): AppState {
  return {
    isHydrated: overrides.isHydrated ?? false,
    session: createAnonymousSession(overrides.session),
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
    selectedVenueId: overrides.selectedVenueId ?? null,
    pendingEventId: overrides.pendingEventId ?? null
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
        venues: action.payload.venues,
        session: action.payload.session
      };
    case 'auth-start':
      return {
        ...state,
        session: createAnonymousSession({
          status: 'starting'
        })
      };
    case 'auth-waiting':
      return {
        ...state,
        session: createWaitingSession(action.pendingSession, action.errorMessage ?? null)
      };
    case 'auth-exchanging':
      return {
        ...state,
        session: createAnonymousSession({
          status: 'exchanging',
          pendingSessionId: state.session.pendingSessionId,
          pendingMaxLink: state.session.pendingMaxLink,
          expiresAt: state.session.expiresAt
        })
      };
    case 'auth-success':
      return {
        ...state,
        session: createAuthenticatedSession(action.authSession),
        profile: action.profile,
        events: action.events
      };
    case 'auth-error':
      return {
        ...state,
        session: createAnonymousSession({
          status: 'error',
          errorMessage: action.errorMessage
        })
      };
    case 'auth-clear':
      return {
        ...createInitialState({
          isHydrated: state.isHydrated,
          venues: state.venues
        })
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
        selectedVenueId: null,
        pendingEventId: null
      };
    case 'set-profile':
      return {
        ...state,
        profile: action.profile
      };
    case 'set-events':
      return {
        ...state,
        events: action.events
      };
    case 'add-event':
      return {
        ...state,
        events: [action.event, ...state.events]
      };
    case 'set-pending-event-id':
      return {
        ...state,
        pendingEventId: action.eventId
      };
    case 'set-venues':
      return {
        ...state,
        venues: action.venues
      };
    default:
      return state;
  }
}

function createDependencies(overrides: Partial<AppDependencies> = {}): AppDependencies {
  return {
    authService: overrides.authService ?? defaultAuthService,
    profileRepository: overrides.profileRepository ?? createProfileRepository(),
    profileService: overrides.profileService ?? defaultProfileService,
    eventsRepository: overrides.eventsRepository ?? createEventsRepository(),
    venuesRepository: overrides.venuesRepository ?? defaultVenuesRepository
  };
}

type AppContextValue = {
  state: AppState;
  actions: {
    signIn(): Promise<void>;
    retryAuth(): Promise<void>;
    reopenMax(): Promise<void>;
    signOut(): Promise<void>;
    refreshEvents(): Promise<BackendEvent[]>;
    startEventDraft(): void;
    updateDraftField(field: keyof EventDraft, value: string): void;
    validateDraft(): boolean;
    chooseVenue(venueId: string): void;
    toggleNotifications(): Promise<void>;
    updateAbout(about: string): Promise<void>;
    saveProfileIdentity(fullName: string, phone: string): Promise<void>;
    createEventForVenues(): Promise<string>;
    pollEventVenues(eventId: string): Promise<{ ready: boolean; venues: Venue[] }>;
    confirmBooking(): Promise<BackendEvent | null>;
    getEventDetails(eventId: string): Promise<BackendEvent>;
    getEventGuests(eventId: string, approvalStatus?: string): Promise<EventGuest[]>;
    getEventStats(eventId: string): Promise<EventGuestStats>;
    getEventInviteToken(eventId: string): Promise<string | null>;
    updateGuestAttendance(eventId: string, guestId: string, attendanceStatus: AttendanceStatus): Promise<EventGuest>;
    getWishlist(eventId: string): Promise<WishlistResponse>;
    parseWishlistText(eventId: string, text: string): Promise<WishlistResponse>;
    submitWishlistIdea(eventId: string, text: string): Promise<WishlistResponse>;
    bookWishlistItem(eventId: string, itemId: string): Promise<WishlistResponse>;
    fundWishlistItem(eventId: string, itemId: string, amount: number): Promise<WishlistResponse>;
    getPhotos(eventId: string): Promise<PhotosResponse>;
    uploadPhotos(eventId: string, photos: UploadablePhoto[]): Promise<PhotosResponse>;
  };
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children, initialState, dependencies, skipHydration = false }: AppProviderProps) {
  const deps = useMemo(() => createDependencies(dependencies), [dependencies]);
  const [state, dispatch] = useReducer(appReducer, createInitialState(initialState));

  const localProfileSnapshot = useMemo(
    () => ({
      about: state.profile.about,
      notificationsEnabled: state.profile.notificationsEnabled
    }),
    [state.profile.about, state.profile.notificationsEnabled]
  );

  const loadEventsForToken = useCallback(
    async (accessToken: string) => {
      return deps.eventsRepository.listMyEvents(accessToken);
    },
    [deps.eventsRepository]
  );

  const signOut = useCallback(async () => {
    logger.info('AppContext', 'Sign out started');
    await Promise.allSettled([
      deps.authService.clearAuthSession(),
      deps.authService.clearPendingSession(),
      deps.profileRepository.clearLocalProfile()
    ]);

    dispatch({ type: 'auth-clear' });
    logger.info('AppContext', 'Sign out completed');
  }, [deps.authService, deps.profileRepository]);

  const requireAccessToken = useCallback(() => {
    if (!state.session.accessToken) {
      throw new Error(SESSION_EXPIRED_MESSAGE);
    }

    return state.session.accessToken;
  }, [state.session.accessToken]);

  const handleProtectedError = useCallback(
    async (error: unknown, fallback: string): Promise<never> => {
      if (isUnauthorizedBackendError(error)) {
        logger.warn('AppContext', 'Protected request returned unauthorized, forcing sign out', {
          fallback,
          error
        });
        await signOut();
        throw new Error(SESSION_EXPIRED_MESSAGE);
      }

      logger.error('AppContext', 'Protected request failed', {
        fallback,
        error
      });
      throw new Error(getBackendErrorMessage(error, fallback));
    },
    [signOut]
  );

  const openMaxApp = useCallback(async (pendingSession: PendingAuthSession) => {
    logger.info('AppContext', 'Opening MAX app for pending auth session', {
      pendingSession
    });
    dispatch({ type: 'auth-waiting', pendingSession });

    try {
      await Linking.openURL(pendingSession.maxLink);
    } catch {
      logger.error('AppContext', 'Failed to open MAX app');
      dispatch({
        type: 'auth-waiting',
        pendingSession,
        errorMessage: OPEN_MAX_FAILED_MESSAGE
      });
    }
  }, []);

  useEffect(() => {
    if (skipHydration) {
      return;
    }

    let isMounted = true;

    async function hydrate() {
      logger.info('AppContext', 'Hydration started');
      const [authResult, profileResult, venuesResult] = await Promise.allSettled([
        deps.authService.restore(),
        deps.profileRepository.getLocalProfile(),
        deps.venuesRepository.getVenues({
          placeType: '',
          location: '',
          wishes: ''
        })
      ]);

      if (!isMounted) {
        return;
      }

      const restoredAuth = authResult.status === 'fulfilled' ? authResult.value : { auth: null, pending: null };
      const localProfile = profileResult.status === 'fulfilled' ? profileResult.value : defaultLocalProfile;
      const venues = venuesResult.status === 'fulfilled' ? venuesResult.value : [];
      let authSession = restoredAuth.auth;
      let events: BackendEvent[] = [];

      logger.debug('AppContext', 'Hydration dependencies resolved', {
        restoredAuth: {
          hasAuth: Boolean(restoredAuth.auth),
          hasPending: Boolean(restoredAuth.pending)
        },
        hasLocalProfile: profileResult.status === 'fulfilled',
        venueCount: venues.length
      });

      if (authSession) {
        try {
          events = await loadEventsForToken(authSession.tokens.accessToken);
        } catch (error) {
          logger.warn('AppContext', 'Failed to load events during hydration', {
            error
          });
          if (isUnauthorizedBackendError(error)) {
            await deps.authService.clearAuthSession();
            authSession = null;
          }
        }
      }

      const profile = deps.profileRepository.mergeProfile(authSession?.user ?? null, localProfile);
      const session = authSession
        ? createAuthenticatedSession(authSession)
        : restoredAuth.pending
          ? createWaitingSession(restoredAuth.pending)
          : createAnonymousSession();

      dispatch({
        type: 'hydrate',
        payload: {
          profile,
          events,
          venues,
          session
        }
      });

      logger.info('AppContext', 'Hydration completed', {
        session: summarizeSession(session),
        eventCount: events.length,
        venueCount: venues.length
      });
    }

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, [deps.authService, deps.profileRepository, deps.venuesRepository, loadEventsForToken, skipHydration]);

  useEffect(() => {
    if (state.session.status !== 'waiting_confirmation' || !state.session.pendingSessionId) {
      return;
    }

    let isActive = true;
    let isRequestInFlight = false;

    const pollSession = async () => {
      if (!isActive || isRequestInFlight) {
        return;
      }

      isRequestInFlight = true;

      try {
        logger.debug('AppContext', 'Polling MAX auth session status', {
          pendingSessionId: state.session.pendingSessionId
        });
        const status = await deps.authService.getMaxSessionStatus(state.session.pendingSessionId!);

        if (!isActive) {
          return;
        }

        if (status === 'pending') {
          logger.debug('AppContext', 'MAX auth session still pending', {
            pendingSessionId: state.session.pendingSessionId
          });
          return;
        }

        if (status === 'expired') {
          logger.warn('AppContext', 'MAX auth session expired', {
            pendingSessionId: state.session.pendingSessionId
          });
          await deps.authService.clearPendingSession();

          if (isActive) {
            dispatch({
              type: 'auth-error',
              errorMessage: AUTH_SESSION_EXPIRED_MESSAGE
            });
          }

          return;
        }

        dispatch({ type: 'auth-exchanging' });
        logger.info('AppContext', 'MAX auth session completed, exchanging tokens', {
          pendingSessionId: state.session.pendingSessionId
        });

        const authSession = await deps.authService.exchangeMaxSession(state.session.pendingSessionId!);
        const events = await loadEventsForToken(authSession.tokens.accessToken).catch(() => []);

        if (!isActive) {
          return;
        }

        dispatch({
          type: 'auth-success',
          authSession,
          profile: deps.profileRepository.mergeProfile(authSession.user, localProfileSnapshot),
          events
        });

        logger.info('AppContext', 'MAX auth session exchanged successfully', {
          session: summarizeSession(createAuthenticatedSession(authSession)),
          eventCount: events.length
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        if (isExpiredAuthError(error)) {
          logger.warn('AppContext', 'MAX auth exchange failed because session expired', {
            error
          });
          await deps.authService.clearPendingSession();
          dispatch({
            type: 'auth-error',
            errorMessage: AUTH_SESSION_EXPIRED_MESSAGE
          });
          return;
        }

        if (isAlreadyExchangedError(error)) {
          logger.warn('AppContext', 'MAX auth session was already exchanged, restoring persisted auth', {
            error
          });
          await deps.authService.clearPendingSession();
          const restoredAuth = await deps.authService.restore();

          if (restoredAuth.auth && isActive) {
            const events = await loadEventsForToken(restoredAuth.auth.tokens.accessToken).catch(() => []);
            dispatch({
              type: 'auth-success',
              authSession: restoredAuth.auth,
              profile: deps.profileRepository.mergeProfile(restoredAuth.auth.user, localProfileSnapshot),
              events
            });
            logger.info('AppContext', 'Persisted auth restored after already-exchanged response', {
              session: summarizeSession(createAuthenticatedSession(restoredAuth.auth)),
              eventCount: events.length
            });
            return;
          }
        }

        logger.error('AppContext', 'MAX auth polling or exchange failed', {
          error
        });
        await deps.authService.clearPendingSession();
        dispatch({
          type: 'auth-error',
          errorMessage: getBackendErrorMessage(error, AUTH_COMPLETE_FAILED_MESSAGE)
        });
      } finally {
        isRequestInFlight = false;
      }
    };

    void pollSession();
    const intervalId = setInterval(() => {
      void pollSession();
    }, POLLING_INTERVAL_MS);

    const appStateSubscription = RNAppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        isRequestInFlight = false;
        void pollSession();
      }
    });

    return () => {
      isActive = false;
      clearInterval(intervalId);
      appStateSubscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- state.session.status is intentionally
    // excluded: including it causes the effect to restart (and cancel in-flight requests) when
    // dispatch({ type: 'auth-exchanging' }) fires mid-exchange. The guard on line 476 already
    // prevents the effect body from running in the wrong status.
  }, [deps.authService, deps.profileRepository, loadEventsForToken, localProfileSnapshot, state.session.pendingSessionId]);

  const signIn = useCallback(async () => {
    if (Platform.OS === 'web') {
      logger.warn('AppContext', 'MAX auth requested on unsupported web platform');
      dispatch({ type: 'auth-error', errorMessage: MOBILE_ONLY_AUTH_MESSAGE });
      return;
    }

    logger.info('AppContext', 'Sign in started');
    dispatch({ type: 'auth-start' });

    try {
      const pendingSession = await deps.authService.startMaxAuth();
      await openMaxApp(pendingSession);
    } catch (error) {
      logger.error('AppContext', 'Failed to start sign in', {
        error
      });
      dispatch({
        type: 'auth-error',
        errorMessage: getBackendErrorMessage(error, AUTH_START_FAILED_MESSAGE)
      });
    }
  }, [deps.authService, openMaxApp]);

  const retryAuth = useCallback(async () => {
    logger.info('AppContext', 'Retrying auth flow');
    await deps.authService.clearPendingSession();
    dispatch({ type: 'auth-clear' });
    await signIn();
  }, [deps.authService, signIn]);

  const reopenMax = useCallback(async () => {
    const pendingSession = getPendingSessionFromState(state.session);

    if (!pendingSession) {
      logger.warn('AppContext', 'Reopen MAX requested without pending session', {
        session: summarizeSession(state.session)
      });
      return;
    }

    logger.info('AppContext', 'Reopening MAX app');
    await openMaxApp(pendingSession);
  }, [openMaxApp, state.session]);

  const refreshEvents = useCallback(async () => {
    const accessToken = requireAccessToken();
    logger.debug('AppContext', 'Refreshing events list');

    try {
      const events = await deps.eventsRepository.listMyEvents(accessToken);
      dispatch({ type: 'set-events', events });
      logger.info('AppContext', 'Events list refreshed', {
        eventCount: events.length
      });
      return events;
    } catch (error) {
      return handleProtectedError(error, EVENTS_LOAD_FAILED_MESSAGE);
    }
  }, [deps.eventsRepository, handleProtectedError, requireAccessToken]);

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

  const persistLocalProfile = useCallback(
    async (localProfile: Pick<UserProfile, 'about' | 'notificationsEnabled'>) => {
      const nextProfile = {
        ...state.profile,
        ...localProfile
      };

      dispatch({ type: 'set-profile', profile: nextProfile });
      await deps.profileRepository.saveLocalProfile({
        about: nextProfile.about,
        notificationsEnabled: nextProfile.notificationsEnabled
      });
    },
    [deps.profileRepository, state.profile]
  );

  const toggleNotifications = useCallback(async () => {
    await persistLocalProfile({
      about: state.profile.about,
      notificationsEnabled: !state.profile.notificationsEnabled
    });
  }, [persistLocalProfile, state.profile.about, state.profile.notificationsEnabled]);

  const updateAbout = useCallback(
    async (about: string) => {
      await persistLocalProfile({
        about,
        notificationsEnabled: state.profile.notificationsEnabled
      });
    },
    [persistLocalProfile, state.profile.notificationsEnabled]
  );

  const saveProfileIdentity = useCallback(
    async (fullName: string, phone: string) => {
      const accessToken = requireAccessToken();

      try {
        const backendUser = await deps.profileService.updateMe(accessToken, {
          fullName: fullName.trim(),
          phone: phone.trim() ? phone.trim() : null
        });

        dispatch({
          type: 'set-profile',
          profile: deps.profileRepository.mergeProfile(backendUser, localProfileSnapshot)
        });
      } catch (error) {
        return handleProtectedError(error, PROFILE_UPDATE_FAILED_MESSAGE);
      }
    },
    [deps.profileRepository, deps.profileService, handleProtectedError, localProfileSnapshot, requireAccessToken]
  );

  const createEventForVenues = useCallback(async () => {
    const accessToken = requireAccessToken();
    logger.info('AppContext', 'Creating event for venues', {
      draft: summarizeDraft(state.draft),
      hasAccessToken: Boolean(accessToken)
    });

    try {
      const createdEvent = await deps.eventsRepository.createEvent(accessToken, state.draft);
      logger.info('AppContext', 'Event created for venues', {
        eventId: createdEvent.id
      });
      dispatch({ type: 'set-venues', venues: [] });
      dispatch({ type: 'set-pending-event-id', eventId: createdEvent.id });

      const venues = extractVenuesFromEvent(createdEvent);

      if (venues.length > 0) {
        logger.info('AppContext', 'Venues extracted immediately from created event', {
          eventId: createdEvent.id,
          venueCount: venues.length
        });
        dispatch({ type: 'set-venues', venues });
      }

      return createdEvent.id;
    } catch (error) {
      logger.error('AppContext', 'Failed to create event for venues', {
        draft: summarizeDraft(state.draft),
        error
      });
      return handleProtectedError(error, EVENT_CREATE_FAILED_MESSAGE);
    }
  }, [deps.eventsRepository, handleProtectedError, requireAccessToken, state.draft]);

  const pollEventVenues = useCallback(
    async (eventId: string): Promise<{ ready: boolean; venues: Venue[] }> => {
      const accessToken = requireAccessToken();
      logger.debug('AppContext', 'Polling event venues', {
        eventId,
        hasAccessToken: Boolean(accessToken)
      });

      try {
        const event = await deps.eventsRepository.getEventById(accessToken, eventId);
        const isReady = event.status.trim().toLowerCase() === 'ready';

        if (!isReady || !hasEventLocations(event)) {
          logger.debug('AppContext', 'Event venues are not ready yet', {
            eventId,
            status: event.status
          });
          return { ready: false, venues: [] };
        }

        const venues = extractVenuesFromEvent(event);
        logger.info('AppContext', 'Event venues are ready', {
          eventId,
          venueCount: venues.length
        });
        dispatch({ type: 'set-venues', venues });
        return { ready: true, venues };
      } catch (error) {
        logger.error('AppContext', 'Failed to poll event venues', {
          eventId,
          error
        });
        return handleProtectedError(error, EVENT_DETAILS_FAILED_MESSAGE);
      }
    },
    [deps.eventsRepository, handleProtectedError, requireAccessToken]
  );

  const confirmBooking = useCallback(async () => {
    const selectedVenue = getSelectedVenue(state.venues, state.draft, state.selectedVenueId);

    if (!selectedVenue) {
      return null;
    }

    const accessToken = requireAccessToken();

    if (state.pendingEventId) {
      try {
        const event = await deps.eventsRepository.getEventById(accessToken, state.pendingEventId);

        try {
          const events = await deps.eventsRepository.listMyEvents(accessToken);
          dispatch({ type: 'set-events', events });
        } catch (refreshError) {
          if (isUnauthorizedBackendError(refreshError)) {
            return handleProtectedError(refreshError, EVENTS_LOAD_FAILED_MESSAGE);
          }

          dispatch({ type: 'add-event', event });
        }

        dispatch({ type: 'reset-draft' });
        return event;
      } catch (error) {
        return handleProtectedError(error, EVENT_CREATE_FAILED_MESSAGE);
      }
    }

    try {
      const createdEvent = await deps.eventsRepository.createEvent(accessToken, state.draft);

      try {
        const events = await deps.eventsRepository.listMyEvents(accessToken);
        dispatch({ type: 'set-events', events });
      } catch (refreshError) {
        if (isUnauthorizedBackendError(refreshError)) {
          return handleProtectedError(refreshError, EVENTS_LOAD_FAILED_MESSAGE);
        }

        dispatch({ type: 'add-event', event: createdEvent });
      }

      dispatch({ type: 'reset-draft' });
      return createdEvent;
    } catch (error) {
      return handleProtectedError(error, EVENT_CREATE_FAILED_MESSAGE);
    }
  }, [deps.eventsRepository, handleProtectedError, requireAccessToken, state.draft, state.pendingEventId, state.selectedVenueId, state.venues]);

  const getEventDetails = useCallback(
    async (eventId: string) => {
      const accessToken = requireAccessToken();

      try {
        return await deps.eventsRepository.getEventById(accessToken, eventId);
      } catch (error) {
        return handleProtectedError(error, EVENT_DETAILS_FAILED_MESSAGE);
      }
    },
    [deps.eventsRepository, handleProtectedError, requireAccessToken]
  );

  const getEventGuests = useCallback(
    async (eventId: string, approvalStatus?: string) => {
      const accessToken = requireAccessToken();

      try {
        return await deps.eventsRepository.getEventGuests(accessToken, eventId, approvalStatus);
      } catch (error) {
        return handleProtectedError(error, EVENT_GUESTS_FAILED_MESSAGE);
      }
    },
    [deps.eventsRepository, handleProtectedError, requireAccessToken]
  );

  const getEventStats = useCallback(
    async (eventId: string) => {
      const accessToken = requireAccessToken();

      try {
        return await deps.eventsRepository.getEventStats(accessToken, eventId);
      } catch (error) {
        return handleProtectedError(error, EVENT_STATS_FAILED_MESSAGE);
      }
    },
    [deps.eventsRepository, handleProtectedError, requireAccessToken]
  );

  const getEventInviteToken = useCallback(
    async (eventId: string) => {
      const accessToken = requireAccessToken();

      try {
        const invite = await deps.eventsRepository.getEventInviteToken(accessToken, eventId);
        return invite?.token ?? null;
      } catch (error) {
        return handleProtectedError(error, EVENT_INVITE_FAILED_MESSAGE);
      }
    },
    [deps.eventsRepository, handleProtectedError, requireAccessToken]
  );

  const updateGuestAttendance = useCallback(
    async (eventId: string, guestId: string, attendanceStatus: AttendanceStatus) => {
      const accessToken = requireAccessToken();

      try {
        return await deps.eventsRepository.updateGuestAttendance(accessToken, eventId, guestId, attendanceStatus);
      } catch (error) {
        return handleProtectedError(error, EVENT_GUEST_UPDATE_FAILED_MESSAGE);
      }
    },
    [deps.eventsRepository, handleProtectedError, requireAccessToken]
  );

  const getWishlist = useCallback(
    async (eventId: string) => {
      const accessToken = requireAccessToken();

      try {
        return await deps.eventsRepository.getWishlist(accessToken, eventId);
      } catch (error) {
        return handleProtectedError(error, WISHLIST_LOAD_FAILED_MESSAGE);
      }
    },
    [deps.eventsRepository, handleProtectedError, requireAccessToken]
  );

  const parseWishlistText = useCallback(
    async (eventId: string, text: string) => {
      const accessToken = requireAccessToken();

      try {
        return await deps.eventsRepository.parseWishlistText(accessToken, eventId, text);
      } catch (error) {
        return handleProtectedError(error, WISHLIST_PARSE_FAILED_MESSAGE);
      }
    },
    [deps.eventsRepository, handleProtectedError, requireAccessToken]
  );

  const submitWishlistIdea = useCallback(
    async (eventId: string, text: string) => {
      const accessToken = requireAccessToken();

      try {
        return await deps.eventsRepository.submitWishlistIdea(accessToken, eventId, text);
      } catch (error) {
        return handleProtectedError(error, WISHLIST_IDEA_FAILED_MESSAGE);
      }
    },
    [deps.eventsRepository, handleProtectedError, requireAccessToken]
  );

  const bookWishlistItem = useCallback(
    async (eventId: string, itemId: string) => {
      const accessToken = requireAccessToken();

      try {
        return await deps.eventsRepository.bookWishlistItem(accessToken, eventId, itemId);
      } catch (error) {
        return handleProtectedError(error, WISHLIST_BOOK_FAILED_MESSAGE);
      }
    },
    [deps.eventsRepository, handleProtectedError, requireAccessToken]
  );

  const fundWishlistItem = useCallback(
    async (eventId: string, itemId: string, amount: number) => {
      const accessToken = requireAccessToken();

      try {
        return await deps.eventsRepository.fundWishlistItem(accessToken, eventId, itemId, amount);
      } catch (error) {
        return handleProtectedError(error, WISHLIST_FUND_FAILED_MESSAGE);
      }
    },
    [deps.eventsRepository, handleProtectedError, requireAccessToken]
  );

  const getPhotos = useCallback(
    async (eventId: string) => {
      const accessToken = requireAccessToken();

      try {
        return await deps.eventsRepository.getEventPhotos(accessToken, eventId);
      } catch (error) {
        return handleProtectedError(error, PHOTOS_LOAD_FAILED_MESSAGE);
      }
    },
    [deps.eventsRepository, handleProtectedError, requireAccessToken]
  );

  const uploadPhotos = useCallback(
    async (eventId: string, photos: UploadablePhoto[]) => {
      const accessToken = requireAccessToken();

      try {
        return await deps.eventsRepository.uploadEventPhotos(accessToken, eventId, photos);
      } catch (error) {
        return handleProtectedError(error, PHOTOS_UPLOAD_FAILED_MESSAGE);
      }
    },
    [deps.eventsRepository, handleProtectedError, requireAccessToken]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      actions: {
        signIn,
        retryAuth,
        reopenMax,
        signOut,
        refreshEvents,
        startEventDraft,
        updateDraftField,
        validateDraft,
        chooseVenue,
        toggleNotifications,
        updateAbout,
        saveProfileIdentity,
        createEventForVenues,
        pollEventVenues,
        confirmBooking,
        getEventDetails,
        getEventGuests,
        getEventStats,
        getEventInviteToken,
        updateGuestAttendance,
        getWishlist,
        parseWishlistText,
        submitWishlistIdea,
        bookWishlistItem,
        fundWishlistItem,
        getPhotos,
        uploadPhotos
      }
    }),
    [
      state,
      signIn,
      retryAuth,
      reopenMax,
      signOut,
      refreshEvents,
      startEventDraft,
      updateDraftField,
      validateDraft,
      chooseVenue,
      toggleNotifications,
      updateAbout,
      saveProfileIdentity,
      createEventForVenues,
      pollEventVenues,
      confirmBooking,
      getEventDetails,
      getEventGuests,
      getEventStats,
      getEventInviteToken,
      updateGuestAttendance,
      getWishlist,
      parseWishlistText,
      submitWishlistIdea,
      bookWishlistItem,
      fundWishlistItem,
      getPhotos,
      uploadPhotos
    ]
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

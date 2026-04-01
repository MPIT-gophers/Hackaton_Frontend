import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { Linking, Platform } from 'react-native';

import {
  AppSession,
  BackendUser,
  BookedEvent,
  EventDraft,
  EventDraftErrors,
  PendingAuthSession,
  StoredAuthSession,
  UserProfile,
  Venue
} from '../domain/types';
import { createEventsRepository, EventsRepository } from '../repositories/eventsRepository';
import {
  createProfileRepository,
  defaultLocalProfile,
  defaultUserProfile,
  ProfileRepository
} from '../repositories/profileRepository';
import { createProfileService, profileService as defaultProfileService, ProfileService } from '../services/profileService';
import { authService as defaultAuthService, AuthService } from '../services/authService';
import { BackendError } from '../services/backendClient';
import { venuesRepository as defaultVenuesRepository, VenuesRepository } from '../repositories/venuesRepository';
import { getSelectedVenue } from '../utils/venueRanking';
import { validateEventDraft } from '../utils/validation';

const AUTH_SESSION_EXPIRED_MESSAGE = 'Сессия входа истекла, начните заново';
const AUTH_START_FAILED_MESSAGE = 'Не удалось начать вход. Попробуйте снова.';
const AUTH_COMPLETE_FAILED_MESSAGE = 'Не удалось завершить вход. Попробуйте снова.';
const OPEN_MAX_FAILED_MESSAGE = 'Не удалось открыть MAX автоматически';
const MOBILE_ONLY_AUTH_MESSAGE = 'Авторизация через MAX доступна в мобильной версии';
const PROFILE_UPDATE_FAILED_MESSAGE = 'Не удалось сохранить профиль. Попробуйте снова.';
const PROFILE_SESSION_EXPIRED_MESSAGE = 'Сессия истекла, войдите снова';
const POLLING_INTERVAL_MS = 1500;

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
  | { type: 'auth-success'; authSession: StoredAuthSession; profile: UserProfile }
  | { type: 'auth-error'; errorMessage: string }
  | { type: 'auth-clear' }
  | { type: 'set-draft-field'; field: keyof EventDraft; value: string }
  | { type: 'set-draft-errors'; errors: EventDraftErrors }
  | { type: 'set-selected-venue'; venueId: string | null }
  | { type: 'reset-draft' }
  | { type: 'set-profile'; profile: UserProfile }
  | { type: 'add-event'; event: BookedEvent };

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

function isUnauthorizedError(error: unknown) {
  return error instanceof BackendError && (error.status === 401 || error.status === 403);
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

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof BackendError && error.message) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
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
        profile: action.profile
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
        ...state,
        session: createAnonymousSession()
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
    startEventDraft(): void;
    updateDraftField(field: keyof EventDraft, value: string): void;
    validateDraft(): boolean;
    chooseVenue(venueId: string): void;
    toggleNotifications(): Promise<void>;
    updateAbout(about: string): Promise<void>;
    saveProfileIdentity(fullName: string, phone: string): Promise<void>;
    confirmBooking(): Promise<BookedEvent | null>;
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

  const openMaxApp = useCallback(async (pendingSession: PendingAuthSession) => {
    dispatch({ type: 'auth-waiting', pendingSession });

    try {
      await Linking.openURL(pendingSession.maxLink);
    } catch {
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
      const [authResult, profileResult, eventsResult, venuesResult] = await Promise.allSettled([
        deps.authService.restore(),
        deps.profileRepository.getLocalProfile(),
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

      const restoredAuth = authResult.status === 'fulfilled' ? authResult.value : { auth: null, pending: null };
      const localProfile = profileResult.status === 'fulfilled' ? profileResult.value : defaultLocalProfile;
      const events = eventsResult.status === 'fulfilled' ? eventsResult.value : [];
      const venues = venuesResult.status === 'fulfilled' ? venuesResult.value : [];
      const profile = deps.profileRepository.mergeProfile(restoredAuth.auth?.user ?? null, localProfile);
      const session = restoredAuth.auth
        ? createAuthenticatedSession(restoredAuth.auth)
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
    }

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, [deps, skipHydration]);

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
        const status = await deps.authService.getMaxSessionStatus(state.session.pendingSessionId!);

        if (!isActive) {
          return;
        }

        if (status === 'pending') {
          return;
        }

        if (status === 'expired') {
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

        const authSession = await deps.authService.exchangeMaxSession(state.session.pendingSessionId!);

        if (!isActive) {
          return;
        }

        dispatch({
          type: 'auth-success',
          authSession,
          profile: deps.profileRepository.mergeProfile(authSession.user, localProfileSnapshot)
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        if (isExpiredAuthError(error)) {
          await deps.authService.clearPendingSession();
          dispatch({
            type: 'auth-error',
            errorMessage: AUTH_SESSION_EXPIRED_MESSAGE
          });
          return;
        }

        if (isAlreadyExchangedError(error)) {
          await deps.authService.clearPendingSession();
          const restoredAuth = await deps.authService.restore();

          if (restoredAuth.auth && isActive) {
            dispatch({
              type: 'auth-success',
              authSession: restoredAuth.auth,
              profile: deps.profileRepository.mergeProfile(restoredAuth.auth.user, localProfileSnapshot)
            });
            return;
          }
        }

        await deps.authService.clearPendingSession();
        dispatch({
          type: 'auth-error',
          errorMessage: getErrorMessage(error, AUTH_COMPLETE_FAILED_MESSAGE)
        });
      } finally {
        isRequestInFlight = false;
      }
    };

    void pollSession();
    const intervalId = setInterval(() => {
      void pollSession();
    }, POLLING_INTERVAL_MS);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [deps.authService, deps.profileRepository, localProfileSnapshot, state.session.pendingSessionId, state.session.status]);

  const signIn = useCallback(async () => {
    if (Platform.OS === 'web') {
      dispatch({ type: 'auth-error', errorMessage: MOBILE_ONLY_AUTH_MESSAGE });
      return;
    }

    dispatch({ type: 'auth-start' });

    try {
      const pendingSession = await deps.authService.startMaxAuth();
      await openMaxApp(pendingSession);
    } catch (error) {
      dispatch({
        type: 'auth-error',
        errorMessage: getErrorMessage(error, AUTH_START_FAILED_MESSAGE)
      });
    }
  }, [deps.authService, openMaxApp]);

  const retryAuth = useCallback(async () => {
    await deps.authService.clearPendingSession();
    dispatch({ type: 'auth-clear' });
    await signIn();
  }, [deps.authService, signIn]);

  const reopenMax = useCallback(async () => {
    const pendingSession = getPendingSessionFromState(state.session);

    if (!pendingSession) {
      return;
    }

    await openMaxApp(pendingSession);
  }, [openMaxApp, state.session]);

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
      if (!state.session.accessToken) {
        throw new Error(PROFILE_SESSION_EXPIRED_MESSAGE);
      }

      try {
        const backendUser = await deps.profileService.updateMe(state.session.accessToken, {
          fullName: fullName.trim(),
          phone: phone.trim() ? phone.trim() : null
        });

        dispatch({
          type: 'set-profile',
          profile: deps.profileRepository.mergeProfile(backendUser, localProfileSnapshot)
        });
      } catch (error) {
        if (isUnauthorizedError(error)) {
          await deps.authService.clearAuthSession();
          dispatch({ type: 'auth-clear' });
          throw new Error(PROFILE_SESSION_EXPIRED_MESSAGE);
        }

        throw new Error(getErrorMessage(error, PROFILE_UPDATE_FAILED_MESSAGE));
      }
    },
    [deps.authService, deps.profileRepository, deps.profileService, localProfileSnapshot, state.session.accessToken]
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
        retryAuth,
        reopenMax,
        startEventDraft,
        updateDraftField,
        validateDraft,
        chooseVenue,
        toggleNotifications,
        updateAbout,
        saveProfileIdentity,
        confirmBooking
      }
    }),
    [
      chooseVenue,
      confirmBooking,
      reopenMax,
      retryAuth,
      saveProfileIdentity,
      signIn,
      startEventDraft,
      state,
      toggleNotifications,
      updateAbout,
      updateDraftField,
      validateDraft
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

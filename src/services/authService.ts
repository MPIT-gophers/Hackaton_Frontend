import { PendingAuthSession, StoredAuthSession } from '../domain/types';
import { createAuthRepository, AuthRepository } from '../repositories/authRepository';
import { request } from './backendClient';

type StartAuthResponse = {
  data: {
    session_id: string;
    max_link: string;
    expires_at: string;
  };
};

type SessionStatusResponse = {
  data: {
    session_id: string;
    status: 'pending' | 'completed' | 'expired';
    expires_at: string;
    completed_at?: string;
  };
};

type ExchangeResponse = {
  data: {
    access_token: string;
    token_type: 'Bearer';
    expires_at: string;
    user: {
      id: string;
      full_name: string;
      phone: string | null;
      created_at: string;
      updated_at: string;
    };
  };
};

export type AuthService = {
  restore(): Promise<{
    auth: StoredAuthSession | null;
    pending: PendingAuthSession | null;
  }>;
  startMaxAuth(): Promise<PendingAuthSession>;
  getMaxSessionStatus(sessionId: string): Promise<'pending' | 'completed' | 'expired'>;
  exchangeMaxSession(sessionId: string): Promise<StoredAuthSession>;
  clearPendingSession(): Promise<void>;
  clearAuthSession(): Promise<void>;
};

type AuthServiceDependencies = {
  authRepository: AuthRepository;
};

function mapPendingSession(response: StartAuthResponse): PendingAuthSession {
  return {
    sessionId: response.data.session_id,
    maxLink: response.data.max_link,
    expiresAt: response.data.expires_at
  };
}

function mapStoredAuthSession(response: ExchangeResponse): StoredAuthSession {
  return {
    tokens: {
      accessToken: response.data.access_token,
      tokenType: response.data.token_type,
      expiresAt: response.data.expires_at
    },
    user: {
      id: response.data.user.id,
      fullName: response.data.user.full_name,
      phone: response.data.user.phone,
      createdAt: response.data.user.created_at,
      updatedAt: response.data.user.updated_at
    }
  };
}

function hasExpired(expiresAt: string) {
  const timestamp = Date.parse(expiresAt);

  if (Number.isNaN(timestamp)) {
    return true;
  }

  return timestamp <= Date.now();
}

export function createAuthService({ authRepository }: AuthServiceDependencies): AuthService {
  return {
    async restore() {
      const [auth, pending] = await Promise.all([authRepository.getAuthSession(), authRepository.getPendingSession()]);

      const nextAuth = auth && !hasExpired(auth.tokens.expiresAt) ? auth : null;
      const nextPending = pending && !hasExpired(pending.expiresAt) ? pending : null;

      if (auth && !nextAuth) {
        await authRepository.clearAuthSession();
      }

      if (pending && !nextPending) {
        await authRepository.clearPendingSession();
      }

      return {
        auth: nextAuth,
        pending: nextPending
      };
    },

    async startMaxAuth() {
      const response = await request<StartAuthResponse>('/auth/max/start', { method: 'POST' });
      const pendingSession = mapPendingSession(response);

      await authRepository.savePendingSession(pendingSession);

      return pendingSession;
    },

    async getMaxSessionStatus(sessionId) {
      const response = await request<SessionStatusResponse>(`/auth/max/session/${sessionId}`);
      return response.data.status;
    },

    async exchangeMaxSession(sessionId) {
      const response = await request<ExchangeResponse>('/auth/max/exchange', {
        method: 'POST',
        body: {
          session_id: sessionId
        }
      });

      const authSession = mapStoredAuthSession(response);

      await authRepository.saveAuthSession(authSession);
      await authRepository.clearPendingSession();

      return authSession;
    },

    clearPendingSession() {
      return authRepository.clearPendingSession();
    },

    clearAuthSession() {
      return authRepository.clearAuthSession();
    }
  };
}

export const authService = createAuthService({
  authRepository: createAuthRepository()
});

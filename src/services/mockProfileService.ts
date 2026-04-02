import { BackendUser } from '../domain/types';
import { ProfileService, UpdateMePayload } from './profileService';

const MOCK_USER_ID = 'mock-profile-user';
const MOCK_CREATED_AT = '2026-04-01T09:00:00.000Z';

function normalizeFullName(fullName: string) {
  const trimmedValue = fullName.trim();
  return trimmedValue || 'Пользователь MAX';
}

export function createMockProfileService(): ProfileService {
  return {
    async updateMe(_accessToken: string, payload: UpdateMePayload): Promise<BackendUser> {
      const updatedAt = new Date().toISOString();

      return {
        id: MOCK_USER_ID,
        fullName: normalizeFullName(payload.fullName),
        phone: payload.phone?.trim() || null,
        createdAt: MOCK_CREATED_AT,
        updatedAt
      };
    }
  };
}

export const mockProfileService = createMockProfileService();

import { BackendUser } from '../domain/types';
import { request } from './backendClient';

type UpdateMeResponse = {
  data: {
    id: string;
    full_name: string;
    phone: string | null;
    created_at: string;
    updated_at: string;
  };
};

export type UpdateMePayload = {
  fullName: string;
  phone: string | null;
};

export type ProfileService = {
  updateMe(accessToken: string, payload: UpdateMePayload): Promise<BackendUser>;
};

function mapBackendUser(response: UpdateMeResponse): BackendUser {
  return {
    id: response.data.id,
    fullName: response.data.full_name,
    phone: response.data.phone,
    createdAt: response.data.created_at,
    updatedAt: response.data.updated_at
  };
}

export function createProfileService(): ProfileService {
  return {
    async updateMe(accessToken, payload) {
      const response = await request<UpdateMeResponse>('/me', {
        method: 'PATCH',
        accessToken,
        body: {
          full_name: payload.fullName,
          phone: payload.phone
        }
      });

      return mapBackendUser(response);
    }
  };
}

export const profileService = createProfileService();

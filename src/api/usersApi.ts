import api from './axiosInstance';

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  photoURL: string | null;
  latitude: number | null;
  longitude: number | null;
  city?: string | null;
  createdAt: string;
}

/**
 * GET /api/users/me — returns own profile including private location data
 */
export const getMyProfile = async (): Promise<UserProfile> => {
  const response = await api.get<UserProfile>('/users/me');
  return response.data;
};

/**
 * GET /api/users/:id — returns public profile of any user
 */
export const getUserProfileById = async (userId: string): Promise<UserProfile> => {
  const response = await api.get<UserProfile>(`/users/${userId}`);
  return response.data;
};

/**
 * PATCH /api/users/me/location — save coordinates
 */
export const setLocation = async (latitude: number, longitude: number): Promise<UserProfile> => {
  const response = await api.patch<UserProfile>('/users/me/location', { latitude, longitude });
  return response.data;
};

/**
 * DELETE /api/users/me/location — clear coordinates
 */
export const clearLocation = async (): Promise<UserProfile> => {
  const response = await api.delete<UserProfile>('/users/me/location');
  return response.data;
};


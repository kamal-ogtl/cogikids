import apiClient from './client';
import type { Player } from '../../store/usePlayerStore';

interface RegisterPayload {
  name: string;
  ageGroup: 'explorer' | 'strategist';
  nativeLanguage: string;
  password: string;
}

interface AuthResponse {
  token: string;
  player: Player;
}

export const registerKid = (payload: RegisterPayload) =>
  apiClient.post<AuthResponse>('/kids/auth/register', payload, '');

export const loginKid = (kidId: string, password: string) =>
  apiClient.post<AuthResponse>('/kids/auth/login', { kidId, password }, '');

export const getMe = (token: string) =>
  apiClient.get<{ player: Player }>('/kids/auth/me', token);

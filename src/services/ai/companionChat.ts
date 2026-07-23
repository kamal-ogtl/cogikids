import apiClient from '../api/client';

export interface CompanionMessage {
  role: 'user' | 'companion';
  text: string;
}

// TODO: endpoint /kids/ai/companion-response
export const getCompanionResponse = (
  params: {
    playerName: string;
    nativeLanguage: string;
    history: CompanionMessage[];
    userMessage: string;
  },
  token: string,
) =>
  apiClient.post<{ response: string; emotion: 'happy' | 'thinking' | 'celebrating' | 'encouraging' }>(
    '/kids/ai/companion-response',
    params,
    token,
  );

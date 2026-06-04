/**
 * Companion chat — sends the conversation history and the child's latest message
 * to the AI companion endpoint and returns a reply plus an emotion cue that drives
 * the BeeOwl's expression (happy, thinking, celebrating, encouraging).
 */
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

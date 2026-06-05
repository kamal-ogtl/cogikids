/**
 * Hint engine — requests an AI-generated hint for a question, returned in both
 * English and the child's native language so a stuck learner gets help in the
 * language they understand best.
 */
import apiClient from '../api/client';

// TODO: endpoint /kids/ai/generate-hint
export const getHint = (
  params: { question: string; nativeLanguage: string },
  token: string,
) =>
  apiClient.post<{ hint: string; nativeHint: string }>(
    '/kids/ai/generate-hint',
    params,
    token,
  );

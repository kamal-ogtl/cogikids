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

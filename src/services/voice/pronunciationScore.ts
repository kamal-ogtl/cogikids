import apiClient from '../api/client';

export interface PronunciationScore {
  overall: number;    // 0–100
  clarity: number;
  accuracy: number;
  feedback: string;
  nativeFeedback: string;
}

// TODO: endpoint /kids/ai/score-pronunciation
// Sends the audio file URI to Flask, which calls Gemini multimodal scoring
export const scorePronunciation = (
  params: { audioUri: string; targetWord: string; nativeLanguage: string },
  token: string,
) =>
  apiClient.post<PronunciationScore>(
    '/kids/ai/score-pronunciation',
    params,
    token,
  );

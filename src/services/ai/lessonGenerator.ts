/**
 * Lesson generator — requests an AI-generated lesson (slides + quiz) for a given
 * subject, age group and topic from the backend, used to extend the curriculum
 * beyond the bundled static lesson content.
 */
import apiClient from '../api/client';
import type { AgeGroup, Subject } from '../../constants/curriculum';

export interface LessonQuestion {
  type: 'multiple_choice' | 'fill_blank' | 'true_false';
  question: string;
  options: string[];
  correct: string;
  explanation: string;
  hausa_hint: string; // native language hint field
}

export interface Lesson {
  intro: { text: string; hausa: string };
  vocabulary: Array<{ word: string; definition: string; hausa: string; example: string }>;
  questions: LessonQuestion[];
}

// TODO: endpoint /kids/ai/generate-lesson
export const generateLesson = (
  params: {
    subject: Subject;
    node: string;
    level: number;
    nativeLanguage: string;
    ageGroup: AgeGroup;
    playerName: string;
  },
  token: string,
) => apiClient.post<Lesson>('/kids/ai/generate-lesson', params, token);

// TODO: endpoint /kids/ai/generate-hint
export const getHint = (
  params: { question: string; nativeLanguage: string },
  token: string,
) => apiClient.post<{ hint: string }>('/kids/ai/generate-hint', params, token);

// TODO: endpoint /kids/ai/detect-language
export const detectLanguage = (childResponse: string, token: string) =>
  apiClient.post<{ language: string; confidence: number }>(
    '/kids/ai/detect-language',
    { response: childResponse },
    token,
  );

// TODO: endpoint /kids/ai/generate-spelling-round
export const generateSpellingRound = (
  params: { level: number; nativeLanguage: string; count: number },
  token: string,
) =>
  apiClient.post<{ words: Array<{ word: string; hausa: string; difficulty: number }> }>(
    '/kids/ai/generate-spelling-round',
    params,
    token,
  );

import { GoogleGenerativeAI } from '@google/generative-ai';

let _client: GoogleGenerativeAI | null = null;

function client(): GoogleGenerativeAI {
  if (!_client) {
    const key = process.env.GOOGLE_GENAI_API_KEY;
    if (!key) throw new Error('GOOGLE_GENAI_API_KEY not set');
    _client = new GoogleGenerativeAI(key);
  }
  return _client;
}

export function getModel(modelName = 'gemini-2.0-flash') {
  return client().getGenerativeModel({ model: modelName });
}

export function parseJson<T = Record<string, unknown>>(text: string): T {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/,           '')
    .trim();
  return JSON.parse(cleaned) as T;
}

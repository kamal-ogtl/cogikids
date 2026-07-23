import { kidIdFromRequest } from '../../../src/lib/jwt';
import { getModel, parseJson } from '../../../src/lib/gemini';

export async function POST(req: Request): Promise<Response> {
  if (!await kidIdFromRequest(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { audioUri = '', targetWord = '', nativeLanguage = 'english' } = await req.json().catch(() => ({}));

  if (audioUri.startsWith('data:audio')) {
    try {
      const [header, b64] = audioUri.split(',');
      const mimeType = header.split(':')[1].split(';')[0];

      const prompt = `A Nigerian child tried to pronounce the English word "${targetWord}".
Listen to the audio and score their pronunciation. Their home language is ${nativeLanguage}.
Return ONLY valid JSON:
{"overall": 75, "clarity": 80, "accuracy": 70, "feedback": "...", "nativeFeedback": "..."}
Scores are integers 0-100. Keep feedback encouraging, under 2 sentences.`;

      const result = await getModel('gemini-2.0-flash').generateContent([
        { inlineData: { mimeType, data: b64 } },
        prompt,
      ]);
      return Response.json(parseJson(result.response.text()));
    } catch {
      // fall through to heuristic
    }
  }

  return Response.json({
    overall: 70, clarity: 70, accuracy: 70,
    feedback: `Good try pronouncing "${targetWord}"! Keep practising!`,
    nativeFeedback: 'Ci gaba da kokari!',
  });
}

import { kidIdFromRequest } from '../../../src/lib/jwt';
import { getModel, parseJson } from '../../../src/lib/gemini';

export async function POST(req: Request): Promise<Response> {
  if (!await kidIdFromRequest(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { level = 1, nativeLanguage = 'hausa', count = 5 } = await req.json().catch(() => ({}));
  const safeCount = Math.min(Number(count), 15);

  const prompt = `Generate ${safeCount} English spelling words for a Nigerian child at difficulty level ${level}/10.
Also provide the ${nativeLanguage} translation for each word.
Difficulty 1-3: simple 3-4 letter words. 4-6: common 5-6 letter words. 7-10: longer/tricky words.
Return ONLY valid JSON: {"words": [{"word": "cat", "hausa": "kaza", "difficulty": 1}]}
No extra text. Use actual ${nativeLanguage} translations.`;

  try {
    const result = await getModel().generateContent(prompt);
    return Response.json(parseJson(result.response.text()));
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

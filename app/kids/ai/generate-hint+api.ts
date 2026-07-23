import { kidIdFromRequest } from '../../../src/lib/jwt';
import { getModel, parseJson } from '../../../src/lib/gemini';

export async function POST(req: Request): Promise<Response> {
  if (!await kidIdFromRequest(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { question = '', nativeLanguage = 'english' } = await req.json().catch(() => ({}));

  const prompt = `You are CogiOwl, a gentle AI tutor for Nigerian children.
Give a short, encouraging hint (max 2 sentences) for this question: "${question}"
Also write the hint in ${nativeLanguage}.
Return ONLY valid JSON: {"hint": "...", "nativeHint": "..."}
No extra text.`;

  try {
    const result = await getModel().generateContent(prompt);
    return Response.json(parseJson(result.response.text()));
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

import { kidIdFromRequest } from '../../../src/lib/jwt';
import { getModel, parseJson } from '../../../src/lib/gemini';

export async function POST(req: Request): Promise<Response> {
  if (!await kidIdFromRequest(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { response: text = '' } = await req.json().catch(() => ({}));

  const prompt = `Detect the primary language of this text written by a Nigerian child: "${text}"
Possible languages: hausa, yoruba, igbo, english.
Return ONLY valid JSON: {"language": "...", "confidence": 0.0}
Confidence is a float 0-1. No extra text.`;

  try {
    const result = await getModel().generateContent(prompt);
    return Response.json(parseJson(result.response.text()));
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

import { kidIdFromRequest } from '../../../src/lib/jwt';
import { getModel, parseJson } from '../../../src/lib/gemini';

export async function POST(req: Request): Promise<Response> {
  if (!await kidIdFromRequest(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { playerName = 'friend', nativeLanguage = 'english',
          history = [], userMessage = '' } = await req.json().catch(() => ({}));

  const historyText = (history as Array<{ role: string; text: string }>)
    .slice(-6)
    .map(m => `${m.role === 'user' ? 'Child' : 'CogiOwl'}: ${m.text}`)
    .join('\n');

  const prompt = `You are CogiOwl, a friendly owl companion for a Nigerian child named ${playerName}.
Their home language is ${nativeLanguage}. Be warm, playful, and encouraging.
Keep responses SHORT (1-3 sentences). Occasionally mix in a word from ${nativeLanguage}.

Conversation so far:
${historyText}
Child: ${userMessage}

Reply as CogiOwl and pick ONE emotion that fits your response.
Return ONLY valid JSON: {"response": "...", "emotion": "happy"|"thinking"|"celebrating"|"encouraging"}`;

  try {
    const result = await getModel().generateContent(prompt);
    return Response.json(parseJson(result.response.text()));
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

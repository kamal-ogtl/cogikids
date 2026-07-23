import { kidIdFromRequest } from '../../../src/lib/jwt';
import { getModel, parseJson } from '../../../src/lib/gemini';

export async function POST(req: Request): Promise<Response> {
  if (!await kidIdFromRequest(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { subject = 'english', node = '', level = 1, nativeLanguage = 'english',
          ageGroup = 'explorer', playerName = 'friend' } = await req.json().catch(() => ({}));

  const ageRange = ageGroup === 'explorer' ? 'ages 5-9' : 'ages 10-15';

  const prompt = `You are CogiOwl, a fun AI tutor for Nigerian children.
Create a lesson for a ${ageGroup} (${ageRange}) Nigerian child named ${playerName}.
Subject: ${subject}. Topic: ${node}. Difficulty level: ${level}/10.
The child's home language is ${nativeLanguage} — include hints/translations in that language.

Return ONLY valid JSON in this exact shape:
{
  "intro": {"text": "...", "hausa": "..."},
  "vocabulary": [{"word": "...", "definition": "...", "hausa": "...", "example": "..."}],
  "questions": [
    {"type": "multiple_choice", "question": "...", "options": ["A","B","C","D"],
     "correct": "A", "explanation": "...", "hausa_hint": "..."}
  ]
}
Include exactly 5 questions mixing multiple_choice, fill_blank, and true_false types.
Keep language simple, fun, and encouraging. No extra text outside the JSON.`;

  try {
    const result = await getModel().generateContent(prompt);
    return Response.json(parseJson(result.response.text()));
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

import bcrypt from 'bcryptjs';
import { db } from '../../../src/db/client';
import { kidPlayers } from '../../../src/db/schema';
import { signToken } from '../../../src/lib/jwt';
import { playerToDict } from '../../../src/lib/playerUtils';

export async function POST(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const { name, ageGroup, nativeLanguage, password } = body as Record<string, string>;

  if (!name?.trim())
    return Response.json({ error: 'name is required' }, { status: 400 });
  if (!['explorer', 'strategist'].includes(ageGroup))
    return Response.json({ error: 'ageGroup must be explorer or strategist' }, { status: 400 });
  if (!password || password.length < 4)
    return Response.json({ error: 'password must be at least 4 characters' }, { status: 400 });

  const passwordHash = await bcrypt.hash(password, 10);

  const [player] = await db
    .insert(kidPlayers)
    .values({ name: name.trim(), ageGroup, nativeLanguage: nativeLanguage ?? 'hausa', passwordHash })
    .returning();

  const token = await signToken(player.id);
  return Response.json({ token, player: playerToDict(player) }, { status: 201 });
}

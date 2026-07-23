import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../../../src/db/client';
import { kidPlayers } from '../../../src/db/schema';
import { signToken } from '../../../src/lib/jwt';
import { playerToDict } from '../../../src/lib/playerUtils';

export async function POST(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const { kidId, password } = body as { kidId: string; password: string };

  if (!kidId) return Response.json({ error: 'kidId is required' }, { status: 400 });

  const [player] = await db
    .select()
    .from(kidPlayers)
    .where(eq(kidPlayers.id, parseInt(kidId, 10)));

  if (!player || !(await bcrypt.compare(password, player.passwordHash)))
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });

  const token = await signToken(player.id);
  return Response.json({ token, player: playerToDict(player) });
}

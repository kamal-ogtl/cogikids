import { eq } from 'drizzle-orm';
import { db } from '../../../src/db/client';
import { kidPlayers } from '../../../src/db/schema';
import { kidIdFromRequest } from '../../../src/lib/jwt';
import { playerToDict } from '../../../src/lib/playerUtils';

export async function GET(req: Request): Promise<Response> {
  const kidId = await kidIdFromRequest(req);
  if (!kidId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const [player] = await db.select().from(kidPlayers).where(eq(kidPlayers.id, kidId));
  if (!player) return Response.json({ error: 'Player not found' }, { status: 404 });

  return Response.json({ player: playerToDict(player) });
}

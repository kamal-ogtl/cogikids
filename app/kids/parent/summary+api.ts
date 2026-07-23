import { eq } from 'drizzle-orm';
import { db } from '../../../src/db/client';
import { kidPlayers, kidNodeProgress } from '../../../src/db/schema';
import { kidIdFromRequest } from '../../../src/lib/jwt';
import { playerToDict } from '../../../src/lib/playerUtils';

export async function GET(req: Request): Promise<Response> {
  const kidId = await kidIdFromRequest(req);
  if (!kidId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const [player] = await db.select().from(kidPlayers).where(eq(kidPlayers.id, kidId));
  if (!player) return Response.json({ error: 'Player not found' }, { status: 404 });

  const nodes     = await db.select().from(kidNodeProgress).where(eq(kidNodeProgress.kidId, kidId));
  const completed = nodes.filter(n => n.completed).length;
  const stars     = nodes.reduce((sum, n) => sum + n.stars, 0);

  return Response.json({
    kids: [{
      ...playerToDict(player),
      nodesCompleted: completed,
      nodesTotal:     nodes.length,
      starsEarned:    stars,
    }],
  });
}

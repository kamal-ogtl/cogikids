import { eq, and } from 'drizzle-orm';
import { db } from '../../src/db/client';
import { kidPlayers, kidNodeProgress } from '../../src/db/schema';
import { kidIdFromRequest } from '../../src/lib/jwt';
import { playerToDict } from '../../src/lib/playerUtils';
import { queueCogiReward } from '../../src/lib/cogiRewards';

const XP_PER_LEVEL = 500;

// GET /kids/progress — return player + all node progress
export async function GET(req: Request): Promise<Response> {
  const kidId = await kidIdFromRequest(req);
  if (!kidId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const [player] = await db.select().from(kidPlayers).where(eq(kidPlayers.id, kidId));
  if (!player) return Response.json({ error: 'Player not found' }, { status: 404 });

  const nodes = await db.select().from(kidNodeProgress).where(eq(kidNodeProgress.kidId, kidId));
  return Response.json({ player: playerToDict(player), nodes: nodes.map(nodeToDict) });
}

// POST /kids/progress — batch upsert nodes + XP delta
export async function POST(req: Request): Promise<Response> {
  const kidId = await kidIdFromRequest(req);
  if (!kidId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const [player] = await db.select().from(kidPlayers).where(eq(kidPlayers.id, kidId));
  if (!player) return Response.json({ error: 'Player not found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const nodesPayload: Array<Record<string, unknown>> = body.nodes ?? [];
  const xpDelta     = Number(body.xpDelta    ?? 0);
  const starsDelta  = Number(body.starsDelta  ?? 0);

  for (const item of nodesPayload) {
    const nodeId = item.nodeId as string;
    if (!nodeId) continue;

    const [existing] = await db
      .select()
      .from(kidNodeProgress)
      .where(and(eq(kidNodeProgress.kidId, kidId), eq(kidNodeProgress.nodeId, nodeId)));

    if (existing) {
      await db
        .update(kidNodeProgress)
        .set({
          unlocked:     (item.unlocked as boolean)  ?? existing.unlocked,
          completed:    (item.completed as boolean)  ?? existing.completed,
          stars:        Math.max(Number(item.stars   ?? 0), existing.stars),
          highScore:    Math.max(Number(item.highScore ?? 0), existing.highScore),
          lastPlayedAt: item.lastPlayedAt ? new Date(item.lastPlayedAt as string) : existing.lastPlayedAt,
          updatedAt:    new Date(),
        })
        .where(and(eq(kidNodeProgress.kidId, kidId), eq(kidNodeProgress.nodeId, nodeId)));
    } else {
      await db.insert(kidNodeProgress).values({
        kidId,
        nodeId,
        unlocked:     (item.unlocked as boolean)  ?? true,
        completed:    (item.completed as boolean)  ?? false,
        stars:        Number(item.stars    ?? 0),
        highScore:    Number(item.highScore ?? 0),
        lastPlayedAt: item.lastPlayedAt ? new Date(item.lastPlayedAt as string) : null,
      });
    }
  }

  const newXP    = player.xp + (xpDelta > 0 ? xpDelta : 0);
  const newLevel = 1 + Math.floor(newXP / XP_PER_LEVEL);
  const newStars = player.totalStars + (starsDelta > 0 ? starsDelta : 0);
  const today    = new Date().toISOString().split('T')[0];
  const lastDate = player.lastActiveDate;
  const streak   = calcStreak(lastDate, player.streakDays, today);

  const [updated] = await db
    .update(kidPlayers)
    .set({ xp: newXP, level: newLevel, totalStars: newStars, streakDays: streak, lastActiveDate: today })
    .where(eq(kidPlayers.id, kidId))
    .returning();

  // Queue COGI rewards for milestones (fire-and-forget, never block the response)
  const rewardPromises: Promise<void>[] = [];
  if (newLevel > player.level) {
    rewardPromises.push(queueCogiReward(kidId, 'level_up'));
  }
  if (streak === 7 && player.streakDays < 7) {
    rewardPromises.push(queueCogiReward(kidId, 'streak_7'));
  }
  const newlyCompleted = nodesPayload.filter(n => n.completed && n.nodeId);
  for (const _ of newlyCompleted) {
    rewardPromises.push(queueCogiReward(kidId, 'node_complete'));
  }
  await Promise.allSettled(rewardPromises);

  const updatedNodes = await db.select().from(kidNodeProgress).where(eq(kidNodeProgress.kidId, kidId));
  return Response.json({ player: playerToDict(updated), nodes: updatedNodes.map(nodeToDict) });
}

function calcStreak(lastDate: string | null, current: number, today: string): number {
  if (!lastDate) return 1;
  if (lastDate === today) return current;
  const diff = (new Date(today).getTime() - new Date(lastDate).getTime()) / 86_400_000;
  return diff === 1 ? current + 1 : 1;
}

function nodeToDict(n: typeof kidNodeProgress.$inferSelect) {
  return {
    nodeId:       n.nodeId,
    unlocked:     n.unlocked,
    completed:    n.completed,
    stars:        n.stars,
    highScore:    n.highScore,
    lastPlayedAt: n.lastPlayedAt?.toISOString() ?? null,
  };
}

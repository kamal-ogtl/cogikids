import { eq, desc } from 'drizzle-orm';
import { db } from '../../../src/db/client';
import { cogiMintQueue, cogiLedger } from '../../../src/db/schema';
import { kidIdFromRequest } from '../../../src/lib/jwt';

// GET /kids/cardano/history — mint history + ledger summary
export async function GET(req: Request): Promise<Response> {
  const kidId = await kidIdFromRequest(req);
  if (!kidId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const [history, [ledger]] = await Promise.all([
    db
      .select()
      .from(cogiMintQueue)
      .where(eq(cogiMintQueue.kidId, kidId))
      .orderBy(desc(cogiMintQueue.createdAt))
      .limit(50),
    db.select().from(cogiLedger).where(eq(cogiLedger.kidId, kidId)),
  ]);

  return Response.json({
    ledger: ledger
      ? {
          totalEarned: ledger.totalEarned,
          totalMinted: ledger.totalMinted,
          pendingMint: ledger.pendingMint,
        }
      : { totalEarned: 0, totalMinted: 0, pendingMint: 0 },
    history: history.map(h => ({
      id:        h.id,
      amount:    h.amount,
      reason:    h.reason,
      status:    h.status,
      txHash:    h.txHash,
      createdAt: h.createdAt?.toISOString(),
    })),
  });
}

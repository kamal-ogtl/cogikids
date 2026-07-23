import { eq, and } from 'drizzle-orm';
import { db } from '../../../src/db/client';
import { parentWallets, cogiLedger, cogiMintQueue } from '../../../src/db/schema';
import { kidIdFromRequest } from '../../../src/lib/jwt';
import { mintCogiTokens } from '../../../src/lib/cardanoMint';

// POST /kids/cardano/mint — process pending COGI mints for this kid
export async function POST(req: Request): Promise<Response> {
  const kidId = await kidIdFromRequest(req);
  if (!kidId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const [wallet] = await db.select().from(parentWallets).where(eq(parentWallets.kidId, kidId));
  if (!wallet) {
    return Response.json(
      { error: 'No parent wallet registered — POST /kids/cardano/wallet first' },
      { status: 400 },
    );
  }

  const pending = await db
    .select()
    .from(cogiMintQueue)
    .where(and(eq(cogiMintQueue.kidId, kidId), eq(cogiMintQueue.status, 'pending')));

  if (!pending.length) {
    return Response.json({ minted: 0, message: 'No pending rewards to mint' });
  }

  const totalAmount = pending.reduce((sum, q) => sum + q.amount, 0);
  const ids = pending.map(q => q.id);

  let txHash: string;
  try {
    txHash = await mintCogiTokens(wallet.walletAddress, totalAmount);
  } catch (err) {
    return Response.json(
      { error: `Mint failed: ${(err as Error).message}` },
      { status: 500 },
    );
  }

  // Mark all processed queue items as submitted
  for (const id of ids) {
    await db
      .update(cogiMintQueue)
      .set({ status: 'submitted', txHash, updatedAt: new Date() })
      .where(eq(cogiMintQueue.id, id));
  }

  // Update ledger
  const [ledger] = await db.select().from(cogiLedger).where(eq(cogiLedger.kidId, kidId));
  if (ledger) {
    await db
      .update(cogiLedger)
      .set({
        totalMinted: ledger.totalMinted + totalAmount,
        pendingMint: Math.max(0, ledger.pendingMint - totalAmount),
        updatedAt:   new Date(),
      })
      .where(eq(cogiLedger.kidId, kidId));
  }

  return Response.json({ minted: totalAmount, txHash, address: wallet.walletAddress });
}

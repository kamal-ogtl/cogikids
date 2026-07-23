import { eq, and } from 'drizzle-orm';
import { db } from '../db/client';
import { cogiLedger, cogiMintQueue } from '../db/schema';

export const COGI_AMOUNTS = {
  level_up:      50,
  streak_7:      25,
  node_complete: 10,
} as const;

export type CogiReason = keyof typeof COGI_AMOUNTS;

export async function queueCogiReward(kidId: number, reason: CogiReason): Promise<void> {
  const amount = COGI_AMOUNTS[reason];

  await db.insert(cogiMintQueue).values({ kidId, amount, reason, status: 'pending' });

  const [existing] = await db.select().from(cogiLedger).where(eq(cogiLedger.kidId, kidId));
  if (existing) {
    await db
      .update(cogiLedger)
      .set({
        totalEarned: existing.totalEarned + amount,
        pendingMint: existing.pendingMint + amount,
        updatedAt:   new Date(),
      })
      .where(eq(cogiLedger.kidId, kidId));
  } else {
    await db.insert(cogiLedger).values({
      kidId,
      totalEarned: amount,
      totalMinted: 0,
      pendingMint: amount,
    });
  }
}

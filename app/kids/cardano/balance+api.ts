import { eq } from 'drizzle-orm';
import { db } from '../../../src/db/client';
import { parentWallets, cogiLedger } from '../../../src/db/schema';
import { kidIdFromRequest } from '../../../src/lib/jwt';
import { getAddressDetails } from '../../../src/lib/blockfrost';

const COGI_POLICY_ID = process.env.COGI_POLICY_ID ?? '';

// GET /kids/cardano/balance — on-chain COGI balance + off-chain ledger summary
export async function GET(req: Request): Promise<Response> {
  const kidId = await kidIdFromRequest(req);
  if (!kidId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const [[wallet], [ledger]] = await Promise.all([
    db.select().from(parentWallets).where(eq(parentWallets.kidId, kidId)),
    db.select().from(cogiLedger).where(eq(cogiLedger.kidId, kidId)),
  ]);

  const offchain = {
    totalEarned: ledger?.totalEarned ?? 0,
    totalMinted: ledger?.totalMinted ?? 0,
    pendingMint: ledger?.pendingMint ?? 0,
  };

  if (!wallet) {
    return Response.json({ onchain: null, offchain, walletRegistered: false });
  }

  let onchainBalance = 0;
  try {
    const details = await getAddressDetails(wallet.walletAddress);
    const cogiEntry = (details.amount ?? []).find(
      (a: { unit: string }) => a.unit.startsWith(COGI_POLICY_ID),
    );
    onchainBalance = cogiEntry ? Number(cogiEntry.quantity) : 0;
  } catch {
    // Wallet may be empty (not yet on-chain) — treat as 0
  }

  return Response.json({
    onchain:          { cogi: onchainBalance, address: wallet.walletAddress },
    offchain,
    walletRegistered: true,
  });
}

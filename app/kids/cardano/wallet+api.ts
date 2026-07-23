import { eq } from 'drizzle-orm';
import { db } from '../../../src/db/client';
import { parentWallets } from '../../../src/db/schema';
import { kidIdFromRequest } from '../../../src/lib/jwt';

// GET /kids/cardano/wallet — fetch registered parent wallet
export async function GET(req: Request): Promise<Response> {
  const kidId = await kidIdFromRequest(req);
  if (!kidId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const [wallet] = await db.select().from(parentWallets).where(eq(parentWallets.kidId, kidId));
  if (!wallet) return Response.json({ wallet: null });

  return Response.json({
    wallet: {
      address: wallet.walletAddress,
      network: wallet.network,
      createdAt: wallet.createdAt?.toISOString(),
    },
  });
}

// POST /kids/cardano/wallet — register or update parent wallet address
export async function POST(req: Request): Promise<Response> {
  const kidId = await kidIdFromRequest(req);
  if (!kidId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { address, network = 'preprod' } = await req.json().catch(() => ({}));
  if (!address || typeof address !== 'string') {
    return Response.json({ error: 'address is required' }, { status: 400 });
  }

  // Basic bech32 sanity check (addr1... mainnet, addr_test1... preprod)
  if (!address.startsWith('addr')) {
    return Response.json({ error: 'Invalid Cardano address' }, { status: 400 });
  }

  const [existing] = await db.select().from(parentWallets).where(eq(parentWallets.kidId, kidId));

  if (existing) {
    await db
      .update(parentWallets)
      .set({ walletAddress: address, network, updatedAt: new Date() })
      .where(eq(parentWallets.kidId, kidId));
  } else {
    await db.insert(parentWallets).values({ kidId, walletAddress: address, network });
  }

  return Response.json({ success: true, address, network });
}

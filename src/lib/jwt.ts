import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-secret-change-in-prod');
const EXPIRY  = '30d';

export async function signToken(kidId: number): Promise<string> {
  return new SignJWT({ sub: `kid_${kidId}` })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const sub = payload.sub as string;
    if (!sub?.startsWith('kid_')) return null;
    return parseInt(sub.replace('kid_', ''), 10);
  } catch {
    return null;
  }
}

export async function kidIdFromRequest(req: Request): Promise<number | null> {
  const auth = req.headers.get('Authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return null;
  return verifyToken(auth.slice(7));
}

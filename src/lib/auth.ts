import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET ?? "default_jwt_secret";
const secret = new TextEncoder().encode(JWT_SECRET);

export async function generateToken(payload: object): Promise<string> {
  const token = await new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(secret);
  return token;
}

export async function verifyToken(token: string | undefined): Promise<boolean> {
  try {
    if (!token) {
      return false;
    }

    const { payload } = await jwtVerify(token, secret);
    return true;
  } catch (error) {
    return false;
  }
}

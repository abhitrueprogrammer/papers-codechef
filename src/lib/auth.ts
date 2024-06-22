import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET ?? "default_jwt_secret";
const secret = new TextEncoder().encode(JWT_SECRET);

export async function generateToken(payload: object): Promise<string> {
  const token = await new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(secret);
  console.log("Generated token:", token);
  return token;
}

export async function verifyToken(token: string | undefined): Promise<boolean> {
  try {
    if (!token) {
      console.error("Token is undefined or null");
      return false;
    }

    const { payload } = await jwtVerify(token, secret);
    console.log("Decoded token:", payload);
    return true;
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
}

import jwt, { type JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "default_jwt_secret";

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

export function verifyToken(token: string): string | JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

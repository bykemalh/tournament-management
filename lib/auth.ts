import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this'
);

export interface JWTPayload {
  userId: string;
  tcNo: string;
  [key: string]: unknown;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static async generateToken(payload: JWTPayload): Promise<string> {
    return new SignJWT(payload as Record<string, unknown>)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);
  }

  static async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (
        typeof payload.userId === 'string' &&
        typeof payload.tcNo === 'string'
      ) {
        return {
          userId: payload.userId,
          tcNo: payload.tcNo,
        };
      }
      return null;
    } catch {
      return null;
    }
  }
}

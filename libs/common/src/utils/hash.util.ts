import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';

export class HashUtil {
  static async hashPassword(plain: string, saltRounds = 12): Promise<string> {
    return bcrypt.hash(plain, saltRounds);
  }

  static async comparePassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  /** Stable SHA-256 of a JSON-stringifiable value — used to build cache keys for list queries. */
  static stableHash(value: unknown): string {
    const json = JSON.stringify(value, Object.keys(value as object).sort());
    return createHash('sha256').update(json).digest('hex').slice(0, 16);
  }
}

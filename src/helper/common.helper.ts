import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class Helper {
  static algorithm = 'aes-256-ctr';
  static secretKey = 'vOVH6sdmpNWjRRYqCc7rdxs01lwHzlr3';
  static randomBytes = randomBytes(16);

  // Encryption function
  static async encrypt(data: string) {
    const cipher = createCipheriv(
      this.algorithm,
      this.secretKey,
      this.randomBytes,
    );
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  // Decryption function
  static async decrypt(encryptedData: string) {
    const decipher = createDecipheriv(
      this.algorithm,
      this.secretKey,
      this.randomBytes,
    );
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // generate random number
  static async generateNumber(length: number = 3): Promise<string> {
    const chars = '0123456789';
    let num = '';
    for (let i = 0; i < length; i++) {
      const index = Math.floor(Math.random() * chars.length);
      num += chars[index];
    }
    return num;
  }

  static async generateRandomPassword(length = 12): Promise<string> {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars[randomIndex];
    }
    return password;
  }
}

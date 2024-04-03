import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
} from 'node:crypto';

const IV_LENGTH = 16; // For AES, this is always 16

export function encrypt(text: string, key: string): string {
  const [encryptKey, signKey] = prepareKeys(key);

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv('aes-256-cbc', encryptKey, iv);

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  encrypted = Buffer.concat([iv, encrypted]);

  const signature = hmac(encrypted, signKey);

  return Buffer.concat([signature, encrypted]).toString('base64');
}

export function decrypt(text: string, key: string): string {
  const [encryptKey, signKey] = prepareKeys(key);

  const textBuffer = Buffer.from(text, 'base64');

  const signature = textBuffer.subarray(0, 32);
  const ciphertext = textBuffer.subarray(32);

  if (Buffer.compare(hmac(ciphertext, signKey), signature)) {
    throw new Error('Signature does not match');
  }

  const iv = ciphertext.subarray(0, IV_LENGTH);
  const encryptedText = ciphertext.subarray(IV_LENGTH);
  const decipher = createDecipheriv('aes-256-cbc', encryptKey, iv);

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf-8');
}

function prepareKeys(key: string): Buffer[] {
  const hash = createHash('sha512');
  hash.update(key);
  const hashed = hash.digest();

  return [hashed.subarray(0, 32), hashed.subarray(32)];
}

function hmac(data: Buffer, key: Buffer): Buffer {
  return createHmac('sha256', key).update(data).digest();
}

export function makeSuperAppToken2(
  serviceKey: string,
  accessToken: string,
  subject: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any> = {},
): string {
  const now = Math.floor(Date.now() / 1000);
  const then = now + 3600;

  const result = encrypt(
    JSON.stringify({
      access_token: accessToken,
      iat: now,
      exp: then,
      subject,
      payload,
    }),
    serviceKey,
  );

  return result;
}

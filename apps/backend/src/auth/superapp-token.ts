import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
} from 'node:crypto';

const IV_LENGTH = 16; // For AES, this is always 16

export function encrypt(text: string, key: string): string {
  const keyBuffer = prepareKey(key);

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv('aes-256-cbc', keyBuffer, iv);

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  encrypted = Buffer.concat([iv, encrypted]);
  const signature = hmac(encrypted, keyBuffer);

  return Buffer.concat([signature, encrypted]).toString('base64');
}
export function decrypt(text:string, key: string): string {
  const keyBuffer = prepareKey(key);
  const textBuffer = Buffer.from(text, 'base64');

  const signature = textBuffer.subarray(0, 32);
  const ciphertext = textBuffer.subarray(32);

  if (Buffer.compare(hmac(ciphertext, keyBuffer), signature)) {
    throw new Error('Signature does not match');
  }

  const iv = ciphertext.subarray(0, IV_LENGTH);
  const encryptedText = ciphertext.subarray(IV_LENGTH);
  const decipher = createDecipheriv('aes-256-cbc', key, iv);

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf-8');
}

function prepareKey(key: string): Buffer {
  const hash = createHash('sha256');

  hash.update(key);

  return hash.digest();
}

function hmac(data: Buffer, key: Buffer): Buffer {
  return createHmac('sha256', key).update(data).digest();
}

export function makeSuperAppToken(serviceKey: string, accessToken: string): string {
  const now = Math.floor(Date.now() / 1000);
  const then = now + 3600;

  const result = encrypt(
    JSON.stringify({
      access_token: accessToken,
      iat: now,
      exp: then,
    }),
    serviceKey,
  );

  return result;
}

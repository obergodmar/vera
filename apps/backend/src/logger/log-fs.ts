import { createWriteStream } from 'node:fs';

/**
 * Запись будет производиться в директорию, откуда запущен бот.
 */
const filePath = `${process.cwd()}/vera.log`;

export function logFS(message: string): void {
  try {
    const stream = createWriteStream(filePath, { flags: 'a' });
    stream.write(message + '\n');
    stream.end();
  } catch (e) {
    console.error(`[LoggerService] Failed write log to file, ${e}`);
  }
}

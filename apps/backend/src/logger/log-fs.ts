import { createWriteStream } from 'node:fs';
import { homedir } from 'node:os';

const filePath = `${homedir()}/vera-log.txt`;

export function logFS(message: string): void {
  try {
    const stream = createWriteStream(filePath, { flags: 'a' });
    stream.write(message + '\n');
    stream.end();
  } catch (e) {
    console.error(`[LoggerService] Failed write log to file, ${e}`);
  }
}

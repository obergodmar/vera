import { LoggerService } from './logger.service';

interface IDebugService {
  log: (value: unknown) => void;
  debug: (value: unknown) => void;
  error: (value: unknown) => void;
}

export class DebugService implements IDebugService {
  private prefix: string;

  public constructor(
    private readonly logger: LoggerService,
    serviceName: string,
  ) {
    this.prefix = `${serviceName}:`;
  }

  public log = (value: unknown): void => {
    this.logger.log(`${this.prefix} ${value}`);
  };

  public debug = (value: unknown): void => {
    this.logger.debug(`${this.prefix} ${value}`);
  };

  public error = (value: unknown): void => {
    this.logger.error(`${this.prefix} ${value}`);
  };

  public auth = (value: unknown): void => {
    this.logger.custom('auth', `${this.prefix} ${value}`);
  };
}

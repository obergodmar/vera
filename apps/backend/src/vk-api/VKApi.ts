import { getRandomInt, sleep } from '@vera-reforged/common';
import {
  API_ERROR_AUTH,
  API_ERROR_CAPTCHA,
  API_ERROR_FLOOD,
  API_ERROR_METHOD_DISABLED,
  API_ERROR_RATE_LIMIT,
  API_ERROR_SECTION_DISABLED,
  API_ERROR_SERVER,
  API_ERROR_TOO_MANY,
  API_ERROR_UNKNOWN,
  API_ERROR_UNKNOWN_USER,
  API_ERROR_USER_DEACTIVATED,
  API_VERSION,
} from '@example/api-schema-typescript';

import { DebugService } from '../logger/debug.service';
import {
  API_DEFAULT_TIMEOUT,
  API_GROUP_FIELDS,
  API_MAX_RETRY_TIMEOUT,
  API_MIN_RETRY_TIMEOUT,
  API_USER_FIELDS,
} from './config';
import { IVKApi } from './IVKApi';

class Semaphore {
  private resources: number;
  private queue: Array<() => void> = [];

  constructor(
    capacity: number,
    private readonly window: number,
  ) {
    this.resources = capacity;
  }

  async lock(): Promise<void> {
    if (this.resources > 0) {
      this.resources--;
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    setTimeout(() => {
      const nextJob = this.queue.shift();
      if (nextJob) {
        return nextJob();
      }
      this.resources++;
    }, this.window);
  }
}

type RateLimitConfig = {
  rateLimit: number;
  rateLimitWindow: number;
};

export class VKApi implements IVKApi.IVKApi {
  private readonly semaphore: Semaphore;
  private readonly rateLimitWindow: number;

  private readonly abortTrackers: Map<IVKApi.TrackId<any>, () => void> =
    new Map();

  constructor(
    private readonly logger: DebugService,
    private readonly request: (
      url: string,
      params: Record<string, any>,
      abortSignal?: AbortSignal,
    ) => Promise<any>,
    private readonly accessToken: string,
    { rateLimit, rateLimitWindow }: RateLimitConfig,
  ) {
    this.semaphore = new Semaphore(rateLimit, rateLimitWindow);
    this.rateLimitWindow = rateLimitWindow;
  }

  public async fetch<
    Method extends keyof IVKApi.Request,
    TrackIdMethod extends Method = Method,
  >(
    method: Method,
    params: IVKApi.Request[Method]['params'],
    opts: IVKApi.Options<TrackIdMethod> = {},
  ): Promise<IVKApi.Request[Method]['response']> {
    const retries = opts.retries || 0;
    let takenAttempts = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const res = await this.doFetch(
          method,
          params,
          opts.timeout || API_DEFAULT_TIMEOUT,
          opts.trackId,
        );
        return res;
      } catch (err: unknown) {
        if (err instanceof IVKApi.AbortError) {
          throw err;
        }

        takenAttempts++;

        let requestErrors: IVKApi.RequestError[] = [];
        if (err instanceof IVKApi.RequestError) {
          requestErrors = [err];
        }

        if (err instanceof IVKApi.ExecuteErrors) {
          requestErrors = err.list;
        }

        const alreadyHandledErrors = new Set();
        for (const err of requestErrors) {
          switch (err.code) {
            case API_ERROR_AUTH: {
              if ('access_token' in params && params.access_token) {
                throw err;
              }
              if (alreadyHandledErrors.has(err.code)) {
                continue;
              }

              takenAttempts = 0;
              break;
            }

            case API_ERROR_CAPTCHA: {
              throw err;
            }

            case API_ERROR_SECTION_DISABLED: {
              throw err;
            }

            case API_ERROR_TOO_MANY: {
              if (alreadyHandledErrors.has(err.code)) {
                continue;
              }
              takenAttempts = 0;
              await sleep(this.rateLimitWindow);
              break;
            }

            case API_ERROR_USER_DEACTIVATED:
            case API_ERROR_UNKNOWN_USER: {
              throw err;
            }

            case API_ERROR_UNKNOWN:
            case API_ERROR_FLOOD:
            case API_ERROR_SERVER:
            case API_ERROR_METHOD_DISABLED:
            case API_ERROR_RATE_LIMIT: {
              break;
            }

            default: {
              throw err;
            }
          }
          alreadyHandledErrors.add(err.code);
        }

        if (takenAttempts === retries + 1) {
          throw err;
        }

        const exponentialBackoff = Math.min(
          API_MIN_RETRY_TIMEOUT * 2 ** takenAttempts,
          API_MAX_RETRY_TIMEOUT,
        );
        const equalJitterBackoff =
          exponentialBackoff / 2 + getRandomInt(0, exponentialBackoff / 2);
        await sleep(equalJitterBackoff);
      }
    }
  }

  async fetchMany<Reqs extends IVKApi.TypedExecuteReq[]>(
    reqs: [...Reqs],
    opts: IVKApi.Options<'execute'> = {},
  ): Promise<{ [i in keyof Reqs]: IVKApi.TypedExecuteRes<Reqs[i]> }> {
    const pids = [];
    const result = [];

    let noForkOptimizationApplied = false;

    for (let i = reqs.length - 1; i >= 0; i--) {
      const req = reqs[i];

      if (!req) {
        result[i] = 'null';
        continue;
      }

      const varName = `res${i}`;
      const apiCall = `API.${req.method}(${JSON.stringify(
        this.enrichParams(req.method, req.params),
      )})`;

      if (!noForkOptimizationApplied) {
        noForkOptimizationApplied = true;
        pids[i] = `var ${varName}=${apiCall};`;
        result[i] = `${varName}`;
      } else {
        pids[i] = `var ${varName}=fork(${apiCall});`;
        result[i] = `wait(${varName})`;
      }
    }

    const code = `${pids.join('')}return [${result.join(',')}];`;
    const res = await this.fetch('execute', { code }, opts);

    return res;
  }

  fetchSeq<RS extends IVKApi.TypedExecuteReq[]>(
    reqs: [...RS],
    opts?: IVKApi.Options<'execute'>,
  ): Promise<{ [i in keyof RS]: IVKApi.TypedExecuteRes<RS[i]> }> {
    const pids = [];
    const result = [];

    for (let i = 0; i < reqs.length; i++) {
      const req = reqs[i];

      if (!req) {
        result.push('null');
        continue;
      }

      const varName = `res${i}`;

      pids.push(
        `var ${varName}=API.${req.method}(${JSON.stringify(
          this.enrichParams(req.method, req.params),
        )});`,
      );
      result.push(`${varName}`);
    }

    const code = `${pids.join('')}return [${result.join(',')}];`;
    return this.fetch('execute', { code }, opts);
  }

  public dangerouslyAbort(trackId: IVKApi.TrackId<keyof IVKApi.Request>): void {
    if (!trackId) {
      return;
    }
    this.abortTrackers.get(trackId)?.();
    this.abortTrackers.delete(trackId);
  }

  private enrichParams = <
    Method extends keyof IVKApi.Request,
    Params extends IVKApi.Request[Method]['params'],
  >(
    method: Method,
    params: Params,
  ): Params => {
    const scope = method.slice(0, method.indexOf('.'));

    switch (scope) {
      case 'users':
      case 'friends': {
        return {
          ...params,
          fields: API_USER_FIELDS.join(','),
        };
      }

      case 'groups':
      case 'channels':
        return {
          ...params,
          fields: API_GROUP_FIELDS.join(','),
        };

      default:
        return 'extended' in params && params.extended
          ? {
              ...params,
              fields: Array.from(
                new Set([...API_USER_FIELDS, ...API_GROUP_FIELDS]),
              ).join(','),
            }
          : params;
    }
  };

  private doFetch = async <Method extends keyof IVKApi.Request>(
    method: Method,
    params: IVKApi.Request[Method]['params'],
    timeout: number,
    trackId?: IVKApi.TrackId<Method>,
  ): Promise<IVKApi.Request[Method]['response']> => {
    await this.semaphore.lock();

    try {
      this.logger.debug(`[API] Request: ${method} ${params}`);

      const enrichedParams = {
        access_token: this.accessToken,
        ...this.enrichParams(method, params),
      };
      const version = API_VERSION;

      const url = `https://api.vk.com/method/${method}?v=${version}`;
      const ctrl = new AbortController();

      if (trackId) {
        this.abortTrackers.set(trackId, () => ctrl.abort());
      }

      let isTimeout = false;
      const timeoutId = setTimeout(() => {
        isTimeout = true;
        ctrl.abort();
      }, timeout);

      const result = await this.request(url, enrichedParams, ctrl.signal)
        .catch((err: unknown) => {
          if (ctrl.signal.aborted) {
            if (isTimeout) {
              throw new IVKApi.TimeoutError(`[API] Timeout Error: ${method}`);
            } else {
              throw new IVKApi.AbortError(`[API] Abort Error: ${method}`);
            }
          }

          throw err;
        })
        .finally(() => {
          clearTimeout(timeoutId);

          if (trackId) {
            this.abortTrackers.delete(trackId);
          }
        });

      this.logger.debug(`[API] Response:  ${method} ${result}`);

      if (result.error) {
        return Promise.reject(
          new IVKApi.RequestError(
            result.error.error_code,
            `[API] RequestError: ${result.error.error_code} ${method} (${result.error.error_msg})`,
            result.error,
          ),
        );
      }

      if (result.execute_errors) {
        return Promise.reject(
          new IVKApi.ExecuteErrors(
            result.execute_errors.map(
              (error: any) =>
                new IVKApi.RequestError(
                  error.error_code,
                  `[API] RequestError: ${error.error_code} ${error.method} (${error.error_msg})`,
                  error,
                ),
            ),
            result.response,
          ),
        );
      }

      return result.response;
    } catch (err: unknown) {
      this.logger.error(`[API] Error: ${err}`);

      return Promise.reject(err);
    } finally {
      this.semaphore.release();
    }
  };
}

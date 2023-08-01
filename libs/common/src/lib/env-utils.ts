export function mergeObject<T>(obj1: Partial<T>, obj2: Partial<T>): T {
  for (const key in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, key)) {
      if (typeof obj2[key] === 'object') {
        mergeObject<T>(obj1[key] as T, obj2[key] as T);
      } else {
        obj1[key] = obj2[key];
      }
    }
  }
  return obj1 as T;
}

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

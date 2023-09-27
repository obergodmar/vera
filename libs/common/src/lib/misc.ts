/* eslint-disable prefer-const */

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function isDeepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  // Условие для NaN.
  // eslint-disable-next-line no-self-compare
  if (a !== a && b !== b) {
    return true;
  }

  const isPrimitive = (value: any) =>
    typeof value !== 'object' || value === null;

  if (isPrimitive(a) || isPrimitive(b)) {
    return a === b;
  }

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) {
      return false;
    }

    if (Array.isArray(a)) {
      if (a.length !== b.length) {
        return false;
      }
      for (let i = 0; i < a.length; i++) {
        if (!isDeepEqual(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }

    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) {
        return false;
      }
      for (let i of a.entries()) {
        const key = i[0];
        if (!isPrimitive(key)) {
          throw new Error(
            "isDeepEqual can't compare Maps with non primitive keys",
          );
        }
        if (!b.has(key)) {
          return false;
        }
      }
      for (let i of a.entries()) {
        if (!isDeepEqual(i[1], b.get(i[0]))) {
          return false;
        }
      }
      return true;
    }

    if (a instanceof Set && b instanceof Set) {
      if (a.size !== b.size) {
        return false;
      }
      for (let i of a.entries()) {
        const value = i[0];
        if (!isPrimitive(value)) {
          throw new Error(
            "isDeepEqual can't compare Sets with non primitive values",
          );
        }
        if (!b.has(value)) {
          return false;
        }
      }
      return true;
    }

    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) {
      return false;
    }

    for (const key of keys) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) {
        return false;
      }
    }

    for (const key of keys) {
      if (!isDeepEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }

  throw new Error(`isDeepEqual don't know how to compare: ${a} and ${b}`);
}

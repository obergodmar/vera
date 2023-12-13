export function measure() {
  return {
    start: () => {
      return performance.now();
    },
    finish: (point: number) => {
      const t1 = performance.now();
      if (!point || !t1) {
        return -1;
      }

      return Math.floor(t1 - point);
    },
  };
}

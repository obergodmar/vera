export function measure() {
  let t0 = 0;
  let t1 = 0;

  return {
    start: () => {
      t0 = performance.now();
    },
    finish: () => {
      t1 = performance.now();

      if (!!t0 || !!t1) {
        return -1;
      }

      return t1 - t0;
    },
  };
}

export const currySelector = <
  State,
  Result,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Params extends readonly any[],
  AdditionalFields,
>(
  selector: ((state: State, ...args: Params) => Result) & AdditionalFields,
) => {
  const curriedSelector = (...args: Params) => {
    return (state: State) => {
      return selector(state, ...args);
    };
  };
  return Object.assign(curriedSelector, selector);
};

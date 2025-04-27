import type { Selector, UnknownMemoizer, weakMapMemoize } from 'reselect';
import { createSelector } from 'reselect';

import { RootState } from '../store';

export type TypedCreateSelector<
  State,
  MemoizeFunction extends UnknownMemoizer = typeof weakMapMemoize,
  ArgsMemoizeFunction extends UnknownMemoizer = typeof weakMapMemoize,
> = <
  InputSelectors extends readonly Selector<State>[],
  Result,
  OverrideMemoizeFunction extends UnknownMemoizer = MemoizeFunction,
  OverrideArgsMemoizeFunction extends UnknownMemoizer = ArgsMemoizeFunction,
>(
  ...createSelectorArgs: Parameters<
    typeof createSelector<
      InputSelectors,
      Result,
      OverrideMemoizeFunction,
      OverrideArgsMemoizeFunction
    >
  >
) => ReturnType<
  typeof createSelector<
    InputSelectors,
    Result,
    OverrideMemoizeFunction,
    OverrideArgsMemoizeFunction
  >
>;

export const createAppSelector: TypedCreateSelector<RootState> = createSelector;

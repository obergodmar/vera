import React, { createRef, FC, useEffect, useMemo, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { Snackbar, SnackbarExtendedProps } from '../components/snackbar';
import {
  SnackbarContainer,
  SnackbarContainerProps,
} from '../components/snackbar-container';
import {
  CreateSnackbar,
  createSnackbar,
  SnackbarState,
  snackbarStore,
} from '../data/snackbar-store';

/**
 * Единый хранитель всех снэкбаров
 */
export const SnackbarProvider: FC<SnackbarContainerProps> = ({
  children,
  ...containerProps
}) => {
  const [state, setState] = useState<SnackbarState>(snackbarStore.getState());

  useEffect(() => {
    const unsubscribe = snackbarStore.subscribe(setState);

    return () => {
      unsubscribe();
      snackbarStore.reset();
    };
  }, []);

  return (
    <>
      {children}
      <SnackbarContainer {...containerProps}>
        <TransitionGroup component="ul" className="SnackbarContainer__list">
          {state.map((snackbar) => {
            const itemRef = createRef<HTMLLIElement>();
            return (
              <CSSTransition
                nodeRef={itemRef}
                key={snackbar.id}
                timeout={400}
                classNames="SnackbarContainer__item-"
              >
                <li className="SnackbarContainer__item" ref={itemRef}>
                  <Snackbar {...snackbar} />
                </li>
              </CSSTransition>
            );
          })}
        </TransitionGroup>
      </SnackbarContainer>
    </>
  );
};

/**
 * Создать снэкбар из компонентов реакта
 */
export function useSnackbar(): CreateSnackbar<SnackbarExtendedProps> {
  return useMemo(() => createSnackbar<SnackbarExtendedProps>(), []);
}

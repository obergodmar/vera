import { createContext, FC, PropsWithChildren, useContext } from 'react';

type Open = (id: modalsIds) => void;

const ModalContext = createContext<Open | undefined>(undefined);

export const enum modalsIds {
  resetSchedule = 'resetSchedule',
  resetHelloMessages = 'resetHelloMessages',
}

type Props = PropsWithChildren<{
  open: Open;
}>;
export const ModalProvider: FC<Props> = ({ children, open }) => (
  <ModalContext.Provider value={open}>{children}</ModalContext.Provider>
);

export function useModal() {
  const context = useContext(ModalContext);

  if (!context) {
    throw Error('ModalContext is undefined!');
  }

  return context;
}

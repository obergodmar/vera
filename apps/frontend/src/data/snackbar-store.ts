import { produce } from 'immer';
import { nanoid } from 'nanoid';
import { equals } from 'ramda';

export type Opaque<Type, Token = unknown> = Type & {
  readonly __opaque__: Token;
};

/**
 * Тип пропсов ниже урезан ввиду ограниченной возможности
 * передачи чего-либо в рамках вызовов из стора.
 *
 * Из компонентов снэкбар вызывается с SnackbarExtendedProps
 * (см. Snackbar.tsx)
 */
export type SnackbarProps = {
  /**
   * Название кнопки действия в уведомлении
   */
  action?: string;

  /**
   * Будет вызвано при клике на кнопку действия
   */
  onActionClick?: () => void;
  /**
   * Варианты расположения кнопки действия.
   * Игнорируется на десктопах и при наличии элементов `after`
   */
  layout?: 'vertical' | 'horizontal';
  /**
   * Время в миллисекундах, через которое плашка скроется
   */
  duration?: number;
  /**
   * Обработчик закрытия уведомления
   */
  onClose?: () => void;
  /**
   * Задает стиль снэкбара
   */
  mode?: 'default' | 'dark';
  /**
   * Показывать ли кнопку закрытия уведомления
   */
  isManuallyClosable?: boolean;
  /**
   * Снэкбар закрывается сам после истечения таймера
   */
  autoClose?: boolean;
  /**
   * Снэкбар не закроется, пока на него наведена мышка
   */
  stopOnHover?: boolean;
  /**
   * Сообщение снэкбара
   */
  message: string;
  className?: string;
};

export type SnackbarHelpersProps = {
  id: SnackbarId;
  /**
   * Удаление снэкбара из снэкбар стора
   */
  onRequestRemove: () => void;
  /**
   * Весь стейт хранится в сторе, и, когда извне
   * поступает сигнал об удалении снэкбара, он
   * обрабатывается через этот индикатор
   */
  requestClose: boolean;
};

export type SnackbarId = Opaque<string, SnackbarItem>;

type SnackbarItem = SnackbarProps & SnackbarHelpersProps;

type SnackbarMethods<Props extends SnackbarProps = SnackbarProps> = {
  create: (snackbar: Props & { id?: string }) => SnackbarId;
  closeAll: (ids?: SnackbarId[]) => void;
  close: (id: SnackbarId) => void;
  update: (id: SnackbarId, snackbar: Props) => void;
};

export type SnackbarStore = {
  getState: () => SnackbarState;
  subscribe: (cb: SnackbarListener) => () => void;
  reset: () => void;
  remove: (id: SnackbarId) => void;
} & SnackbarMethods;

type SnackbarListener = (state: SnackbarState) => void;

export type SnackbarState = SnackbarItem[];

/**
 * Так как есть необходимость во внешнем (от реакта) контексте, где
 * хочется использовать снэкбары, создаем стор, который будет
 * хранить в себе все снэкбары
 */
export const snackbarStore = createStore();

function createStore(initialState: SnackbarState = []): SnackbarStore {
  let state = initialState;
  const listeners = new Set<SnackbarListener>();

  const setState = (setStateFn: (values: SnackbarState) => SnackbarState) => {
    state = setStateFn(state);
    listeners.forEach((listener) => listener(state));
  };

  return {
    getState: () => state,

    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    reset: () => setState(() => initialState),

    create: (snackbar) => {
      const id = resolveSnackbarId(snackbar.id || nanoid());
      const createdSnackbar = {
        ...snackbar,
        id,
        onRequestRemove: () => snackbarStore.remove(id),
        requestClose: false,
      };

      setState((prevSnackbars) => {
        const { id: _id, ...snackbarObj } = snackbar;
        if (
          prevSnackbars.find((snackbar) => {
            const { id: _id, ...snackbarObjPrev } = snackbar;
            return equals(snackbarObj, snackbarObjPrev);
          })
        ) {
          return prevSnackbars;
        }

        return [...prevSnackbars, createdSnackbar];
      });

      return id;
    },

    remove: (id) => {
      setState((prevState) =>
        prevState.filter((snackbar) => snackbar.id !== id),
      );
    },

    update: (id, snackbar) => {
      setState(
        produce((draft) => {
          const snackbarIndex = draft.findIndex(
            (snackbar) => snackbar.id === id,
          );

          const prevSnackbar = draft[snackbarIndex];
          if (!prevSnackbar) {
            return;
          }

          draft[snackbarIndex] = {
            ...prevSnackbar,
            ...snackbar,
          };
        }),
      );
    },

    closeAll: (ids) => {
      setState((prev) => {
        if (ids?.length) {
          return prev.map((snackbar) => ({
            ...snackbar,
            requestClose: ids.includes(snackbar.id) ?? snackbar.requestClose,
          }));
        }

        return prev.map((snackbar) => ({
          ...snackbar,
          requestClose: true,
        }));
      });
    },

    close: (id) => {
      setState((prevState) =>
        prevState.map((snackbar) => ({
          ...snackbar,
          requestClose: snackbar.id === id,
        })),
      );
    },
  };
}

export type CreateSnackbar<Props extends SnackbarProps = SnackbarProps> =
  SnackbarMethods<Props>['create'] & Omit<SnackbarMethods<Props>, 'create'>;

/**
 * Создать снэкбар внутри MEApp, но не из комопнентов реакта
 * (например из стора)
 */
export function createSnackbar<
  Props extends SnackbarProps = SnackbarProps,
>(): CreateSnackbar<Props> {
  const snackbar = (snackbar: Props & { id?: string }) => {
    return snackbarStore.create(snackbar);
  };

  snackbar.update = (id: SnackbarId, snackbar: Props) => {
    snackbarStore.update(id, snackbar);
  };
  snackbar.closeAll = snackbarStore.closeAll;
  snackbar.close = snackbarStore.close;

  return snackbar;
}

function resolveSnackbarId(id: string): SnackbarId {
  return id as SnackbarId;
}

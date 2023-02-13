import { Icon12Cancel } from '@vkontakte/icons';
import { Button, Paragraph } from '@vkontakte/vkui';
import { AdaptivityContext } from '@vkontakte/vkui/dist/components/AdaptivityProvider/AdaptivityContext';

import React, {
  FC,
  memo,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import './snackbar.css';
import cx from 'classnames';

import { SnackbarHelpersProps, SnackbarProps } from '../data/snackbar-store';

/**
 * SnackbarProps из стора скудны и без завязки на реакт (не можем передать JSX
 * в эффектах стора). Расширяем тип для UI, где все можно.
 */
export type SnackbarExtendedProps = SnackbarProps & {
  action?: React.ReactNode;
  onActionClick?: (e: React.MouseEvent) => void;
  before?: React.ReactNode;
  after?: React.ReactNode;
  message: React.ReactNode;
};

type Props = SnackbarExtendedProps & SnackbarHelpersProps;

export const Snackbar: FC<Props> = memo(
  ({
    message,
    layout: layoutProps = 'horizontal',
    action,
    before,
    after,
    duration = 4000,
    onActionClick,
    onClose,
    mode = 'default',
    className,
    stopOnHover = true,
    isManuallyClosable = false,
    autoClose = true,
    requestClose = false,
    onRequestRemove,
  }) => {
    const { isTouchOnly } = useDeviceData();

    const [delay, setDelay] = useState<number | null>(duration);

    useEffect(() => {
      setDelay(duration);
    }, [duration]);

    /**
     * В компоненте нет зависимости на коллбэк закрытия,
     * вызываем функцию из рефа, чтобы избежать ненужных
     * вызовов эффектов при изменении коллбэков ниже
     */
    const close = useRef(() => {
      onRequestRemove();
      onClose?.();
    });
    close.current = () => {
      onRequestRemove();
      onClose?.();
    };

    const handleActionClick = (e: React.MouseEvent<HTMLElement>) => {
      close.current();

      if (action) {
        onActionClick?.(e);
      }
    };

    const onMouseEnter = () => {
      if (!stopOnHover) {
        return;
      }

      setDelay(null);
    };
    const onMouseLeave = () => {
      if (!stopOnHover) {
        return;
      }

      setDelay(duration);
    };

    useEffect(() => {
      if (delay == null || !autoClose) {
        return undefined;
      }

      let timeoutId: number | null = null;

      timeoutId = window.setTimeout(() => {
        close.current();
      }, delay);

      return () => {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
      };
    }, [autoClose, delay]);

    useEffect(() => {
      if (requestClose) {
        close.current();
      }
    }, [requestClose]);

    const layout = after || !isTouchOnly ? 'vertical' : layoutProps;

    return (
      <div
        className={cx(
          'Snackbar',
          `Snackbar--layout-${layout}`,
          `Snackbar--mode-${mode}`,
          className
        )}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="Snackbar__body">
          {before && <div className="Snackbar__before">{before}</div>}

          <div className="Snackbar__content">
            <Paragraph className="Snackbar__content-text">{message}</Paragraph>

            {action && (
              <Button
                align="left"
                hasHover={false}
                mode="tertiary"
                appearance={mode === 'dark' ? 'overlay' : 'accent'}
                size="s"
                className="Snackbar__action"
                onClick={handleActionClick}
              >
                {action}
              </Button>
            )}
          </div>

          {after && <div className="Snackbar__after">{after}</div>}
        </div>

        {isManuallyClosable && (
          <Button
            onClick={close.current}
            after={<Icon12Cancel />}
            mode="tertiary"
            appearance={mode === 'dark' ? 'overlay' : 'neutral'}
            size="s"
            className="Snackbar__close"
          />
        )}
      </div>
    );
  }
);

type DeviceData = {
  isTouchOnly: boolean;
};

export function useDeviceData(): DeviceData {
  const adaptivityData = useContext(AdaptivityContext);

  if (!adaptivityData) {
    throw new Error('AdaptivityContext не добавлен в дерево Реакта!');
  }

  return {
    isTouchOnly: !adaptivityData.hasHover,
  };
}

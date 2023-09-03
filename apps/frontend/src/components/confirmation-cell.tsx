import { Button, CellButton } from '@vkontakte/vkui';

import { FC, ReactNode, useEffect } from 'react';

import { useConfirmation } from '../hooks/useConfirmation';

type Props = {
  title: ReactNode;
  onProceed: () => void;
  isSucceeded: boolean;
  disabled?: boolean;
};

export const ConfirmationCell: FC<Props> = ({
  title,
  onProceed,
  isSucceeded,
  disabled,
}) => {
  const { confirmed, setConfirmed, confirmationTimer } = useConfirmation(5);

  useEffect(() => {
    if (isSucceeded) {
      setConfirmed(false);
    }
  }, [isSucceeded, setConfirmed]);

  return (
    <CellButton
      mode="danger"
      onClick={() => setConfirmed(true)}
      after={
        confirmed && (
          <Button appearance="negative" onClick={onProceed}>
            Подвердить ({confirmationTimer + 1}...){' '}
          </Button>
        )
      }
      disabled={disabled}
    >
      {title}
    </CellButton>
  );
};

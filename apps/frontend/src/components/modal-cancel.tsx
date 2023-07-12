import { Icon56DeleteOutline } from '@vkontakte/icons';
import { Button, ButtonGroup, ModalCard } from '@vkontakte/vkui';

import { FC } from 'react';

import { modalsIds } from '../hooks/useModal';

type Props = {
  id: modalsIds;
  closeModal: () => void;
  onCancel: () => void;
};

export const ModalCancel: FC<Props> = ({ id, closeModal, onCancel }) => {
  return (
    <ModalCard
      id={id}
      onClose={closeModal}
      icon={<Icon56DeleteOutline />}
      header="Подтверждение удаления изменений"
      subheader="В текущей сессии для выбранного чата все изменения будут сброшены. Продолжить?"
      actions={
        <ButtonGroup stretched>
          <Button
            size="l"
            mode="primary"
            appearance="negative"
            stretched
            onClick={onCancel}
          >
            Продолжить
          </Button>
          <Button
            size="l"
            mode="secondary"
            appearance="neutral"
            stretched
            onClick={closeModal}
          >
            Отмена
          </Button>
        </ButtonGroup>
      }
    ></ModalCard>
  );
};

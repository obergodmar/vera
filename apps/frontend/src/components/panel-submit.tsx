import { PanelHeaderSubmit, Tooltip } from '@vkontakte/vkui';

import { FC } from 'react';

type Props = {
  disabled?: boolean;
  onSubmit: () => void;
};

export const PanelSubmit: FC<Props> = ({ disabled = false, onSubmit }) => {
  return (
    <Tooltip text="Сохранить изменения">
      <PanelHeaderSubmit disabled={disabled} onClick={onSubmit} />
    </Tooltip>
  );
};

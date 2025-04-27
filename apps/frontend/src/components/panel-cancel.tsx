import { PanelHeaderClose, Tooltip } from '@vkontakte/vkui';

import { FC } from 'react';

type Props = {
  disabled?: boolean;
  onCancel: () => void;
};

export const PanelCancel: FC<Props> = ({ disabled = false, onCancel }) => {
  return (
    <Tooltip text="Сбросить изменения">
      <PanelHeaderClose disabled={disabled} onClick={onCancel} />
    </Tooltip>
  );
};

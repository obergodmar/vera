import { PanelHeaderClose } from '@vkontakte/vkui';
import { TextTooltip } from '@vkontakte/vkui/dist/components/TextTooltip/TextTooltip';

import { FC } from 'react';

type Props = {
  disabled?: boolean;
  onCancel: () => void;
};

export const PanelCancel: FC<Props> = ({ disabled = false, onCancel }) => {
  return (
    <TextTooltip text="Сбросить изменения">
      <PanelHeaderClose disabled={disabled} onClick={onCancel} />
    </TextTooltip>
  );
};

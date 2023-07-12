import { PanelHeaderClose } from '@vkontakte/vkui';
import { TextTooltip } from '@vkontakte/vkui/dist/components/TextTooltip/TextTooltip';

import { FC } from 'react';

type Props = {
  modified: boolean;
  onCancel: () => void;
};

export const PanelCancel: FC<Props> = ({ modified, onCancel }) => {
  return (
    <TextTooltip text="Сбросить изменения">
      <PanelHeaderClose disabled={!modified} onClick={onCancel} />
    </TextTooltip>
  );
};

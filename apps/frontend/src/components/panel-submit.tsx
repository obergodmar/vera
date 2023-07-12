import { PanelHeaderSubmit } from '@vkontakte/vkui';
import { TextTooltip } from '@vkontakte/vkui/dist/components/TextTooltip/TextTooltip';

import { FC } from 'react';

type Props = {
  modified: boolean;
  onSubmit: () => void;
};

export const PanelSubmit: FC<Props> = ({ modified, onSubmit }) => {
  return (
    <TextTooltip text="Сохранить изменения">
      <PanelHeaderSubmit disabled={!modified} onClick={onSubmit} />
    </TextTooltip>
  );
};

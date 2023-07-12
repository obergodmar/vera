import { PanelHeaderSubmit } from '@vkontakte/vkui';
import { TextTooltip } from '@vkontakte/vkui/dist/components/TextTooltip/TextTooltip';

import { FC } from 'react';

type Props = {
  disabled?: boolean;
  onSubmit: () => void;
};

export const PanelSubmit: FC<Props> = ({ disabled = false, onSubmit }) => {
  return (
    <TextTooltip text="Сохранить изменения">
      <PanelHeaderSubmit disabled={disabled} onClick={onSubmit} />
    </TextTooltip>
  );
};

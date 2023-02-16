import { PanelHeaderClose } from '@vkontakte/vkui';
import { TextTooltip } from '@vkontakte/vkui/dist/components/TextTooltip/TextTooltip';

import { FC } from 'react';

import { modalsIds, useModal } from '../../hooks/useModal';

export const PanelCancel: FC = () => {
  const openModal = useModal();

  return (
    <TextTooltip text="Сбросить изменения">
      <PanelHeaderClose onClick={() => openModal(modalsIds.resetSchedule)} />
    </TextTooltip>
  );
};

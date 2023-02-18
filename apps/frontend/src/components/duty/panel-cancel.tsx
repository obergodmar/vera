import { PanelHeaderClose } from '@vkontakte/vkui';
import { TextTooltip } from '@vkontakte/vkui/dist/components/TextTooltip/TextTooltip';

import { FC } from 'react';
import { useSelector } from 'react-redux';

import { modalsIds, useModal } from '../../hooks/useModal';
import { chatSchedule } from './panel-submit';

export const PanelCancel: FC = () => {
  const { chatId, modified } = useSelector(chatSchedule);

  const openModal = useModal();

  if (!chatId) {
    return null;
  }

  return (
    <TextTooltip text="Сбросить изменения">
      <PanelHeaderClose
        disabled={!modified}
        onClick={() => openModal(modalsIds.resetSchedule)}
      />
    </TextTooltip>
  );
};

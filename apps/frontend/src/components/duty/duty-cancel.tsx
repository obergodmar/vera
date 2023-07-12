import { FC } from 'react';
import { useSelector } from 'react-redux';

import { modalsIds, useModal } from '../../hooks/useModal';
import { PanelCancel } from '../panel-cancel';
import { chatSchedule } from './duty-submit';

export const DutyCancel: FC = () => {
  const { chatId, modified } = useSelector(chatSchedule);

  const openModal = useModal();

  if (!chatId) {
    return null;
  }

  return (
    <PanelCancel
      disabled={!modified}
      onCancel={() => openModal(modalsIds.resetSchedule)}
    />
  );
};

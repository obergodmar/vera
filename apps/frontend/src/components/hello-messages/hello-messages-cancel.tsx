import { FC } from 'react';
import { useSelector } from 'react-redux';

import { modalsIds, useModal } from '../../hooks/useModal';
import { PanelCancel } from '../panel-cancel';
import { chatHelloMessages } from './hello-messages-submit';

export const HelloMessagesCancel: FC = () => {
  const { modified } = useSelector(chatHelloMessages);

  const openModal = useModal();

  if (!modified) {
    return null;
  }

  return (
    <PanelCancel onCancel={() => openModal(modalsIds.resetHelloMessages)} />
  );
};

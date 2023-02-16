import { PanelHeaderSubmit } from '@vkontakte/vkui';
import { TextTooltip } from '@vkontakte/vkui/dist/components/TextTooltip/TextTooltip';

import { FC } from 'react';
import { useSelector } from 'react-redux';

import { useUpdateScheduleMutation } from '../../data/services/duty-api';
import { RootState } from '../../data/store';

export const PanelSubmit: FC = () => {
  const schedule = useSelector((state: RootState) => state.duty.schedule);
  const [submit, { isLoading, data, error }] = useUpdateScheduleMutation();

  return (
    <TextTooltip text="Сохранить и отправить изменения">
      <PanelHeaderSubmit onClick={() => submit(schedule)} />
    </TextTooltip>
  );
};

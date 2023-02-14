import { Button, ButtonGroup, Spacing, Spinner } from '@vkontakte/vkui';

import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setDuties } from '../../data/reducers/duty';
import { useGetDutyMembersForChatQuery } from '../../data/services/duty-api';
import { RootState } from '../../data/store';
import { ChatMembersProvider } from '../../hooks/useChatMembers';
import { modalsIds, useModal } from '../../hooks/useModal';
import { Day } from './day';

type Props = {
  peerId: number;
};

export const Days: FC<Props> = ({ peerId }) => {
  const open = useModal();
  const { isLoading, data: members } = useGetDutyMembersForChatQuery(peerId);

  const dispatch = useDispatch();

  const dutiesFromConfig = useSelector(
    (state: RootState) => state.config.duty.schedule[peerId]
  );
  const days = useSelector((state: RootState) => state.duty.days);
  const duties = useSelector((state: RootState) => state.duty.schedule[peerId]);

  if (isLoading || !members) {
    return <Spinner />;
  }

  return (
    <>
      <ChatMembersProvider members={members}>
        {days.map((day) => {
          return (
            <Day
              key={day.dayNumber}
              day={day}
              duties={duties.filter(
                ({ dayNumber }) => dayNumber === day.dayNumber
              )}
            />
          );
        })}
      </ChatMembersProvider>

      <ButtonGroup align="right" stretched mode="vertical">
        <ButtonGroup stretched={false}>
          <Button
            mode="secondary"
            appearance="negative"
            onClick={() => dispatch(setDuties(dutiesFromConfig))}
          >
            Сбросить
          </Button>
          <Button onClick={() => open(modalsIds.dutyCheckout)}>
            Применить дежурство
          </Button>
        </ButtonGroup>
      </ButtonGroup>

      <Spacing />
    </>
  );
};

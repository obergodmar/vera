import { IDuty } from '@vera-reforged/common';
import { Icon12Delete, Icon16Hashtag } from '@vkontakte/icons';
import { FormItem, IconButton, Input, Text } from '@vkontakte/vkui';

import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { editShift, removeShift } from '../../data/reducers/duty';
import { Member } from '../../data/services/duty-api';
import { useChatMembers } from '../../hooks/useChatMembers';
import { truthy } from '../../utils/truthy';
import { TimePicker } from '../time-picker';
import { MemberPicker } from './member-picker';

type Props = {
  duty: IDuty.Duty;
  shiftNumber: number;
  dayNumber: number;
};

export const Shift: FC<Props> = ({ duty, shiftNumber, dayNumber }) => {
  const members = useChatMembers();
  const dispatch = useDispatch();

  const duties: Member[] = [
    duty.firstName !== '' && {
      value: duty.peerId,
      label: `${duty.firstName} ${duty.lastName}`,
      ...duty,
    },
  ].filter(truthy);

  const { timeTo, timeFrom, tag } = duty;

  const handleEditShift = (values: Partial<IDuty.Duty>) => {
    dispatch(editShift({ shiftNumber, shift: values, dayNumber }));
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <FormItem
        top={
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <Text>Смена {shiftNumber + 1}</Text>
            {shiftNumber > 0 && (
              <IconButton
                style={{
                  maxHeight: '20px',
                  width: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() =>
                  dispatch(removeShift({ shiftNumber, dayNumber }))
                }
              >
                <Icon12Delete />
              </IconButton>
            )}
          </div>
        }
        style={{ padding: 0, flexGrow: 1 }}
      >
        <MemberPicker
          duties={duties}
          members={members}
          onChange={(values) => {
            const [member] = values;
            if (!member) {
              return;
            }

            const { peerId, firstName, lastName, avatar, screenName } = member;
            handleEditShift({
              peerId,
              firstName,
              lastName,
              avatar,
              screenName,
            });
          }}
        />
      </FormItem>
      <FormItem top="Начало" style={{ padding: 0 }}>
        <TimePicker
          value={timeFrom}
          onChange={(value) => {
            handleEditShift({ timeFrom: value as string });
          }}
        />
      </FormItem>

      <FormItem top="Конец" style={{ padding: 0 }}>
        <TimePicker
          value={timeTo}
          onChange={(value) => {
            handleEditShift({ timeTo: value as string });
          }}
        />
      </FormItem>

      <FormItem top="Тег" style={{ padding: 0 }}>
        <Input
          placeholder="Без тега"
          style={{ width: '103px' }}
          before={<Icon16Hashtag />}
          value={tag}
          onChange={({ target: { value } }) => handleEditShift({ tag: value })}
        />
      </FormItem>
    </div>
  );
};

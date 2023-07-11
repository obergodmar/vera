import { IDuty } from '@vera-reforged/common';
import { Icon12Delete, Icon16Hashtag } from '@vkontakte/icons';
import { FormItem, IconButton, Input, Text } from '@vkontakte/vkui';
import { TextTooltip } from '@vkontakte/vkui/dist/components/TextTooltip/TextTooltip';

import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';

import { editShift, removeShift } from '../../data/reducers/duty';
import { Member } from '../../data/services/duty-api';
import { useChatMembers } from '../../hooks/useChatMembers';
import { truthy } from '../../utils/truthy';
import { TimePicker } from '../time-picker';
import { MemberPicker } from './member-picker';

type Props = {
  duty: IDuty.Schedule;
  shiftNumber: number;
  dayNumber: number;
};

export const Shift: FC<Props> = ({ duty, shiftNumber, dayNumber }) => {
  const [, rerender] = useState({});
  const members = useChatMembers();
  const dispatch = useDispatch();

  const duties: Member[] = [
    duty.firstName !== '' && {
      value: duty.userId,
      label: `${duty.firstName} ${duty.lastName}`,
      ...duty,
    },
  ].filter(truthy);

  const { timeTo, timeFrom, tag } = duty;

  const handleEditShift = (values: Partial<IDuty.Schedule>) => {
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
            <TextTooltip text="Удалить смену">
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
            </TextTooltip>
          </div>
        }
        style={{
          flexGrow: 1,
          paddingRight: 0,
          paddingTop: 0,
          paddingBottom: 0,
        }}
      >
        <MemberPicker
          duties={duties}
          members={members}
          onChange={(values) => {
            const [member, nextMember] = values;

            const {
              userId = shiftNumber,
              firstName = '',
              lastName = '',
              avatar = '',
              screenName = '',
            } = nextMember || member || {};
            handleEditShift({
              userId,
              firstName,
              lastName,
              avatar,
              screenName,
            });
            rerender({});
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

      <FormItem
        top={
          <Text
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              maxHeight: '16px',
            }}
          >
            <Icon16Hashtag />
            Тег
          </Text>
        }
        style={{ paddingLeft: 0, paddingTop: 0, paddingBottom: 0 }}
      >
        <Input
          placeholder="Без тега"
          style={{ width: '95px' }}
          value={tag}
          onChange={({ target: { value } }) => handleEditShift({ tag: value })}
        />
      </FormItem>
    </div>
  );
};

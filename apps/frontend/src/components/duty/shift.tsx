import { IDuty, TAG_MAX_WIDTH } from '@vera-reforged/common';
import { Icon12Delete, Icon16Hashtag } from '@vkontakte/icons';
import { FormItem, IconButton, Input, Text, Tooltip } from '@vkontakte/vkui';

import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';

import { editShift, removeShift } from '../../data/reducers/duty';
import { Member } from '../../data/types';
import { useChatMembers } from '../../hooks/useChatMembers';
import { truthy } from '../../utils/truthy';
import { MemberPicker } from '../member-picker';
import { TimePicker } from '../time-picker';

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
            <Tooltip description="Удалить смену">
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
            </Tooltip>
          </div>
        }
        style={{
          flexGrow: 1,
          paddingRight: 0,
          paddingTop: 0,
          paddingBottom: 0,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '36px',
            position: 'relative',
          }}
        >
          <MemberPicker
            chipsSelectStyle={{
              zIndex: 1,
              top: 0,
              left: 0,
              position: 'absolute',
              width: '100%',
            }}
            chipsStyle={{ maxWidth: '70%' }}
            selectedMembers={duties}
            members={members}
            placeholder="Дежурный"
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
        </div>
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
          maxLength={TAG_MAX_WIDTH}
          onChange={({ target: { value } }) => handleEditShift({ tag: value })}
        />
      </FormItem>
    </div>
  );
};

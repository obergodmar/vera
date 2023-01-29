import { Icon24ErrorCircle } from '@vkontakte/icons';
import {
  Avatar,
  Button,
  ButtonGroup,
  Cell,
  Chip,
  CustomSelectOption,
  FormItem,
  FormLayoutGroup,
  List,
  Spacing,
  Spinner,
  unstable_ChipsSelect as ChipsSelect,
} from '@vkontakte/vkui';
import { ChipOption } from '@vkontakte/vkui/dist/components/Chip/Chip';
import { ChipsInputProps } from '@vkontakte/vkui/dist/components/ChipsInput/ChipsInput';

import { FC, useEffect, useState } from 'react';

import { useGetConversationMembersQuery } from '../data/services/api';
import { useSnackbar } from '../hooks/useSnackbar';

type Props = {
  peerId: number;
};
export const DutyMembers: FC<Props> = ({ peerId }) => {
  const snackbar = useSnackbar();
  const { isLoading, data: members } = useGetConversationMembersQuery(peerId);
  const [duties, setDuties] = useState<ChipOption[]>([]);

  const [days, setDays] = useState([
    {
      name: 'пн',
      value: 1,
      checked: true,
    },
    {
      name: 'вт',
      value: 2,
      checked: true,
    },
    {
      name: 'ср',
      value: 3,
      checked: true,
    },
    {
      name: 'чт',
      value: 4,
      checked: true,
    },
    {
      name: 'пт',
      value: 5,
      checked: true,
    },
  ]);

  if (isLoading || !members) {
    return <Spinner />;
  }

  return (
    <>
      <FormItem top="Дежурные">
        <ChipsSelect
          value={duties}
          onChangeStart={(e) => {
            if (duties.length === days.length) {
              e.preventDefault();

              snackbar({
                message: 'Людей выбрано больше, чем рабочих дней недели',
                before: (
                  <Icon24ErrorCircle fill="var(--vkui--color_icon_accent)" />
                ),
              });
            }
          }}
          onChange={setDuties}
          options={members}
          showSelected={false}
          renderChip={(props) => {
            if (!props) {
              return;
            }

            const {
              value,
              label,
              option: { avatar },
              ...rest
            } = props;

            return (
              <Chip
                value={value}
                before={<Avatar size={20} src={avatar} />}
                {...rest}
              >
                {props?.label}
              </Chip>
            );
          }}
          renderOption={({
            option: { avatar, description },
            ...otherProps
          }) => {
            return (
              <CustomSelectOption
                before={<Avatar size={20} src={avatar} />}
                description={description}
                {...otherProps}
              />
            );
          }}
        />
      </FormItem>

      <FormLayoutGroup mode="horizontal">
        <FormItem top="Дежурство по" style={{ flexGrow: 1 }}>
          <List>
            {days.map(({ name, checked, value }, idx) => (
              <Cell
                name={name}
                key={value}
                before={<Avatar initials={name} />}
                mode="selectable"
                checked={checked}
                onChange={({ target }) => {
                  const _list = [...days];
                  const _item = _list[idx];
                  _item.checked = (target as HTMLInputElement).checked;

                  if (!_item.checked) {
                    _list.splice(idx, 1);
                    _list.push(_item);
                  } else {
                    _list.sort((a, b) => {
                      if (
                        (a.checked && b.checked) ||
                        (!a.checked && !b.checked)
                      ) {
                        return a.value - b.value;
                      }

                      if (!a.checked && b.checked) {
                        return 1;
                      }

                      if (a.checked && !b.checked) {
                        return -1;
                      }

                      return 0;
                    });
                  }

                  setDays(_list);
                }}
              />
            ))}
          </List>
        </FormItem>

        <FormItem top="Дежурит" style={{ flexGrow: 2 }}>
          <List>
            {duties.map(({ value, label, avatar }, idx) => (
              <Cell
                key={value}
                before={<Avatar src={avatar} />}
                mode="removable"
                draggable
                onDragFinish={({ from, to }) => {
                  const _list = [...duties];
                  _list.splice(from, 1);
                  _list.splice(to, 0, duties[from]);
                  setDuties(_list);
                }}
                onRemove={() => {
                  const _list = [...duties];
                  _list.splice(idx, 1);
                  setDuties(_list);
                }}
              >
                {label}
              </Cell>
            ))}
          </List>
        </FormItem>
      </FormLayoutGroup>

      <Spacing />

      <ButtonGroup align="right" stretched mode="vertical">
        <ButtonGroup stretched={false}>
          <Button mode="secondary" appearance="negative">
            Сбросить
          </Button>
          <Button>Применить дежурство</Button>
        </ButtonGroup>
      </ButtonGroup>

      <Spacing />
    </>
  );
};

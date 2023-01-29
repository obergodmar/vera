import { Icon28UserOutline } from '@vkontakte/icons';
import {
  Avatar,
  Cell,
  Checkbox,
  Chip,
  CustomSelectOption,
  FormItem,
  FormLayoutGroup,
  Group,
  Header,
  List,
  Select,
  SimpleCell,
  unstable_ChipsSelect as ChipsSelect,
} from '@vkontakte/vkui';

import { FC, useState } from 'react';

export const DutyPanel: FC = () => {
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
  const [list, updateList] = useState(['Say', 'Hello', 'To', 'My', 'Little']);

  return (
    <>
      <Group>
        <Header>Установка дежурства в чаты</Header>

        <FormLayoutGroup mode="vertical">
          <FormItem top="Чат">
            <Select placeholder="Не выбран" options={[]} />
          </FormItem>
        </FormLayoutGroup>
      </Group>

      <Group>
        <FormItem top="Дежурные">
          <ChipsSelect
            value={[]}
            options={[
              {
                value: '1',
                label: '1',
                src: '',
              },
            ]}
            showSelected={false}
            renderChip={(props) => {
              if (!props) {
                return;
              }

              const {
                value,
                label,
                option: { src },
                ...rest
              } = props;

              return (
                <Chip
                  value={value}
                  before={<Avatar size={20} src={src} />}
                  {...rest}
                >
                  {props?.label}
                </Chip>
              );
            }}
            renderOption={({ option: { src, value }, ...otherProps }) => {
              return (
                <CustomSelectOption
                  before={<Avatar size={20} src={src} />}
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
              {list.map((item, idx) => (
                <Cell
                  key={item}
                  before={<Avatar />}
                  mode="removable"
                  draggable
                  onDragFinish={({ from, to }) => {
                    const _list = [...list];
                    _list.splice(from, 1);
                    _list.splice(to, 0, list[from]);
                    updateList(_list);
                  }}
                  onRemove={() => {
                    const _list = [...list];
                    _list.splice(idx, 1);
                    updateList(_list);
                  }}
                >
                  {item}
                </Cell>
              ))}
            </List>
          </FormItem>
        </FormLayoutGroup>
      </Group>
    </>
  );
};

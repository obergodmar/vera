import { Icon16Delete } from '@vkontakte/icons';
import {
  FormItem,
  FormLayoutGroup,
  Group,
  Header,
  IconButton,
  Input,
  Tooltip,
} from '@vkontakte/vkui';

import { FC, ReactNode } from 'react';

type Props = {
  header: ReactNode;
  onChange: (type: 'label' | 'link', value: string) => void;
  onRemove: () => void;
  label: string;
  link: string;
};

export const LinkButtonCreation: FC<Props> = ({
  header,
  onChange,
  onRemove,
  label,
  link,
}) => {
  return (
    <Group
      header={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Header mode="secondary">{header}</Header>
          <Tooltip text="Удалить кнопку">
            <IconButton
              aria-label="Удалить кнопку"
              onClick={onRemove}
              style={{
                minWidth: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon16Delete
                style={{ color: 'var(--vkui--color_icon_secondary)' }}
              />
            </IconButton>
          </Tooltip>
        </div>
      }
    >
      <FormLayoutGroup mode="horizontal">
        <FormItem top="Текст кнопки">
          <Input
            placeholder="Кнопка с текстом"
            value={label}
            onChange={({ target: { value } }) => onChange('label', value)}
          />
        </FormItem>

        <FormItem top="Ссылка">
          <Input
            placeholder="Ссылка на которую можно кликнуть"
            value={link}
            onChange={({ target: { value } }) => onChange('link', value)}
          />
        </FormItem>
      </FormLayoutGroup>
    </Group>
  );
};

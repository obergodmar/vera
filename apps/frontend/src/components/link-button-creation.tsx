import { Icon16Delete } from '@vkontakte/icons';
import {
  FormItem,
  FormLayoutGroup,
  Group,
  Header,
  IconButton,
  Input,
} from '@vkontakte/vkui';
import { TextTooltip } from '@vkontakte/vkui/dist/components/TextTooltip/TextTooltip';

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
          <TextTooltip text="Удалить кнопку">
            <IconButton aria-label="Удалить кнопку" onClick={onRemove}>
              <Icon16Delete
                style={{ color: 'var(--vkui--color_icon_secondary)' }}
              />
            </IconButton>
          </TextTooltip>
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

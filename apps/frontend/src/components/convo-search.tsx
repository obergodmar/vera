import { Icon20RefreshOutline } from '@vkontakte/icons';
import {
  Avatar,
  CustomSelectOption,
  CustomSelectOptionInterface,
  FormItem,
  FormLayoutGroup,
  IconButton,
  Select,
} from '@vkontakte/vkui';
import { TextTooltip } from '@vkontakte/vkui/dist/components/TextTooltip/TextTooltip';

import { FC } from 'react';

type Props = {
  value: number | undefined;
  convos: CustomSelectOptionInterface[];
  onChange: (id: number) => void;
  refetchConvos?: () => void;
};

export const ConvoSearch: FC<Props> = ({
  value,
  convos,
  onChange,
  refetchConvos,
}) => {
  return (
    <FormLayoutGroup mode="horizontal" style={{ display: 'flex', gap: '10px' }}>
      <FormItem top="Чат">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Select
            searchable
            style={{ flexGrow: 1 }}
            value={value}
            onChange={(e) => {
              const id = Number(e.target.value);

              onChange(id);
            }}
            placeholder="Не выбран"
            options={convos}
            renderOption={({
              option: { avatar, description },
              ...restProps
            }) => (
              <CustomSelectOption
                {...restProps}
                before={<Avatar size={24} src={avatar} />}
                description={description}
              />
            )}
            filterFn={(value, option) =>
              option.value?.toString().includes(value) ||
              option.label?.toString().includes(value)
            }
          />

          {refetchConvos && (
            <TextTooltip text="Обновить список чатов">
              <IconButton
                aria-label="Обновить список чатов"
                onClick={refetchConvos}
                style={{
                  minWidth: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--vkui--color_text_subhead)',
                }}
              >
                <Icon20RefreshOutline />
              </IconButton>
            </TextTooltip>
          )}
        </div>
      </FormItem>
    </FormLayoutGroup>
  );
};

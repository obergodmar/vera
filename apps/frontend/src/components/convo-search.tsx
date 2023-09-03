import { Icon16Users, Icon20RefreshOutline } from '@vkontakte/icons';
import {
  Avatar,
  CustomSelectOption,
  CustomSelectOptionInterface,
  FormItem,
  FormLayoutGroup,
  IconButton,
  Select,
  SimpleCell,
  Switch,
} from '@vkontakte/vkui';
import { TextTooltip } from '@vkontakte/vkui/dist/components/TextTooltip/TextTooltip';

import { FC } from 'react';

type Props = {
  value: number | undefined;
  convos: CustomSelectOptionInterface[];
  onChange: (id: number) => void;
  refetchConvos?: () => void;
  disableUpdatedConvosSwitch?: boolean;
};

export const ConvoSearch: FC<Props> = ({
  value,
  convos,
  onChange,
  refetchConvos,
  disableUpdatedConvosSwitch,
}) => {
  return (
    <FormLayoutGroup mode="vertical">
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
                before={
                  <Avatar
                    size={24}
                    src={avatar}
                    fallbackIcon={<Icon16Users />}
                  />
                }
                description={description}
              />
            )}
            filterFn={(value = '', option) => {
              const input = value.toLowerCase();
              return (
                option.value?.toString().toLowerCase().includes(input) ||
                option.label?.toString().toLowerCase().includes(input)
              );
            }}
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

      {!disableUpdatedConvosSwitch && (
        <FormItem bottom="Показывает только те чаты, в которые уже добавлены установки из текущего раздела">
          <SimpleCell Component="label" after={<Switch />}>
            Только с установками
          </SimpleCell>
        </FormItem>
      )}
    </FormLayoutGroup>
  );
};

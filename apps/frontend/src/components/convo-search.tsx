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
  Tooltip,
} from '@vkontakte/vkui';

import { FC, useMemo, useState } from 'react';

type Props = {
  value: number | undefined;
  convos: CustomSelectOptionInterface[];
  updatedConvosIds?: number[];
  onChange: (id: number | undefined) => void;
  refetchConvos?: () => void;
  disableUpdatedConvosSwitch?: boolean;
};

export const ConvoSearch: FC<Props> = ({
  value,
  convos,
  updatedConvosIds,
  onChange,
  refetchConvos,
  disableUpdatedConvosSwitch = true,
}) => {
  const [showUpdatedOnly, setShowUpdatedOnly] = useState(false);

  const options = useMemo(() => {
    if (!showUpdatedOnly) {
      return convos;
    }

    return convos.filter(({ value }) => {
      const convoId = Number(value);

      return updatedConvosIds?.includes(convoId);
    });
  }, [convos, showUpdatedOnly, updatedConvosIds]);

  return (
    <FormLayoutGroup mode="vertical">
      <FormItem top="Чат">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Select
            searchable
            style={{ flexGrow: 1 }}
            value={value}
            before={
              options.find(({ value: val }) => val === value)?.avatar && (
                <Avatar
                  size={24}
                  src={options.find(({ value: val }) => val === value)?.avatar}
                  fallbackIcon={<Icon16Users />}
                />
              )
            }
            onChange={(e) => {
              const id = Number(e.target.value);

              onChange(id);
            }}
            placeholder="Не выбран"
            options={options}
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
            <Tooltip text="Обновить список чатов">
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
            </Tooltip>
          )}
        </div>
      </FormItem>

      {!disableUpdatedConvosSwitch && (
        <FormItem
          bottom="Показывает только те чаты, в которые уже добавлены установки из текущего раздела"
          style={{ paddingTop: 0 }}
        >
          <SimpleCell
            Component="label"
            after={
              <Switch
                checked={showUpdatedOnly}
                onChange={({ target }) => setShowUpdatedOnly(target.checked)}
              />
            }
          >
            Только с установками
          </SimpleCell>
        </FormItem>
      )}
    </FormLayoutGroup>
  );
};

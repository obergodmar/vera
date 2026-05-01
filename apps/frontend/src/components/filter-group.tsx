import { Icon20RefreshOutline } from '@vkontakte/icons';
import { IconButton, SimpleCell, Switch, Text, Tooltip } from '@vkontakte/vkui';

import { FC } from 'react';

type Props = {
  refetch?: () => void;
  refetchText?: string;
  title: string;
  enabledChecked: boolean;
  enabledChanged: (value: boolean) => void;
  disabledChecked: boolean;
  disabledChanged: (value: boolean) => void;
};

export const FilterGroup: FC<Props> = ({
  refetch,
  refetchText,
  title,
  enabledChanged,
  enabledChecked,
  disabledChanged,
  disabledChecked,
}) => {
  return (
    <>
      <SimpleCell
        after={
          refetch && (
            <Tooltip description={refetchText || 'Обновить'}>
              <IconButton
                aria-label={refetchText || 'Обновить'}
                onClick={refetch}
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
          )
        }
      >
        <Text style={{ fontWeight: 600 }}>{title}</Text>
      </SimpleCell>
      <SimpleCell
        Component="label"
        after={
          <Switch
            checked={enabledChecked}
            onChange={({ target: { checked } }) => {
              enabledChanged(checked);

              if (!checked && !disabledChecked) {
                disabledChanged(true);
              }
            }}
          />
        }
      >
        Включенные
      </SimpleCell>
      <SimpleCell
        Component="label"
        after={
          <Switch
            checked={disabledChecked}
            onChange={({ target: { checked } }) => {
              disabledChanged(checked);

              if (!checked && !enabledChecked) {
                enabledChanged(true);
              }
            }}
          />
        }
      >
        Отключенные
      </SimpleCell>
    </>
  );
};

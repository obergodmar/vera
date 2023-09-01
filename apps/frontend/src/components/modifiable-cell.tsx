import {
  Button,
  ButtonGroup,
  RichCell,
  RichCellProps,
  Switch,
  Text,
} from '@vkontakte/vkui';

import { Dispatch, FC, PropsWithChildren, SetStateAction } from 'react';

type Props = PropsWithChildren<
  {
    modified: boolean;
    onSave: () => void;
    onReset: () => void;
    onRemove: () => void;
    removeConfirmed: boolean;
    confirmationTimer: number;
    isLoading: boolean;
    enabled: boolean;
    setEnabled: Dispatch<SetStateAction<boolean>>;
  } & RichCellProps
>;

export const ModifiableCell: FC<Props> = ({
  modified,
  children,
  onSave,
  onReset,
  onRemove,
  removeConfirmed,
  confirmationTimer,
  isLoading,
  enabled,
  setEnabled,
  ...richCellProps
}) => {
  return (
    <RichCell
      style={{
        transition: 'box-shadow 0.3s ease',
        boxShadow: modified
          ? '0 0 0 5px var(--vkui--color_background_accent_tint--active)'
          : '0 0 0 5px transparent',
      }}
      disabled
      subhead={
        modified ? (
          <Text
            style={{
              color: 'var(--vkui--color_background_accent_tint--active)',
              fontWeight: 600,
            }}
          >
            Есть несохраненные изменения
          </Text>
        ) : undefined
      }
      after={
        <div style={{ paddingTop: '28px' }}>
          <Switch
            checked={enabled}
            onChange={({ target: { checked } }) => setEnabled(checked)}
          />
        </div>
      }
      afterCaption={enabled ? 'Включено' : 'Отключено'}
      actions={
        <ButtonGroup stretched>
          <Button
            mode="primary"
            stretched
            disabled={!modified}
            onClick={onSave}
          >
            Сохранить
          </Button>

          <Button appearance="neutral" disabled={!modified} onClick={onReset}>
            Сбросить
          </Button>

          <Button
            appearance="negative"
            mode={removeConfirmed ? 'primary' : 'secondary'}
            size="s"
            loading={isLoading}
            onClick={onRemove}
          >
            {removeConfirmed
              ? `Подвердить (${confirmationTimer + 1}...)`
              : 'Убрать'}
          </Button>
        </ButtonGroup>
      }
      {...richCellProps}
    >
      {children}
    </RichCell>
  );
};

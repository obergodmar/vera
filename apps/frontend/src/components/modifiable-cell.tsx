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
    error?: string;
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
  error,
  ...richCellProps
}) => {
  return (
    <RichCell
      style={{
        transition: 'box-shadow 0.3s ease',
        boxShadow: modified
          ? `0 0 0 5px var(--vkui--color_background_${
              error ? 'negative' : 'accent_tint'
            }--active)`
          : '0 0 0 5px transparent',
      }}
      disabled
      overTitle={
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
        <>
          <ButtonGroup stretched>
            <Button
              mode="primary"
              stretched
              disabled={!modified || !!error}
              onClick={onSave}
              loading={isLoading}
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
              disabled={isLoading}
              onClick={isLoading ? undefined : onRemove}
            >
              {removeConfirmed
                ? `Подвердить (${confirmationTimer + 1}...)`
                : 'Убрать'}
            </Button>
          </ButtonGroup>

          {error && (
            <Text
              style={{
                color: 'var(--vkui--color_background_negative--active)',
                fontSize: '13px',
                marginTop: '4px',
              }}
            >
              {error}
            </Text>
          )}
        </>
      }
      {...richCellProps}
    >
      {children}
    </RichCell>
  );
};

import { IReactions } from '@vera-reforged/common';
import { Icon24ErrorCircle } from '@vkontakte/icons';
import {
  Button,
  ButtonGroup,
  Div,
  Input,
  RichCell,
  Switch,
  Text,
  Textarea,
} from '@vkontakte/vkui';

import { FC, useEffect, useState } from 'react';

import { useUpdateReactionsForChatMutation } from '../../data/services/reactions-api';
import { useConfirmation } from '../../hooks/useConfirmation';
import { useSnackbar } from '../../hooks/useSnackbar';

type Props = IReactions.ChatReaction;

export const Reaction: FC<Props> = ({
  id,
  chatId,
  reaction,
  textTrigger,
  enabled,
}) => {
  const { confirmed, setConfirmed, confirmationTimer } = useConfirmation(5);
  const [submit, { data, isLoading, reset }] =
    useUpdateReactionsForChatMutation();
  const snackbar = useSnackbar();

  const [currentTrigger, setCurrentTrigger] = useState(textTrigger);
  const [currentReaction, setCurrentReaction] = useState(reaction);
  const [currentEnabled, setCurrentEnabled] = useState(enabled);

  useEffect(() => {
    setCurrentTrigger(textTrigger);
  }, [textTrigger]);

  useEffect(() => {
    setCurrentReaction(reaction);
  }, [reaction]);

  useEffect(() => {
    setCurrentEnabled(enabled);
  }, [enabled]);

  const modified =
    currentTrigger !== textTrigger ||
    currentReaction !== reaction ||
    currentEnabled !== enabled;

  useEffect(() => {
    if (data?.success) {
      snackbar({
        message: 'Реакция обновлена',
        before: <Icon24ErrorCircle fill="var(--vkui--color_icon_accent)" />,
      });
    }
  }, [data, snackbar]);

  useEffect(() => reset);

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
      caption="Реакция"
      text={
        <Div>
          <Input
            disabled={isLoading}
            value={currentTrigger}
            onChange={({ target: { value } }) => setCurrentTrigger(value)}
          />
        </Div>
      }
      bottom={
        <Div>
          <Textarea
            disabled={isLoading}
            value={currentReaction}
            onChange={({ target: { value } }) => setCurrentReaction(value)}
          />
        </Div>
      }
      after={
        <div style={{ paddingTop: '28px' }}>
          <Switch
            checked={currentEnabled}
            onChange={({ target: { checked } }) => setCurrentEnabled(checked)}
          />
        </div>
      }
      afterCaption={currentEnabled ? 'Включена' : 'Отключена'}
      actions={
        <ButtonGroup stretched>
          <Button
            mode="primary"
            stretched
            disabled={!modified}
            onClick={() => {
              submit({
                id,
                chatId,
                textTrigger: currentTrigger,
                reaction: currentReaction,
                enabled: currentEnabled,
              });
            }}
          >
            Сохранить
          </Button>

          <Button
            appearance="neutral"
            disabled={!modified}
            onClick={() => {
              setCurrentTrigger(textTrigger);
              setCurrentReaction(reaction);
              setCurrentEnabled(enabled);
            }}
          >
            Сбросить
          </Button>

          <Button
            appearance="negative"
            mode={confirmed ? 'primary' : 'secondary'}
            size="s"
            loading={isLoading}
            onClick={() => {
              if (confirmed) {
                submit({ chatId, id, textTrigger: '', reaction: '', enabled });
              }

              setConfirmed(true);
            }}
          >
            {confirmed ? `Подвердить (${confirmationTimer + 1}...)` : 'Убрать'}
          </Button>
        </ButtonGroup>
      }
    >
      <Text
        style={{
          fontWeight: 400,
          color: 'var(--vkui--color_text_secondary)',
          fontSize: 'var(--vkui--font_subhead--font_size--compact)',
        }}
      >
        Триггер
      </Text>
    </RichCell>
  );
};

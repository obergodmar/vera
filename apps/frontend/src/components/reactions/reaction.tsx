import { IReactions } from '@vera-reforged/common';
import { Icon24ErrorCircle } from '@vkontakte/icons';
import { Div, Input, Text, Textarea } from '@vkontakte/vkui';

import { FC, useEffect, useState } from 'react';

import { useUpdateReactionsForChatMutation } from '../../data/services/reactions-api';
import { useConfirmation } from '../../hooks/useConfirmation';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ModifiableCell } from '../modifiable-cell';

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
    <ModifiableCell
      modified={modified}
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
      enabled={currentEnabled}
      setEnabled={setCurrentEnabled}
      onSave={() => {
        submit({
          id,
          chatId,
          textTrigger: currentTrigger,
          reaction: currentReaction,
          enabled: currentEnabled,
        });
      }}
      onReset={() => {
        setCurrentTrigger(textTrigger);
        setCurrentReaction(reaction);
        setCurrentEnabled(enabled);
      }}
      onRemove={() => {
        if (confirmed) {
          submit({ chatId, id, textTrigger: '', reaction: '', enabled });
        }

        setConfirmed(true);
      }}
      removeConfirmed={confirmed}
      confirmationTimer={confirmationTimer}
      isLoading={isLoading}
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
    </ModifiableCell>
  );
};

import { IReactions } from '@vera-reforged/common';
import { Button, Div, Input, RichCell, Textarea } from '@vkontakte/vkui';

import { FC, useEffect, useState } from 'react';

import { useUpdateReactionsForChatMutation } from '../../data/services/reactions-api';
import { useConfirmation } from '../../hooks/useConfirmation';

type Props = IReactions.ChatReaction;

export const Reaction: FC<Props> = ({ id, chatId, reaction, textTrigger }) => {
  const { confirmed, setConfirmed, confirmationTimer } = useConfirmation(5);
  const [submit, { data, isLoading, reset }] =
    useUpdateReactionsForChatMutation();

  const [currentTrigger, setCurrentTrigger] = useState(textTrigger);
  const [currentReaction, setCurrentReaction] = useState(reaction);

  useEffect(() => {
    setCurrentTrigger(textTrigger);
  }, [textTrigger]);

  useEffect(() => {
    setCurrentReaction(reaction);
  }, [reaction]);

  return (
    <RichCell
      subhead="Триггер"
      caption="Реакция"
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
        <Button
          appearance="negative"
          mode={confirmed ? 'primary' : 'secondary'}
          size="s"
          loading={isLoading}
          onClick={() => {
            if (confirmed) {
              submit({ chatId, id, textTrigger: '', reaction: '' });
            }

            setConfirmed(true);
          }}
        >
          {confirmed ? `Подвердить (${confirmationTimer + 1}...)` : 'Убрать'}
        </Button>
      }
    >
      <Div>
        <Input
          disabled={isLoading}
          value={currentTrigger}
          onChange={({ target: { value } }) => setCurrentTrigger(value)}
        />
      </Div>
    </RichCell>
  );
};

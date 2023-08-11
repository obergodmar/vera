import { IReactions } from '@vera-reforged/common';
import { Button, Div, Input, RichCell, Textarea } from '@vkontakte/vkui';

import { FC } from 'react';

import { useUpdateReactionsForChatMutation } from '../../data/services/reactions-api';
import { useConfirmation } from '../../hooks/useConfirmation';

type Props = IReactions.ChatReaction;

export const Reaction: FC<Props> = ({ id, chatId, reaction, textTrigger }) => {
  const { confirmed, setConfirmed, confirmationTimer } = useConfirmation(5);
  const [submit, { data, isLoading, reset }] =
    useUpdateReactionsForChatMutation();

  return (
    <RichCell
      subhead="Триггер"
      caption="Реакция"
      bottom={
        <Div>
          <Textarea disabled={isLoading} value={reaction} />
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
        <Input disabled={isLoading} value={textTrigger} />
      </Div>
    </RichCell>
  );
};

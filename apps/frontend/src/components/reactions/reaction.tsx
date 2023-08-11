import { IReactions } from '@vera-reforged/common';
import { Div, Input, RichCell, Textarea } from '@vkontakte/vkui';

import { FC } from 'react';

type Props = Omit<IReactions.ChatReaction, 'chatId'>;

export const Reaction: FC<Props> = ({ reaction, textTrigger }) => {
  return (
    <RichCell
      subhead="Триггер"
      caption="Реакция"
      bottom={
        <Div>
          <Textarea value={reaction} />
        </Div>
      }
    >
      <Div>
        <Input value={textTrigger} />
      </Div>
    </RichCell>
  );
};

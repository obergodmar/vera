import { IApi } from '@vera-reforged/common';
import {
  Avatar,
  Button,
  ButtonGroup,
  RichCell,
  Textarea,
} from '@vkontakte/vkui';

import { FC } from 'react';

type Props = {
  chat: IApi.IHelloMessagesApi.ConvoListWithMessages;
};

export const Message: FC<Props> = ({ chat }) => {
  const { helloMessage, peer, chat_settings = {} } = chat;

  const { title, photo = {} } = chat_settings;
  const avatar = photo?.photo_100;

  return (
    <RichCell
      disabled
      caption={peer?.id}
      bottom={<Textarea value={helloMessage} />}
      before={<Avatar initials={title[0]} src={avatar} />}
      actions={
        <ButtonGroup mode="horizontal" gap="s" stretched>
          <Button mode="primary" size="s">
            Primary
          </Button>
          <Button mode="secondary" size="s">
            Secondary
          </Button>
        </ButtonGroup>
      }
    >
      {title}
    </RichCell>
  );
};

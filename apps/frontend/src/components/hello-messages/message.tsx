import { createSelector } from '@reduxjs/toolkit';
import { IApi } from '@vera-reforged/common';
import { Icon24ErrorCircle } from '@vkontakte/icons';
import {
  Avatar,
  Button,
  ButtonGroup,
  RichCell,
  Textarea,
} from '@vkontakte/vkui';

import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { updateMessage } from '../../data/reducers/hello-messages';
import { useUpdateHelloMessageMutation } from '../../data/services/hello-messages-api';
import { RootState } from '../../data/store';
import { useConfirmation } from '../../hooks/useConfirmation';
import { useSnackbar } from '../../hooks/useSnackbar';

type Props = {
  chat: IApi.IHelloMessagesApi.ConvoListWithMessages;
};

export const chatMessageSelector = (chatId: number | undefined) =>
  createSelector(
    (state: RootState) => state.helloMessages.updatedMessages,
    (messages) => {
      if (chatId) {
        return messages.find(({ chatId: id }) => id === chatId)?.message || '';
      }

      return '';
    },
  );

export const Message: FC<Props> = ({ chat }) => {
  const { helloMessage, peer, chat_settings = {} } = chat;
  const chatId = peer?.id ?? 0;

  const { title, photo = {} } = chat_settings;
  const avatar = photo?.photo_100;

  const dispatch = useDispatch();

  const message = useSelector(chatMessageSelector(chatId));
  const [modified, setModified] = useState(message !== helloMessage);
  const { confirmed, setConfirmed, confirmationTimer } = useConfirmation(5);
  const [deleted, setDeleted] = useState(false);

  const [submit, { data, isLoading, reset }] = useUpdateHelloMessageMutation();
  const snackbar = useSnackbar();

  useEffect(() => {
    if (data?.success) {
      snackbar({
        message: `Сообщения для "${title}" было ${
          deleted ? 'удалено' : 'изменено'
        }`,
        before: <Icon24ErrorCircle fill="var(--vkui--color_icon_accent)" />,
      });

      setModified(false);
    }

    if (data?.error) {
      setDeleted(false);
      setConfirmed(false);
    }
  }, [data, snackbar, title, deleted, setConfirmed]);

  useEffect(() => reset);

  useEffect(() => {
    setModified(message !== helloMessage);
  }, [helloMessage, message]);

  return (
    <RichCell
      style={
        deleted
          ? {
              opacity: '0.4',
              pointerEvents: 'none',
            }
          : undefined
      }
      disabled
      extraSubtitle={chatId}
      bottom={
        <Textarea
          value={message}
          onChange={({ target: { value } }) =>
            dispatch(updateMessage({ chatId, message: value }))
          }
        />
      }
      before={<Avatar initials={title?.[0]} src={avatar} />}
      actions={
        modified && (
          <ButtonGroup mode="horizontal" gap="s" stretched>
            <Button
              size="s"
              loading={isLoading}
              onClick={() => submit({ chatId, message })}
            >
              Обновить сообщение
            </Button>
            <Button
              mode="secondary"
              size="s"
              onClick={() => {
                dispatch(updateMessage({ chatId, message: helloMessage }));
              }}
            >
              Сбросить изменение
            </Button>
          </ButtonGroup>
        )
      }
      after={
        <Button
          appearance="negative"
          mode={confirmed ? 'primary' : 'secondary'}
          size="s"
          loading={isLoading}
          onClick={() => {
            if (confirmed) {
              submit({ chatId, message: '' });
              setDeleted(true);
            }

            setConfirmed(true);
          }}
        >
          {confirmed ? `Подвердить (${confirmationTimer + 1}...)` : 'Убрать'}
        </Button>
      }
    >
      {title ?? ''}
    </RichCell>
  );
};

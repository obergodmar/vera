import { IHelloMessages } from '@vera-reforged/common';
import { Icon24ErrorCircle } from '@vkontakte/icons';
import { Button, FormItem, Textarea } from '@vkontakte/vkui';

import { FC, ReactNode, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { updateMessage } from '../../data/reducers/hello-messages';
import { useUpdateHelloMessageMutation } from '../../data/services/hello-messages-api';
import { useSnackbar } from '../../hooks/useSnackbar';

type Props = {
  chatId: number;
  chatTitle: string | ReactNode;
  currentMessage?: IHelloMessages.Message;
  message: IHelloMessages.Message;
};

export const HelloMessagesChat: FC<Props> = ({
  chatId,
  chatTitle,
  message,
  currentMessage,
}) => {
  const dispatch = useDispatch();
  const [modified, setModified] = useState(message !== currentMessage);

  const [submit, { data, isLoading, reset }] = useUpdateHelloMessageMutation();
  const snackbar = useSnackbar();

  const [existed, setExisted] = useState(
    currentMessage && typeof currentMessage === 'string'
  );

  useEffect(() => {
    if (data?.success) {
      snackbar({
        message: `Сообщениe ${existed ? 'обновлено' : 'создано'}`,
        before: <Icon24ErrorCircle fill="var(--vkui--color_icon_accent)" />,
      });

      setModified(false);
      setExisted(true);
    }
  }, [data, existed, snackbar]);

  useEffect(() => reset);

  useEffect(() => {
    setModified(message !== currentMessage);
  }, [currentMessage, message]);

  useEffect(() => {
    setExisted(typeof currentMessage === 'string');
  }, [currentMessage]);

  return (
    <div>
      <FormItem
        top="Сообщение"
        bottom="Вера будет отправлять это сообщение каждый раз, когда в чате появляется новый участник"
      >
        <Textarea
          placeholder={`Добро пожаловать в чат "${chatTitle}"`}
          value={message}
          onChange={({ target: { value } }) =>
            dispatch(updateMessage({ chatId, message: value }))
          }
        />
      </FormItem>

      <FormItem>
        <Button
          stretched
          disabled={(!existed && !message) || !modified}
          loading={isLoading}
          onClick={() => submit({ chatId, message })}
        >
          {existed ? 'Обновить сообщение' : 'Создать сообщение'}
        </Button>
      </FormItem>
    </div>
  );
};

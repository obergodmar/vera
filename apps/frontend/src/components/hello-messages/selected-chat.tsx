import { IHelloMessages } from '@vera-reforged/common';
import { FormItem, Textarea } from '@vkontakte/vkui';

import { FC, ReactNode } from 'react';
import { useDispatch } from 'react-redux';

import { updateMessage } from '../../data/reducers/hello-messages';

type Props = {
  chatId: number;
  chatTitle: string | ReactNode;
  message: IHelloMessages.Message;
};

export const SelectedChat: FC<Props> = ({ chatId, chatTitle, message }) => {
  const dispatch = useDispatch();

  return (
    <div>
      <FormItem
        top="Сообщение"
        bottom="Вера будет отправлять это сообщение каждый раз, когда в чате появляется новый участник"
      >
        <Textarea
          placeholder={`Добро пожаловать в чат ${chatTitle}`}
          value={message}
          onChange={({ target: { value } }) =>
            dispatch(updateMessage({ chatId, message: value }))
          }
        />
      </FormItem>
    </div>
  );
};

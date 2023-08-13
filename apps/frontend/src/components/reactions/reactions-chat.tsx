import { Icon24ErrorCircle } from '@vkontakte/icons';
import { Button, FormItem, Input, Textarea } from '@vkontakte/vkui';

import { FC, ReactNode, useEffect, useState } from 'react';

import { useCreateReactionForChatMutation } from '../../data/services/reactions-api';
import { useSnackbar } from '../../hooks/useSnackbar';

type Props = {
  chatId: number;
  chatTitle: string | ReactNode;
};

export const ReactionsChat: FC<Props> = ({ chatTitle, chatId }) => {
  const [submit, { data, isLoading, reset }] =
    useCreateReactionForChatMutation();
  const snackbar = useSnackbar();

  const [trigger, setTrigger] = useState('');
  const [reaction, setReaction] = useState('');

  useEffect(() => {
    if (data?.success) {
      snackbar({
        message: 'Реакция создана',
        before: <Icon24ErrorCircle fill="var(--vkui--color_icon_accent)" />,
      });

      setTrigger('');
      setReaction('');
    }
  }, [data, snackbar]);

  useEffect(() => reset);

  return (
    <div>
      <FormItem
        top="Триггер для вызова реакции Веры"
        bottom="Можно использовать регулярные выражения, чтобы точно задать слово или фразу для получения соответствующей реакции"
      >
        <Input
          value={trigger}
          onChange={({ target: { value } }) => setTrigger(value)}
          placeholder="Слово, фраза или регулярное выражение"
        />
      </FormItem>

      <FormItem
        top="Сообщение"
        bottom="Вера отправляет это сообщение каждый раз, когда в выбранном чате появляется сообщение, содержащее фразу-триггер"
      >
        <Textarea
          placeholder={`Сообщение-реакция для чата "${chatTitle}"`}
          value={reaction}
          onChange={({ target: { value } }) => setReaction(value)}
        />
      </FormItem>

      <FormItem>
        <Button
          stretched
          disabled={!trigger || !reaction}
          loading={isLoading}
          onClick={() =>
            submit({ reaction, textTrigger: trigger, chatId, enabled: true })
          }
        >
          Создать реакцию
        </Button>
      </FormItem>
    </div>
  );
};

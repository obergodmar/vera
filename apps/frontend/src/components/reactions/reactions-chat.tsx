import { IReactions } from '@vera-reforged/common';
import { Icon24ErrorCircle } from '@vkontakte/icons';
import { Button, FormItem, Input, Textarea } from '@vkontakte/vkui';

import { FC, ReactNode, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { updateMessage } from '../../data/reducers/hello-messages';
import { useUpdateHelloMessageMutation } from '../../data/services/hello-messages-api';
import { useSnackbar } from '../../hooks/useSnackbar';

type Props = {
  chatId: number;
  chatTitle: string | ReactNode;
  trigger?: IReactions.Trigger;
  reaction?: IReactions.Reaction;
  currentTrigger?: IReactions.Trigger;
  currentReaction?: IReactions.Reaction;
};

export const ReactionsChat: FC<Props> = ({
  chatId,
  chatTitle,
  trigger,
  reaction,
  currentTrigger,
  currentReaction,
}) => {
  const dispatch = useDispatch();
  const [modified, setModified] = useState(trigger !== currentTrigger);

  const [submit, { data, isLoading, reset }] = useUpdateHelloMessageMutation();
  const snackbar = useSnackbar();

  useEffect(() => {
    if (data?.success) {
      snackbar({
        message: 'Реакция создана',
        before: <Icon24ErrorCircle fill="var(--vkui--color_icon_accent)" />,
      });

      setModified(false);
    }
  }, [data, snackbar]);

  useEffect(() => reset);

  useEffect(() => {
    setModified(trigger !== currentTrigger || reaction !== currentReaction);
  }, [trigger, reaction, currentTrigger, currentReaction]);

  return (
    <div>
      <FormItem
        top="Триггер для вызова реакции Веры"
        bottom="Можно использовать регулярные выражения, чтобы точно задать слово или фразу для получения соответствующей реакции"
      >
        <Input
          value={trigger}
          placeholder="Слово, фраза или /регулярное выражение/"
        />
      </FormItem>

      <FormItem
        top="Сообщение"
        bottom="Вера отправляет это сообщение каждый раз, когда в выбранном чате появляется сообщение, содержащее фразу-триггер"
      >
        <Textarea
          placeholder={`Сообщение-реакция для чата "${chatTitle}"`}
          value={reaction}
          onChange={({ target: { value } }) =>
            dispatch(updateMessage({ chatId, message: value }))
          }
        />
      </FormItem>

      <FormItem>
        <Button
          stretched
          disabled={!trigger || !reaction || !modified}
          loading={isLoading}
          onClick={() => undefined}
        >
          Создать сообщение
        </Button>
      </FormItem>
    </div>
  );
};

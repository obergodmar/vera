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

  const [existed, setExisted] = useState(
    typeof currentTrigger === 'string' && typeof currentReaction === 'string'
  );

  useEffect(() => {
    if (data?.success) {
      snackbar({
        message: `Реакция ${existed ? 'обновлена' : 'создана'}`,
        before: <Icon24ErrorCircle fill="var(--vkui--color_icon_accent)" />,
      });

      setModified(false);
      setExisted(true);
    }
  }, [data, existed, snackbar]);

  useEffect(() => reset);

  useEffect(() => {
    setModified(trigger !== currentTrigger || reaction !== currentReaction);
  }, [trigger, reaction, currentTrigger, currentReaction]);

  useEffect(() => {
    setExisted(
      typeof currentTrigger === 'string' && typeof currentReaction === 'string'
    );
  }, [currentTrigger, currentReaction]);

  return (
    <div>
      <FormItem
        top="Триггер для вызова реакции Веры"
        bottom="Можно использовать регулярные выражения, чтобы точно задать слово или фразу, на которое должна быть отправлена соответствующая реакция"
      >
        <Input />
      </FormItem>

      <FormItem
        top="Сообщение"
        bottom="Вера отправляет это сообщение каждый раз, когда в выбранном чате появляется сообщение, содержащее фразу-триггер"
      >
        <Textarea
          placeholder={`Добро пожаловать в чат ${chatTitle}`}
          value={reaction}
          onChange={({ target: { value } }) =>
            dispatch(updateMessage({ chatId, message: value }))
          }
        />
      </FormItem>

      <FormItem>
        <Button
          stretched
          disabled={(!existed && (!trigger || !reaction)) || !modified}
          loading={isLoading}
          onClick={() => undefined}
        >
          {existed ? 'Обновить сообщение' : 'Создать сообщение'}
        </Button>
      </FormItem>
    </div>
  );
};

import { IReactions } from '@vera-reforged/common';
import { Icon24ErrorCircle } from '@vkontakte/icons';
import { Div, Input, Text, Textarea } from '@vkontakte/vkui';

import { FC, useEffect, useState } from 'react';

import { useUpdateReactionsForChatMutation } from '../../data/services/reactions-api';
import { useConfirmation } from '../../hooks/useConfirmation';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ModifiableCell } from '../modifiable-cell';
import { ReactionCallDuty } from './reaction-call-duty';

type Props = IReactions.ChatReaction;

export const Reaction: FC<Props> = ({
  id,
  chatId,
  reaction,
  textTrigger,
  callDuty = false,
  dutyTag = null,
  enabled,
}) => {
  const { confirmed, setConfirmed, confirmationTimer } = useConfirmation(5);
  const [submit, { data, isLoading, reset }] =
    useUpdateReactionsForChatMutation();
  const snackbar = useSnackbar();

  const [currentTrigger, setCurrentTrigger] = useState(textTrigger);
  const [currentReaction, setCurrentReaction] = useState(reaction);
  const [currentCallDuty, setCurrentCallDuty] = useState(callDuty);
  const [currentDutyTag, setCurrentDutyTag] = useState(dutyTag);
  const [currentEnabled, setCurrentEnabled] = useState(enabled);

  useEffect(() => {
    setCurrentTrigger(textTrigger);
  }, [textTrigger]);

  useEffect(() => {
    setCurrentReaction(reaction);
  }, [reaction]);

  useEffect(() => {
    setCurrentEnabled(enabled);
  }, [enabled]);

  useEffect(() => {
    setCurrentCallDuty(!!callDuty);
  }, [callDuty]);

  useEffect(() => {
    setCurrentDutyTag(dutyTag ?? null);
  }, [dutyTag]);

  const modified =
    currentTrigger !== textTrigger ||
    currentReaction !== reaction ||
    currentEnabled !== enabled ||
    currentCallDuty !== callDuty ||
    currentDutyTag !== dutyTag;

  useEffect(() => {
    if (data?.success) {
      snackbar({
        message: 'Реакция обновлена',
        before: <Icon24ErrorCircle fill="var(--vkui--color_icon_accent)" />,
      });
    }
  }, [data, snackbar]);

  useEffect(() => reset);

  return (
    <ModifiableCell
      modified={modified}
      overTitle="Реакция"
      subtitle={
        <Div>
          <Input
            disabled={isLoading}
            value={currentTrigger}
            onBlur={() => setCurrentTrigger((prev) => prev.trim())}
            onChange={({ target: { value } }) => setCurrentTrigger(value)}
          />
        </Div>
      }
      bottom={
        <>
          <Div style={{ paddingBottom: 0 }}>
            <Textarea
              disabled={isLoading}
              value={currentReaction}
              onBlur={() => setCurrentReaction((prev) => prev.trim())}
              onChange={({ target: { value } }) => setCurrentReaction(value)}
            />
          </Div>
          <ReactionCallDuty
            callDuty={currentCallDuty}
            setCallDuty={setCurrentCallDuty}
            tag={currentDutyTag}
            setTag={setCurrentDutyTag}
          />
        </>
      }
      enabled={currentEnabled}
      setEnabled={setCurrentEnabled}
      onSave={() => {
        submit({
          id,
          chatId,
          textTrigger: currentTrigger,
          reaction: currentReaction,
          enabled: currentEnabled,
          callDuty: currentCallDuty || false,
          dutyTag: currentDutyTag || '',
        });
      }}
      onReset={() => {
        setCurrentTrigger(textTrigger);
        setCurrentReaction(reaction);
        setCurrentEnabled(enabled);
        setCurrentCallDuty(callDuty);
        setCurrentDutyTag(dutyTag);
      }}
      onRemove={() => {
        if (confirmed) {
          submit({
            chatId,
            id,
            textTrigger: '',
            reaction: '',
            callDuty,
            dutyTag: '',
            enabled,
          });
        }

        setConfirmed(true);
      }}
      removeConfirmed={confirmed}
      confirmationTimer={confirmationTimer}
      isLoading={isLoading}
    >
      <Text
        style={{
          fontWeight: 400,
          color: 'var(--vkui--color_text_secondary)',
          fontSize: 'var(--vkui--font_subhead--font_size--compact)',
        }}
      >
        Триггер
      </Text>
    </ModifiableCell>
  );
};

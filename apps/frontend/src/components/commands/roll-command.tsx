import { FormItem, Input, Radio, Text, Textarea } from '@vkontakte/vkui';

import { ChangeEventHandler, FC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  CommandComponentProps,
  rollCommandDraftSelector,
  SelectionType,
  setRollState,
} from '../../data/reducers/commands';
import { useChatMembers } from '../../hooks/useChatMembers';
import { MemberPicker } from '../member-picker';

export const RollCommand: FC<CommandComponentProps> = ({ id }) => {
  const dispatch = useDispatch();
  const members = useChatMembers();

  const { name, phrase, selection, usersList } = useSelector(
    rollCommandDraftSelector(id),
  );

  const changeSelection = useCallback(
    (target: SelectionType): ChangeEventHandler<HTMLInputElement> =>
      ({ target: { checked } }) => {
        dispatch(
          setRollState({
            id,
            selection: checked
              ? target === 'members'
                ? 'members'
                : 'custom'
              : target === 'custom'
              ? 'members'
              : 'custom',
          }),
        );
      },
    [dispatch, id],
  );

  const membersEnough = selection === 'members' || usersList.length >= 2;
  const isValid = phrase && membersEnough;

  return (
    <>
      <Radio
        description={`Из всех участников чата (${members.length})`}
        checked={selection === 'members'}
        onChange={changeSelection('members')}
      />
      <Radio
        description={`Из списка (${usersList.length})`}
        checked={selection === 'custom'}
        onChange={changeSelection('custom')}
      />

      {selection === 'custom' && (
        <FormItem top="Список участников для выбора случайного человека">
          <MemberPicker
            members={members}
            selectedMembers={usersList}
            onChange={(value) => {
              dispatch(setRollState({ id, usersList: value }));
            }}
            placeholder="Участник"
            closeAfterSelect={false}
          />
        </FormItem>
      )}

      <FormItem
        top="Фраза"
        bottom="Фраза, с которой будет заменшенен случайный пользователь"
      >
        <Textarea
          value={phrase}
          onChange={({ target: { value } }) => {
            dispatch(setRollState({ id, phrase: value }));
          }}
        />
      </FormItem>

      {isValid && (
        <FormItem topMultiline top={`Результат при запуске /roll${name ? ` ${name}` : ''}`}>
          <Text style={{ wordWrap: "normal", whiteSpace: "pre-wrap" }}>
            {phrase}{' '}
            <Text
              style={{
                display: 'inline',
                color: 'var(--vkui--color_accent_blue)',
                fontWeight: 'bold',
                fontSize: 'inherit',
              }}
            >
              @id-счастливчика
            </Text>
          </Text>
        </FormItem>
      )}
    </>
  );
};

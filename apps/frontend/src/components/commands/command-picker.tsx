import { ICommands } from '@vera-reforged/common';
import { CustomSelectOption, FormItem, Input, Select } from '@vkontakte/vkui';

import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  CommandType,
  RollCommandCompositeId,
  rollCommandDraftSelector,
  setRollState,
  setSelectedCmd,
} from '../../data/reducers/commands';
import { Member } from '../../data/types';
import { ChatMembersProvider } from '../../hooks/useChatMembers';
import { availableCommands } from './available-commands';

type Props = {
  commandId: RollCommandCompositeId;
  members: Member[];
  command?: ICommands.CommandsNames;
  commandSelectDisabled?: boolean;
};

export const CommandPicker: FC<Props> = ({
  commandId,
  members,
  command,
  commandSelectDisabled,
}) => {
  const dispatch = useDispatch();
  const { name } = useSelector(rollCommandDraftSelector(commandId));

  return (
    <>
      <FormItem>
        <Select
          key={command}
          searchable
          placeholder="Не выбрана"
          value={command}
          disabled={commandSelectDisabled}
          onChange={({ target }) => {
            if (commandSelectDisabled) {
              return;
            }

            dispatch(setSelectedCmd(target.value as CommandType['value']));
          }}
          options={availableCommands}
          renderOption={({ option: { description }, ...rest }) => (
            <CustomSelectOption {...rest} description={description} />
          )}
        />
      </FormItem>

      {!!command && (
        <FormItem
          topMultiline
          top={`Если указать что-то, например "test", то такую команду можно будет вызвать исключительно сообщением, содержащим "/${command} test".`}
        >
          <Input
            placeholder="Опциональный идентификатор команды"
            value={name}
            onChange={({ target: { value } }) => {
              const valueWithoutSpaces = value?.replaceAll(' ', '');
              dispatch(
                setRollState({ id: commandId, name: valueWithoutSpaces }),
              );
            }}
          />
        </FormItem>
      )}

      <ChatMembersProvider members={members}>
        {availableCommands.map(({ value, description, Component }) => {
          if (command === value) {
            return (
              <FormItem top={description} key={value}>
                <Component id={commandId} />
              </FormItem>
            );
          }

          return null;
        })}
      </ChatMembersProvider>
    </>
  );
};

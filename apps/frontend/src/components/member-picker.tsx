import { Avatar, Chip, ChipsSelect, CustomSelectOption } from '@vkontakte/vkui';

import { CSSProperties, FC } from 'react';

import { Member } from '../data/types';

type Props = {
  selectedMembers: Member[];
  placeholder?: string;
  members: Member[];
  closeAfterSelect?: boolean;
  onChange: (members: Member[]) => void;
  chipsSelectStyle?: CSSProperties;
  chipsStyle?: CSSProperties;
};

export const MemberPicker: FC<Props> = ({
  selectedMembers,
  placeholder,
  closeAfterSelect,
  chipsSelectStyle,
  chipsStyle,
  members,
  onChange,
}) => {
  return (
    <ChipsSelect
      style={chipsSelectStyle}
      closeAfterSelect={closeAfterSelect}
      placeholder={placeholder}
      value={selectedMembers}
      onChange={onChange}
      options={members}
      renderChip={(props, { avatar }) => {
        if (!props) {
          return;
        }

        const { value, label: _label, ...rest } = props;

        return (
          <Chip
            style={chipsStyle}
            value={value}
            before={<Avatar size={20} src={avatar} />}
            {...rest}
          >
            {props?.label}
          </Chip>
        );
      }}
      renderOption={(props, { avatar, username, userId }) => {
        return (
          <CustomSelectOption
            before={<Avatar size={20} src={avatar} />}
            description={`${username} (${userId})`}
            {...props}
          />
        );
      }}
      filterFn={(input = '', option) => {
        if (!option) {
          return false;
        }

        input = input.toLowerCase();

        const { username, userId, label } = option;

        return !!(
          (username ?? '').toLowerCase().includes(input) ||
          userId.toString().includes(input) ||
          `${label}`.toLowerCase().includes(input)
        );
      }}
    />
  );
};

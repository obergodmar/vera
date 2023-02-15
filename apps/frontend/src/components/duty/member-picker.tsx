import {
  Avatar,
  Chip,
  CustomSelectOption,
  unstable_ChipsSelect as ChipsSelect,
} from '@vkontakte/vkui';

import { FC } from 'react';

import { Member } from '../../data/services/duty-api';

type Props = {
  duties: Member[];
  members: Member[];
  onChange: (members: Member[]) => void;
};

export const MemberPicker: FC<Props> = ({ duties, members, onChange }) => {
  return (
    <ChipsSelect
      style={{
        width: '100%',
      }}
      placeholder="Дежурный"
      value={duties}
      onChange={onChange}
      options={members}
      showSelected={false}
      renderChip={(props) => {
        if (!props) {
          return;
        }

        const {
          value,
          label,
          option: { avatar },
          ...rest
        } = props;

        return (
          <Chip
            value={value}
            before={<Avatar size={20} src={avatar} />}
            {...rest}
          >
            {props?.label}
          </Chip>
        );
      }}
      renderOption={({ option: { avatar, screenName }, ...otherProps }) => {
        return (
          <CustomSelectOption
            before={<Avatar size={20} src={avatar} />}
            description={screenName}
            {...otherProps}
          />
        );
      }}
    />
  );
};

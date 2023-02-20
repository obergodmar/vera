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
    <div
      style={{
        width: '100%',
        height: '36px',
        position: 'relative',
      }}
    >
      <ChipsSelect
        style={{
          zIndex: 1,
          top: 0,
          left: 0,
          position: 'absolute',
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
              style={{ maxWidth: '70%' }}
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
    </div>
  );
};

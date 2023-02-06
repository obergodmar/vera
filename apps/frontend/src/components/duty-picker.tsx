import {
  Avatar,
  Chip,
  CustomSelectOption,
  unstable_ChipsSelect as ChipsSelect,
} from '@vkontakte/vkui';
import { ChipOption } from '@vkontakte/vkui/dist/components/Chip/Chip';

import { FC } from 'react';

type Props = {
  members: ChipOption[];
};

export const DutyPicker: FC<Props> = ({ members }) => {
  return (
    <ChipsSelect
      style={{
        width: '100%',
      }}
      placeholder="Дежурный"
      value={[]}
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
      renderOption={({ option: { avatar, username }, ...otherProps }) => {
        return (
          <CustomSelectOption
            before={<Avatar size={20} src={avatar} />}
            description={username}
            {...otherProps}
          />
        );
      }}
    />
  );
};

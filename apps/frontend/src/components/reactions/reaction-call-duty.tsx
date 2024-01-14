import { TAG_MAX_WIDTH } from '@vera-reforged/common';
import { Icon16Hashtag } from '@vkontakte/icons';
import { Checkbox, FormItem, Input, Text } from '@vkontakte/vkui';

import { Dispatch, FC, SetStateAction } from 'react';

type Props = {
  callDuty: boolean | null;
  setCallDuty: Dispatch<SetStateAction<boolean | null>>;

  tag: string | null;
  setTag: Dispatch<SetStateAction<string | null>>;
};

export const ReactionCallDuty: FC<Props> = ({
  callDuty,
  setCallDuty,
  tag,
  setTag,
}) => {
  return (
    <FormItem>
      <Checkbox
        checked={!!callDuty}
        onChange={({ target: { checked } }) => setCallDuty(checked)}
      >
        Вызывать дежурных для этого чата при отправке реакции
      </Checkbox>

      {callDuty && (
        <Input
          style={{ top: '5px' }}
          before={
            <Text
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                maxHeight: '16px',
                padding: '10px',
              }}
            >
              <Icon16Hashtag />
              Тег
            </Text>
          }
          placeholder="Без тега"
          value={tag || ''}
          maxLength={TAG_MAX_WIDTH}
          onChange={({ target: { value } }) => setTag(value)}
        />
      )}
    </FormItem>
  );
};

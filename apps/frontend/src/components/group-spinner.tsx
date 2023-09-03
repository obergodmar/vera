import { Spinner } from '@vkontakte/vkui';

import { FC } from 'react';

export const GroupSpinner: FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        paddingBottom: '16px',
      }}
    >
      <Spinner size="regular" />
    </div>
  );
};

import { Icon16DoorEnterArrowRightOutline } from '@vkontakte/icons';
import {
  Avatar,
  Group,
  IconButton,
  Input,
  Panel,
  Placeholder,
  SplitCol,
  SplitLayout,
  Text,
} from '@vkontakte/vkui';

import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { logOff } from '../data/reducers/authorization';

const veraAvatarSrc =
  'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2236%22%20r%3D%2218%22%20fill%3D%22%236b7280%22%2F%3E%3Cpath%20d%3D%22M18%2088a32%2032%200%200%201%2064%200%22%20fill%3D%22%236b7280%22%2F%3E%3C%2Fsvg%3E';

export const Login: FC = () => {
  const dispatch = useDispatch();
  const [password, setPassword] = useState('');

  // useEffect(() => {}, []);

  useEffect(() => {
    dispatch(logOff());
  }, [dispatch]);

  return (
    <SplitLayout style={{ justifyContent: 'center' }}>
      <SplitCol fixed width={280} maxWidth={280}>
        <Panel centered>
          <Group>
            <Placeholder
              icon={<Avatar src={veraAvatarSrc} size={100} />}
              header="Вера"
              action={
                <Input
                  style={{
                    maxWidth: '196px',
                  }}
                  placeholder="Введите пароль"
                  type="password"
                  value={password}
                  onChange={({ target: { value } }) => setPassword(value)}
                  after={
                    password.length > 0 && (
                      <IconButton
                        hoverMode="opacity"
                        aria-label="Авторизоваться"
                        onClick={() => undefined}
                      >
                        <Icon16DoorEnterArrowRightOutline />
                      </IconButton>
                    )
                  }
                />
              }
            >
              <Text>Панель управления</Text>
            </Placeholder>
          </Group>
        </Panel>
      </SplitCol>
    </SplitLayout>
  );
};

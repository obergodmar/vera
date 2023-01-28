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

import { VERA_AVATAR_100 } from '../data/constants';
import { logOff } from '../data/reducers/authorization';

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
              icon={<Avatar src={VERA_AVATAR_100} size={100} />}
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

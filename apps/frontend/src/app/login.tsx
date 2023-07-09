import {
  Avatar,
  Button,
  FormLayoutGroup,
  Group,
  Input,
  Panel,
  Placeholder,
  SplitCol,
  SplitLayout,
  Text,
} from '@vkontakte/vkui';

import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { VERA_AVATAR_100 } from '../data/constants';
import { authorize, logOff } from '../data/reducers/authorization';
import { useLoginMutation } from '../data/services/login-api';
import { useSnackbar } from '../hooks/useSnackbar';

export const Login: FC = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const dispatch = useDispatch();
  const [password, setPassword] = useState('');

  const [loginRequest, loginResult] = useLoginMutation();

  useEffect(() => {
    if (loginResult.status === 'fulfilled' && loginResult.data.token) {
      dispatch(
        authorize({
          token: loginResult.data.token,
        })
      );

      navigate('/', { replace: true });
    }
  }, [loginResult, dispatch, navigate, snackbar]);

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
                <FormLayoutGroup mode="vertical">
                  <Input
                    style={{
                      maxWidth: '196px',
                    }}
                    placeholder="Введите пароль"
                    type="password"
                    value={password}
                    onChange={({ target: { value } }) => setPassword(value)}
                    onKeyDown={({ key }) => {
                      if (key !== 'Enter' || loginResult.isLoading) {
                        return;
                      }

                      loginRequest(password);
                    }}
                  />

                  <Button
                    style={{ top: '10px' }}
                    size="m"
                    stretched
                    onClick={() => loginRequest(password)}
                  >
                    Авторизоваться
                  </Button>
                </FormLayoutGroup>
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

import { Config, Connect } from '@vkontakte/superappkit';
import {
  Avatar,
  Button,
  FormLayoutGroup,
  Group,
  Panel,
  Placeholder,
  SplitCol,
  SplitLayout,
  Text,
} from '@vkontakte/vkui';

import { FC, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { VERA_AVATAR_100 } from '../data/constants';
import { authorize, logOff } from '../data/reducers/authorization';
import { useAuthorizeMutation } from '../data/services/auth-api';
import { useSnackbar } from '../hooks/useSnackbar';

Config.init({ appId: parseInt(import.meta.env.VITE_APP_ID) });

export const Login: FC = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const dispatch = useDispatch();

  const [authRequest, authResult] = useAuthorizeMutation();

  useEffect(() => {
    if (
      authResult.status === 'fulfilled' &&
      authResult.data.token &&
      authResult.data.user
    ) {
      dispatch(
        authorize({
          token: authResult.data.token,
          user: authResult.data.user,
        }),
      );

      navigate('/', { replace: true });
    }
  }, [authResult, dispatch, navigate]);

  const authHandler = useCallback(async () => {
    try {
      const data = await Connect.userVisibleAuth();

      if (data.provider === 'vk' && data.payload.auth) {
        authRequest({ data: data.payload });
      }
    } catch (err: unknown) {
      snackbar({
        message: 'Что-то пошло не так',
      });
      console.error(err);
    }
  }, [authRequest, snackbar]);

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
                  <Button
                    style={{ top: '10px' }}
                    size="m"
                    stretched
                    onClick={authHandler}
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

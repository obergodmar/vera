import * as VKID from '@vkid/sdk';
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
import { useNavigate, useSearchParams } from 'react-router-dom';

import { VERA_AVATAR_100 } from '../data/constants';
import { authorize, logOff } from '../data/reducers/authorization';
import { useAuthorizeMutation } from '../data/services/auth-api';
import { useSnackbar } from '../hooks/useSnackbar';

VKID.Config.init({
  app: parseInt(import.meta.env.VITE_APP_ID),
  redirectUrl: import.meta.env.VITE_LOGIN_REDIRECT_URL,
});

export const Login: FC = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const dispatch = useDispatch();

  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const deviceId = searchParams.get('device_id');

  const [authRequest, authResult] = useAuthorizeMutation();

  useEffect(() => {
    if (!code || !deviceId) {
      return;
    }

    window.history.replaceState({}, document.title, window.location.pathname);
    const makeInternalAuthRequest = async () => {
      try {
        const { access_token: accessToken } = await VKID.Auth.exchangeCode(
          code,
          deviceId,
        );
        authRequest({
          data: {
            accessToken,
          },
        });
      } catch (err: unknown) {
        console.error(err);
      }
    };

    makeInternalAuthRequest();
  }, [authRequest, code, deviceId, snackbar]);

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

  useEffect(() => {
    dispatch(logOff());
  }, [dispatch]);

  const authHandler = useCallback(async () => {
    try {
      await VKID.Auth.login();
    } catch (err: unknown) {
      snackbar({
        message: 'Что-то пошло не так',
      });
      console.error(err);
    }
  }, [snackbar]);

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

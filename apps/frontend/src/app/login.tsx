import { generateRandomString } from '@vera-reforged/common';
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

import { FC, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { VERA_AVATAR_100 } from '../data/constants';
import { authorize, logOff } from '../data/reducers/authorization';
import { useAuthorizeMutation } from '../data/services/auth-api';
import { useSnackbar } from '../hooks/useSnackbar';

declare global {
  interface Window {
    __ENV__: {
      appId: string;
      redirectUri: string;
    };
  }
}

VKID.Config.init({
  app: parseInt(window.__ENV__.appId),
  redirectUrl: window.__ENV__.redirectUri,
  mode: VKID.ConfigAuthMode.InNewTab,
  responseMode: VKID.ConfigResponseMode.Callback,
});

export const Login: FC = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const dispatch = useDispatch();

  const [isVKAuthLoading, setVKAuthLoading] = useState(false);
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

  useEffect(() => {
    dispatch(logOff());
  }, [dispatch]);

  const authHandler = useCallback(async () => {
    setVKAuthLoading(true);
    const codeVerifier = generateRandomString();
    VKID.Config.update({
      codeVerifier,
    });

    try {
      const res = await VKID.Auth.login();
      if (
        !res ||
        typeof res !== 'object' ||
        !(
          'code' in res &&
          typeof res.code === 'string' &&
          'device_id' in res &&
          typeof res.device_id === 'string'
        )
      ) {
        console.error(res);
        throw new Error('Invalid response');
      }

      const { code, device_id } = res;
      authRequest({
        data: {
          code,
          device_id,
          code_verifier: codeVerifier,
        },
      });
    } catch (err: unknown) {
      snackbar({
        message: 'Что-то пошло не так',
      });
      console.error(err);
    } finally {
      setVKAuthLoading(false);
    }
  }, [authRequest, snackbar]);

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
                    loading={isVKAuthLoading || authResult.isLoading}
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

import { generateRandomString, IApi } from '@vera-reforged/common';
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

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { VERA_AVATAR_100 } from '../data/constants';
import { authorize, logOff } from '../data/reducers/authorization';
import { useAuthorizeMutation } from '../data/services/auth-api';
import { useSnackbar } from '../hooks/useSnackbar';

type TelegramAuthData = IApi.IAuthApi.TelegramAuthData;

declare global {
  interface Window {
    __ENV__: {
      appId: string;
      redirectUri: string;
      botPlatform: 'vk' | 'telegram';
      telegramBotName: string;
    };
    TelegramLoginCallback: (user: TelegramAuthData) => void;
  }
}

const isTelegram = window.__ENV__?.botPlatform === 'telegram';

if (!isTelegram) {
  VKID.Config.init({
    app: parseInt(window.__ENV__.appId),
    redirectUrl: window.__ENV__.redirectUri,
    mode: VKID.ConfigAuthMode.InNewTab,
    responseMode: VKID.ConfigResponseMode.Callback,
  });
}

const TelegramLoginButton: FC<{ onAuth: (data: TelegramAuthData) => void }> = ({
  onAuth,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    window.TelegramLoginCallback = onAuth;

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', window.__ENV__.telegramBotName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'TelegramLoginCallback(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;
    container.appendChild(script);

    return () => {
      delete (window as Partial<Window>).TelegramLoginCallback;
      container.innerHTML = '';
    };
  }, [onAuth]);

  return <div ref={containerRef} />;
};

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

  const telegramAuthHandler = useCallback(
    (data: TelegramAuthData) => {
      authRequest({ data });
    },
    [authRequest],
  );

  return (
    <SplitLayout style={{ justifyContent: 'center' }}>
      <SplitCol fixed width={280} maxWidth={280}>
        <Panel centered>
          <Group>
            <Placeholder
              icon={<Avatar src={VERA_AVATAR_100} size={100} />}
              title="Вера"
              action={
                <FormLayoutGroup mode="vertical">
                  {isTelegram ? (
                    <TelegramLoginButton onAuth={telegramAuthHandler} />
                  ) : (
                    <Button
                      style={{ top: '10px' }}
                      size="m"
                      stretched
                      onClick={authHandler}
                      loading={isVKAuthLoading || authResult.isLoading}
                    >
                      Авторизоваться
                    </Button>
                  )}
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

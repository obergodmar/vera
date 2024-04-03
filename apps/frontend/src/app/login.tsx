import { Config, Connect, VKSilentAuthPayload } from '@vkontakte/superappkit';
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

import { FC, useCallback, useEffect, useState } from 'react';
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
  const [password, setPassword] = useState('');

  const [authRequest, authResult] = useAuthorizeMutation();

  useEffect(() => {
    if (authResult.status === 'fulfilled' && authResult.data.token) {
      dispatch(
        authorize({
          token: authResult.data.token,
        }),
      );

      navigate('/', { replace: true });
    }
  }, [authResult, dispatch, navigate, snackbar]);

  const authHandler = useCallback(async () => {
    try {
      const data = await Connect.userVisibleAuth();

      if (data.provider === 'vk' && data.payload.auth) {
        console.log(data);
        return authRequest({ data: data.payload });

        // return loadSuperAppToken(data.payload)
        //   .then((result) => {
        //     Config.setSuperAppToken(result.superapp_token);
        //     Config.setSuperAppToken(result.superapp_token_v2, { version: 2 });
        //
        //     console.log('auth success! ' + result.superapp_token);
        //   })
        //   .catch((err) => {
        //     console.error(err);
        //   });
      }
    } catch (err: unknown) {
      console.error(err);
    }
  }, []);

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

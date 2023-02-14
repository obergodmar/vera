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
import { useAuthorizeMutation } from '../data/services/login-api';
import { useSnackbar } from '../hooks/useSnackbar';
import { isFetchBaseQueryError } from '../utils/isFetchBaseQueryError';

export const Login: FC = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const dispatch = useDispatch();
  const [password, setPassword] = useState('');

  const [authorizeRequest, authorizeResult] = useAuthorizeMutation();

  useEffect(() => {
    if (authorizeResult.status === 'fulfilled' && authorizeResult.data.token) {
      dispatch(
        authorize({
          token: authorizeResult.data.token,
        })
      );

      navigate('/', { replace: true });
    }

    if (
      authorizeResult.status === 'rejected' &&
      isFetchBaseQueryError(authorizeResult.error)
    ) {
      console.log(authorizeResult);
      snackbar({
        // @ts-expect-error data error exists
        message: authorizeResult.error.data?.error || 'Ошибка',
      });
    }
  }, [authorizeResult, dispatch, navigate, snackbar]);

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
                      if (key !== 'Enter' || authorizeResult.isLoading) {
                        return;
                      }

                      authorizeRequest(password);
                    }}
                  />

                  <Button
                    style={{ top: '10px' }}
                    size="m"
                    stretched
                    onClick={() => authorizeRequest(password)}
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

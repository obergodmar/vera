import { Icon20RefreshOutline } from '@vkontakte/icons';
import {
  Avatar,
  CustomSelectOption,
  FormItem,
  FormLayoutGroup,
  Group,
  Header,
  IconButton,
  PanelSpinner,
  Select,
} from '@vkontakte/vkui';
import { TextTooltip } from '@vkontakte/vkui/dist/components/TextTooltip/TextTooltip';

import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setCurrentChatId, setDutyFromConfig } from '../../data/reducers/duty';
import {
  useGetDutyChatsQuery,
  useGetDutyConfigQuery,
} from '../../data/services/duty-api';
import { RootState } from '../../data/store';
import { Days } from './days';

export const Panel: FC = () => {
  const dispatch = useDispatch();

  const {
    isLoading: isConfigLoading,
    data: configResponse,
    // refetch: refetchConfig,
  } = useGetDutyConfigQuery();

  useEffect(() => {
    if (configResponse) {
      dispatch(setDutyFromConfig(configResponse));
    }
  }, [configResponse, dispatch]);

  const {
    isLoading: isChatsLoading,
    data: chats,
    refetch: refetchChats,
  } = useGetDutyChatsQuery();
  const chatId = useSelector((state: RootState) => state.duty.currentChatId);

  if (isConfigLoading || !configResponse || isChatsLoading || !chats) {
    return <PanelSpinner />;
  }

  return (
    <>
      <Group>
        <Header>Установка дежурства в чаты</Header>

        <FormLayoutGroup
          mode="horizontal"
          style={{ display: 'flex', gap: '10px' }}
        >
          <FormItem
            top="Чат"
            bottom="Чтобы чат появился в списке, достаточно один раз написать duty в чат, где Вера установлена администратором"
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Select
                value={chatId}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  dispatch(setCurrentChatId(id));
                }}
                placeholder="Не выбран"
                options={chats}
                renderOption={({
                  option: { avatar, description },
                  ...restProps
                }) => (
                  <CustomSelectOption
                    {...restProps}
                    before={<Avatar size={24} src={avatar} />}
                    description={description}
                  />
                )}
              />

              <TextTooltip text="Обновить">
                <IconButton
                  aria-label="Обновить"
                  onClick={refetchChats}
                  style={{
                    minWidth: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--vkui--color_text_subhead)',
                  }}
                >
                  <Icon20RefreshOutline />
                </IconButton>
              </TextTooltip>
            </div>
          </FormItem>
        </FormLayoutGroup>
      </Group>

      {chatId && <Days peerId={chatId} />}
    </>
  );
};

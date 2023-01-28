import {
  Icon16Dropdown,
  Icon28AddOutline,
  Icon28CameraOutline,
} from '@vkontakte/icons';
import {
  Group,
  Header,
  Panel,
  PanelHeader,
  PanelHeaderButton,
  SimpleCell,
  SizeType,
  SplitCol,
  SplitLayout,
  Tabs,
  TabsItem,
  useAdaptivity,
  View,
  ViewWidth,
} from '@vkontakte/vkui';

import { FC } from 'react';

export const Content: FC = () => {
  const { viewWidth, sizeX } = useAdaptivity();

  return (
    <SplitLayout header={<PanelHeader separator={false} />}>
      <SplitCol spaced={viewWidth && viewWidth > ViewWidth.MOBILE}>
        <View activePanel="main">
          <Panel id="main">
            <PanelHeader
              before={
                <PanelHeaderButton>
                  <Icon28CameraOutline />
                </PanelHeaderButton>
              }
              after={
                <PanelHeaderButton>
                  <Icon28AddOutline />
                </PanelHeaderButton>
              }
              separator={sizeX === SizeType.REGULAR}
            >
              <Tabs>
                <TabsItem
                  after={<Icon16Dropdown />}
                  id="tab-news"
                  aria-controls="tab-content-news"
                >
                  Новости
                </TabsItem>
                <TabsItem
                  id="tab-recommendations"
                  aria-controls="tab-content-recommendations"
                >
                  Интересное
                </TabsItem>
              </Tabs>
            </PanelHeader>
            <Group header={<Header mode="secondary">Items</Header>}>
              <SimpleCell>Hello</SimpleCell>
              <SimpleCell>World</SimpleCell>
            </Group>
          </Panel>
        </View>
      </SplitCol>
    </SplitLayout>
  );
};

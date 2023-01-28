import {
  Avatar,
  Group,
  Panel,
  PanelHeader,
  SplitCol,
  SplitLayout,
  useAdaptivityConditionalRender,
  View,
} from '@vkontakte/vkui';

import { FC } from 'react';

import { Panels } from '../components/panels';

export const Content: FC = () => {
  const { viewWidth } = useAdaptivityConditionalRender();

  return (
    <SplitLayout
      style={{ justifyContent: 'center' }}
      header={<PanelHeader separator={false} />}
    >
      <Panels />

      <SplitCol width="100%" maxWidth="560px" stretchedOnMobile autoSpaced>
        <View activePanel="duty"></View>
      </SplitCol>
    </SplitLayout>
  );
};

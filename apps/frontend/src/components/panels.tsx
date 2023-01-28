import {
  Group,
  Panel,
  PanelHeader,
  SplitCol,
  useAdaptivityConditionalRender,
} from '@vkontakte/vkui';

import { FC } from 'react';

export const Panels: FC = () => {
  const { viewWidth } = useAdaptivityConditionalRender();

  return (
    <>
      {viewWidth.tabletPlus && (
        <SplitCol
          className={viewWidth.tabletPlus.className}
          fixed
          width={280}
          maxWidth={280}
        >
          <Panel>
            <PanelHeader />
            <Group></Group>
          </Panel>
        </SplitCol>
      )}
    </>
  );
};

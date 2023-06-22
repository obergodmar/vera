import { ReactNode } from 'react';

import { Panel as DutyPanel } from './duty/panel';
import { PanelCancel } from './duty/panel-cancel';
import { PanelSubmit } from './duty/panel-submit';
import { Panel as HelloMessagesPanel } from './hello-messages/panel';
import { NotImplementedPanel } from './not-implemented-panel';

export const panels: PanelItem[] = [
  {
    value: 'duty',
    label: 'Дежурные',
    content: <DutyPanel />,
    submit: <PanelSubmit />,
    cancel: <PanelCancel />,
  },
  {
    value: 'hello-messages',
    label: 'Приветственные сообщения',
    content: <HelloMessagesPanel />,
  },
  {
    value: 'commands',
    label: 'Команды',
    content: <NotImplementedPanel />,
  },
  {
    value: 'mentions',
    label: 'Меншены',
    content: <NotImplementedPanel />,
  },
];

export type PanelItem = {
  value: 'navigation' | 'mentions' | 'commands' | 'hello-messages' | 'duty';
  label: string;
  content: ReactNode;
  edit?: ReactNode;
  cancel?: ReactNode;
  submit?: ReactNode;
};

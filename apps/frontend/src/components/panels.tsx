import { ReactNode } from 'react';

import { DutyCancel } from './duty/duty-cancel';
import { DutyPanel } from './duty/duty-panel';
import { DutySubmit } from './duty/duty-submit';
import { HelloMessagesCancel } from './hello-messages/hello-messages-cancel';
import { HelloMessagesPanel } from './hello-messages/hello-messages-panel';
import { HelloMessagesSubmit } from './hello-messages/hello-messages-submit';
import { NotImplementedPanel } from './not-implemented-panel';

export const panels: PanelItem[] = [
  {
    value: 'duty',
    label: 'Дежурные',
    content: <DutyPanel />,
    submit: <DutySubmit />,
    cancel: <DutyCancel />,
  },
  {
    value: 'hello-messages',
    label: 'Приветственные сообщения',
    content: <HelloMessagesPanel />,
    submit: <HelloMessagesSubmit />,
    cancel: <HelloMessagesCancel />,
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

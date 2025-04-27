import { ReactNode } from 'react';

import { CommandsPanel } from './commands/commands-panel';
import { CronsPanel } from './crons/crons-panel';
import { DutyCancel } from './duty/duty-cancel';
import { DutyPanel } from './duty/duty-panel';
import { DutySubmit } from './duty/duty-submit';
import { HelloMessagesCancel } from './hello-messages/hello-messages-cancel';
import { HelloMessagesPanel } from './hello-messages/hello-messages-panel';
import { HelloMessagesSubmit } from './hello-messages/hello-messages-submit';
import { ReactionsPanel } from './reactions/reactions-panel';

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
    value: 'reactions',
    label: 'Реакции в сообщениях',
    content: <ReactionsPanel />,
  },
  {
    value: 'crons',
    label: 'Кроны',
    content: <CronsPanel />,
  },
  {
    value: 'commands',
    label: 'Команды',
    content: <CommandsPanel />,
  },
];

export type PanelItem = {
  value:
    | 'navigation'
    | 'reactions'
    | 'crons'
    | 'commands'
    | 'hello-messages'
    | 'duty';
  label: string;
  content: ReactNode;
  edit?: ReactNode;
  cancel?: ReactNode;
  submit?: ReactNode;
};

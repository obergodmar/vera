import { CommandType } from '../../data/reducers/commands';
import { RollCommand } from './roll-command';

export const availableCommands: CommandType[] = [
  {
    label: '/roll',
    value: 'roll',
    description: 'Вызвать случайного человека',
    Component: RollCommand,
  },
];

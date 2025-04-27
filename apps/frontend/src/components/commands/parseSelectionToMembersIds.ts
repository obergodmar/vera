import { RollCommandState } from '../../data/reducers/commands';

export function parseSelectionToMembersIds(
  selection: RollCommandState['selection'],
  usersList: RollCommandState['usersList'],
) {
  return selection === 'members'
    ? ''
    : usersList.map(({ value }) => value).join(',');
}

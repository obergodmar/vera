import { Config, Duties } from '@vera-reforged/common';

export function getDutiesFromConfig(config: Config, peerId: number): Duties {
  const {
    duties: { schedule: dutiesSchedule },
  } = config;

  return dutiesSchedule[peerId];
}

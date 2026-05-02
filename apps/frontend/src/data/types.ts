import { ChipOption } from '@vkontakte/vkui';

export type Member = ChipOption & {
  userId: number;
  firstName: string;
  lastName: string;
  avatar: string;
  username: string;
};

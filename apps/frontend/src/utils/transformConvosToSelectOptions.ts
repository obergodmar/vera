import { BotChat, IApi } from '@vera-reforged/common';
import { CustomSelectOptionInterface } from '@vkontakte/vkui';

export function transformConvosToSelectOptions(
  data: IApi.ConversationsList,
): CustomSelectOptionInterface[] {
  return data.items.map((item: BotChat) => ({
    label: item.title ?? '',
    value: item.id,
    avatar: item.photo,
    description: item.id,
  }));
}

import { IApi } from '@vera-reforged/common';
import { CustomSelectOptionInterface } from '@vkontakte/vkui';

export function transformConvosToSelectOptions(
  data: IApi.ConversationsList,
): CustomSelectOptionInterface[] {
  return (
    data.items.reduce((acc: CustomSelectOptionInterface[], item) => {
      const { chat_settings, peer } = item;

      if (!chat_settings || !peer?.id) {
        return acc;
      }
      const { title, photo } = chat_settings;

      acc.push({
        label: title ?? '',
        value: peer.id,
        avatar: photo?.photo_100,
        description: peer.id,
      });

      return acc;
    }, []) || []
  );
}

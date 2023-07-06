import { IApi } from '@vera-reforged/common';
import { CustomSelectOptionInterface } from '@vkontakte/vkui';

export function transformConvosToSelectOptions(
  data: IApi.ConversationsList
): CustomSelectOptionInterface[] {
  return (
    data.items.reduce((acc: CustomSelectOptionInterface[], item) => {
      const {
        chat_settings,
        peer: { id },
      } = item;

      if (!chat_settings) {
        return acc;
      }
      const { title, photo } = chat_settings;

      acc.push({
        label: title,
        value: id,
        avatar: photo?.photo_100,
        description: id,
      });

      return acc;
    }, []) || []
  );
}

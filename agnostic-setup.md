# agnostic-setup: план платформо-независимой архитектуры

## Цель

Полный рефакторинг с поддержкой ВКонтакте и Telegram как равноценных платформ бота.
Переменная окружения `BOT_PLATFORM=vk|telegram` определяет единственную активную платформу.
Все бизнес-сервисы работают через единый интерфейс `IBotPlatform`, не зная о конкретной платформе.
Фронтенд использует собственные унифицированные типы из `libs/common` — без прямой зависимости от VK API схемы.

---

## Ключевые ограничения Telegram vs VK

Прежде чем перейти к плану, важно зафиксировать принципиальные различия платформ, которые влияют на архитектуру:

| Функциональность               | VK                                          | Telegram                                                     |
| ------------------------------ | ------------------------------------------- | ------------------------------------------------------------ |
| Список чатов бота              | Live API: `messages.getConversationsById`   | Нет прямого API. **Кешируется в БД через поллинг.**          |
| Список участников чата         | Live API: `messages.getConversationMembers` | Нет прямого API для всех. **Кешируется в БД через поллинг.** |
| Профиль пользователя по ID     | Live API: `users.get`                       | Нет прямого API. **Кешируется в БД через поллинг.**          |
| Фильтр «общих чатов»           | Через user access token                     | Не применимо. Показываются все чаты бота из БД.              |
| Проверка членства в чате       | `messages.getConversationMembers`           | `getChatMember` Bot API                                      |
| Отправка сообщений             | `messages.send` + VK keyboard JSON          | `sendMessage` + Telegram inline keyboard                     |
| Формат упоминания пользователя | `@screen_name` или `@id{id}`                | `@username` или `[имя](tg://user?id={id})`                   |
| OAuth авторизация              | VK ID OAuth2 (code exchange)                | Telegram Login Widget (HMAC-SHA256 hash)                     |

---

## Декомпозиция по фазам

---

### Фаза 1 — Unified domain types в `libs/common`

Цель: убрать прямые зависимости `api.ts` от `@vkontakte/api-schema-typescript`.

#### 1.1 Новый файл: `libs/common/src/lib/bot-types.ts`

Определяет платформо-независимые доменные типы, используемые и бэкендом, и фронтендом.

```typescript
export interface BotChat {
  id: number;
  title: string;
  photo?: string;
  membersCount?: number;
}

export interface BotUser {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string; // screen_name у VK, @username у Telegram
  photo?: string; // photo_100 у VK, photo_url у Telegram
  mention?: string; // готовая строка для упоминания в сообщении
}

export interface BotChatList {
  count: number;
  items: BotChat[];
}

export interface BotChatMembers {
  count: number;
  items: BotUser[];
}
```

Экспортировать из `libs/common/src/index.ts`.

#### 1.2 Изменение: `libs/common/src/lib/api.ts`

- Убрать все импорты из `@vkontakte/api-schema-typescript`.
- Заменить `ConversationsList` (`{ count, items: MessagesConversation[] }`) → `BotChatList`.
- Заменить `IConvoApi.GetChatsResponse` → `BotChatList`.
- Заменить `IConvoApi.GetMembersForChatResponse` → `StatusResponse & BotChatMembers`.
- Заменить `IAuthApi.AuthResponse.user: UsersUser | TelegramUser` → `BotUser | null`.
  Тип `TelegramUser` удалить — он становится частью `BotUser`.
- Убрать `IApi.TelegramUser` (поглощается `BotUser`).
- `ConvoListWithMessages` (в `IHelloMessagesApi`): заменить `MessagesConversation` на `BotChat`.

После этих изменений `libs/common` перестаёт зависеть от VK-специфичных схем.

---

### Фаза 2 — Интерфейс `IBotPlatform` и его реализации (бэкенд)

#### 2.1 Новый файл: `apps/backend/src/bot-platform/IBotPlatform.ts`

Полный контракт, который реализуют обе платформы.

```typescript
import {
  BotChat,
  BotChatList,
  BotChatMembers,
  BotUser,
} from '@vera-reforged/common';
import { IApi } from '@vera-reforged/common';

export const BOT_PLATFORM = 'BOT_PLATFORM';

export interface IBotSendOptions {
  replyToMessageId?: number;
  keyboard?: IBotKeyboard;
}

export interface IBotKeyboard {
  oneTime?: boolean;
  buttons: Array<
    Array<{
      label: string;
      color?: 'positive' | 'negative' | 'primary' | 'secondary';
    }>
  >;
}

export interface IBotPlatform {
  readonly platform: 'vk' | 'telegram';

  // --- Messaging ---
  sendMessage(
    peerId: number,
    text: string,
    opts?: IBotSendOptions,
  ): Promise<void>;

  // --- Chats ---
  // accessToken: VK user token для фильтрации «общих» чатов; Telegram — игнорируется.
  getChats(accessToken?: string): Promise<BotChatList>;
  getChatMembers(chatId: number): Promise<BotChatMembers>;

  // --- Users ---
  getUsers(userIds: number[]): Promise<BotUser[]>;

  // --- Access control ---
  isMember(chatId: number, userId: number): Promise<boolean>;

  // --- Auth ---
  // Проверяет и верифицирует данные авторизации конкретной платформы.
  // Возвращает BotUser при успехе, null при ошибке.
  authorizeUser(
    data: IApi.IAuthApi.VkAuthData | IApi.IAuthApi.TelegramAuthData,
  ): Promise<BotUser | null>;

  // Верифицирует token при каждом запросе к API.
  // VK: проверяет access_token через users.get.
  // Telegram: token == session.token (hash), дополнительно проверяет членство в чате.
  validateToken(token: string, userId: number): Promise<boolean>;
}
```

#### 2.2 Новый файл: `apps/backend/src/bot-platform/vk-bot-platform.service.ts`

Инжектирует `VkApiService` и `ConfigService`.

Реализация методов:

- **`sendMessage`**: `vkApi.fetch('messages.send', { peer_id, message, random_id, group_id: 1, keyboard? })`.
  При наличии `opts.keyboard` — конвертировать `IBotKeyboard` → VK Keyboard JSON.
  Перенести логику из `BotSenderService.send()` для VK.

- **`getChats(accessToken)`**:
  Текущая логика из `convo.service.ts` — запросить список чатов через `messages.getConversationsById` с использованием сохранённых идентификаторов.
  Если пользователь в `adminChatId` — вернуть все чаты бота, иначе — только общие с ботом.
  Маппинг `MessagesConversation` → `BotChat`:
  - `peer.id` → `id`
  - `chat_settings.title` → `title`
  - `chat_settings.photo_100` → `photo`
  - `chat_settings.members_count` → `membersCount`

- **`getChatMembers(chatId)`**:
  `vkApi.fetch('messages.getConversationMembers', { peer_id: chatId, ... })`.
  Маппинг `UsersUser` → `BotUser`:
  - `id` → `id`
  - `first_name` → `firstName`
  - `last_name` → `lastName`
  - `screen_name` → `username`
  - `photo_100` → `photo`
  - `mention`: `@${screen_name}` если есть, иначе `@id${id}`

- **`getUsers(ids)`**: `vkApi.fetch('users.get', { user_ids: ids.join(',') })`. Маппинг тот же.

- **`isMember(chatId, userId)`**: `messages.getConversationMembers`, проверить наличие `userId` в `items`.

- **`authorizeUser(data: VkAuthData)`**:
  Текущая логика из `auth.service.ts#authorizeVk`:
  обмен code на access_token через `https://id.vk.ru/oauth2/auth`, затем `users.get`.
  Возвращает `BotUser`.

- **`validateToken(token, userId)`**:
  Текущая логика из `auth.middleware.ts#useVk`:
  вызов `users.get` с токеном, проверка `userId == user.id`.

#### 2.3 Новый файл: `apps/backend/src/bot-platform/telegram-bot-platform.service.ts`

Инжектирует `TelegramApiService`, `ConfigService`, TypeORM репозитории `TelegramChat` и `TelegramChatMember`.

Реализация методов:

- **`sendMessage`**: `telegramApi.sendMessage(chatId, text, opts)`.
  При наличии `opts.keyboard` — конвертировать `IBotKeyboard` → Telegram inline_keyboard JSON.
  Telegram не имеет аналога VK `one_time` keyboard для обычных чатов, `oneTime` игнорируется.

- **`getChats()`**: Запрос `TelegramChat` репозитория: `find({ where: { isActive: true } })`.
  Маппинг `TelegramChat` → `BotChat` (поля совпадают).
  `accessToken` игнорируется — фильтрация «общих чатов» для Telegram не применима.

- **`getChatMembers(chatId)`**: Запрос `TelegramChatMember` репозитория:
  `find({ where: { chatId, isActive: true } })`.
  Маппинг `TelegramChatMember` → `BotUser`:
  - `userId` → `id`
  - `firstName` → `firstName`
  - `lastName` → `lastName`
  - `username` → `username`
  - `photo` → `photo`
  - `mention`: `@${username}` если есть, иначе `[${firstName}](tg://user?id=${userId})`

- **`getUsers(ids)`**: Запрос `TelegramChatMember` репозитория: `find({ where: { userId: In(ids) } })`.
  Дедупликация по userId (один пользователь может быть в нескольких чатах).

- **`isMember(chatId, userId)`**: `telegramApi.call('getChatMember', { chat_id: chatId, user_id: userId })`.
  Проверить `status in ['member', 'administrator', 'creator']`.

- **`authorizeUser(data: TelegramAuthData)`**:
  Текущая логика из `auth.service.ts#authorizeTelegram`:
  верификация HMAC-SHA256 хэша, проверка `auth_date < 86400s`.
  Возвращает `BotUser` (маппинг из Telegram auth data).

- **`validateToken(token, userId)`**:
  Telegram токен = hash из виджета. Хранится в сессии неизменно.
  Метод просто возвращает `true` (токен уже был верифицирован при входе).
  Фактическая проверка доступа происходит через `isMember` в middleware.

#### 2.4 Новый файл: `apps/backend/src/bot-platform/bot-platform.module.ts`

```typescript
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([TelegramChat, TelegramChatMember]),
    VkApiModule, // уже глобальный, но явный импорт для ясности
  ],
  providers: [
    VkBotPlatformService,
    TelegramBotPlatformService,
    {
      provide: BOT_PLATFORM,
      useFactory: (config, vk, tg) =>
        config.get('botPlatform') === 'telegram' ? tg : vk,
      inject: [ConfigService, VkBotPlatformService, TelegramBotPlatformService],
    },
  ],
  exports: [BOT_PLATFORM],
})
export class BotPlatformModule {}
```

Добавить `BotPlatformModule` в импорты `AppModule`.

---

### Фаза 3 — Новые DB сущности для Telegram

Telegram не имеет API для получения списка чатов/участников,
поэтому они кешируются в БД в процессе поллинга.

#### 3.1 Новый файл: `apps/backend/src/bot-platform/entities/telegram-chat.entity.ts`

```typescript
@Entity('telegram_chats')
export class TelegramChat {
  @PrimaryColumn('bigint') id: number;
  @Column() title: string;
  @Column({ nullable: true }) photo?: string;
  @Column({ default: true }) isActive: boolean;
  @UpdateDateColumn() updatedAt: Date;
}
```

#### 3.2 Новый файл: `apps/backend/src/bot-platform/entities/telegram-chat-member.entity.ts`

```typescript
@Entity('telegram_chat_members')
// Composite PK: chatId + userId
export class TelegramChatMember {
  @PrimaryColumn('bigint') chatId: number;
  @PrimaryColumn('bigint') userId: number;
  @Column() firstName: string;
  @Column({ nullable: true }) lastName?: string;
  @Column({ nullable: true }) username?: string;
  @Column({ nullable: true }) photo?: string;
  @Column({ default: true }) isActive: boolean;
  @UpdateDateColumn() updatedAt: Date;
}
```

#### 3.3 Новая миграция

`apps/backend/src/database/migrations/XXXX-telegram-platform-tables.ts`

Создаёт таблицы `telegram_chats` и `telegram_chat_members` с соответствующими индексами.
Добавить в `migrations.json`.

---

### Фаза 4 — Обновление `TelegramPollingService`

`telegram-polling.service.ts` — основной источник данных для Telegram БД-кеша.

**Изменения:**

Инжектировать репозитории `TelegramChat` и `TelegramChatMember` (через TypeORM).

При обработке каждого `message` update:

- Если `chat.type` — `group` или `supergroup`:
  - Upsert `TelegramChat`: `{ id: chat.id, title: chat.title, isActive: true }`.
- Если `from` присутствует (пользователь, не бот):
  - Upsert `TelegramChatMember`: `{ chatId: chat.id, userId: from.id, firstName, lastName, username }`.

При обработке `my_chat_member` update:

- Если `new_chat_member.status` = `left` или `kicked`:
  - `UPDATE telegram_chats SET isActive = false WHERE id = chat.id`.

При обработке `new_chat_members` (новые участники):

- Upsert каждого нового участника в `TelegramChatMember` с `isActive: true`.

Примечание: `TelegramPollingModule` потребует импорта `TypeOrmModule.forFeature([TelegramChat, TelegramChatMember])`.

---

### Фаза 5 — Обновление бизнес-сервисов

Для каждого сервиса: заменить `@Inject(VkApiService)` на `@Inject(BOT_PLATFORM) private readonly bot: IBotPlatform`.
Убрать импорты `VkApiService` и VK-специфичных типов.

#### 5.1 `convo.service.ts`

Текущее: сложная логика с chunked batch `fetchMany`, `filterIds`, прямые типы VK.

После изменений:

- `getChats(req)`:

  ```typescript
  const isAdmin = await this.bot.isMember(this.adminChatId, sessionUser.id);
  return this.bot.getChats(isAdmin ? undefined : req.body.token);
  ```

  Вся логика батч-запросов и маппинга переезжает в `VkBotPlatformService`.

- `getMembersForChat(chatId)`:

  ```typescript
  return this.bot.getChatMembers(chatId);
  ```

  Маппинг переезжает в платформенные реализации.

- Убрать все хелперы `filterIds`, `chunkedFetchMany` — они остаются внутри VK-реализации.

#### 5.2 `duty.service.ts`

Текущее: `vkApi.fetch('messages.send')`, `vkApi.fetch('users.get')`.

После изменений:

- Отправка сообщения: `this.bot.sendMessage(peerId, text)`.
- Получение имён участников: `this.bot.getUsers([userId])` → `BotUser.firstName`, `BotUser.lastName`.
- Случайный выбор дежурного: если нужен участник конкретного чата — `this.bot.getChatMembers(chatId)`.
  Сейчас duty хранит `memberIds` в расписании из БД — `getUsers(memberIds)` достаточно.

#### 5.3 `hello-messages.service.ts`

Текущее: `vkApi.fetch('messages.send')`.

После изменений:

- Отправка сообщения: `this.bot.sendMessage(peerId, text)`.
- `getHelloMessages` возвращает `ConvoListWithMessages[]` — `BotChat & { helloMessage }`.
  Для получения метаданных чатов (title, photo): `this.bot.getChats()` → join с БД данными по `helloMessages`.

#### 5.4 `reactions.service.ts`

Текущее: уже использует `BotSenderService.send(event.backend, peerId, text)`.

После изменений:

- Заменить `BotSenderService` → `this.bot.sendMessage(peerId, text)`.
- Убрать параметр `backend` — платформа уже определена в `IBotPlatform`.

#### 5.5 `crons.service.ts`

Текущее: `vkApi.fetch('messages.send', { keyboard: VK_JSON_FORMAT })`.

После изменений:

- `this.bot.sendMessage(peerId, text, { keyboard: IBotKeyboard })`.
- Данные кнопок, хранящиеся в БД, нужно мигрировать из VK JSON → `IBotKeyboard` формат.
  **Важно**: существующие записи в БД имеют VK-специфичный keyboard JSON.
  Решение: при сохранении/чтении `CronEntity` конвертировать в/из `IBotKeyboard` на уровне сервиса.
  VK-реализация конвертирует `IBotKeyboard` → VK JSON при отправке.
  Telegram-реализация конвертирует `IBotKeyboard` → Telegram inline_keyboard при отправке.

#### 5.6 `commands.service.ts`

Текущее: `vkApi.fetch('messages.send')`, `vkApi.fetch('users.get')`, VK mention format.

После изменений:

- `this.bot.getUsers([userId])` → `BotUser`.
- Mention: использовать `BotUser.mention` (вычисляется платформой при маппинге).
- Отправка: `this.bot.sendMessage(peerId, text)`.
- Random member selection: `this.bot.getChatMembers(chatId)` вместо прямого VK запроса.

---

### Фаза 6 — Обновление `auth.service.ts` и `auth.middleware.ts`

#### 6.1 `auth.service.ts`

Текущее: два отдельных метода `authorizeVk` / `authorizeTelegram`.

После изменений:

- Инжектировать `BOT_PLATFORM` вместо `VkApiService` и `TelegramApiService`.
- `authorize(dto, req)`:

  ```typescript
  const botUser = await this.bot.authorizeUser(dto.data);
  if (!botUser) return { token: '', user: null, error: '...' };

  const isAllowed = await this.bot.isMember(this.accessChatId, botUser.id);
  if (!isAllowed) return { token: '', user: null, error: '...' };

  // token: для VK = access_token, для Telegram = hash из dto.data
  const token = this.extractToken(dto.data);
  sessionStore.createSession(req, { cookie, user: botUser, token });
  return { success: true, token, user: botUser };
  ```

- Логика `authorizeUser` (OAuth exchange для VK, hash verify для Telegram) уходит в платформы.
- Вспомогательный метод `extractToken(data)`: для `VkAuthData` — `access_token` из ответа oauth (нужно прокинуть его через `authorizeUser` → изменить сигнатуру на `Promise<{ user: BotUser; token: string } | null>`).

Уточнение по VK токену: `authorizeUser` для VK делает OAuth2 обмен и возвращает и user, и access_token. Изменить возвращаемый тип `IBotPlatform.authorizeUser` на:

```typescript
Promise<{ user: BotUser; token: string } | null>;
```

Для Telegram: `token` = `hash` из auth data.

#### 6.2 `auth.middleware.ts`

Текущее: раздельная логика для VK и Telegram через `botPlatform` ветвление.

После изменений:

- Инжектировать `BOT_PLATFORM`.
- Единый метод `use`:

  ```typescript
  const { user, token } = await getSession(sessionStore, session.id);
  if (body.token !== token) throw new Error('Token mismatch');

  const isValid = await this.bot.validateToken(token, user.id);
  if (!isValid) throw new Error('Invalid token');

  const isAllowed = await this.bot.isMember(this.accessChatId, user.id);
  if (!isAllowed) throw new Error('Not in access chat');
  ```

- Вся platform-specific логика в `validateToken` реализациях.

---

### Фаза 7 — Обновление фронтенда

#### 7.1 `apps/frontend/src/utils/transformConvosToSelectOptions.ts`

Текущее: читает VK-специфичные поля `chat_settings.photo_100`, `chat_settings.title`, `peer.id`.

После изменений: принимает `BotChatList`, читает `BotChat.id`, `BotChat.title`, `BotChat.photo`.
Убрать импорт `MessagesConversation` — только `BotChat` из `@vera-reforged/common`.

#### 7.2 `apps/frontend/src/data/types.ts`

Текущее:

```typescript
type Member = ChipOption & {
  userId: number;
  firstName: string;
  lastName: string;
  avatar: string;
  screenName: string; // VK-специфично
};
```

После изменений:

```typescript
type Member = ChipOption & {
  userId: number;
  firstName: string;
  lastName: string;
  avatar: string;
  username?: string; // screen_name у VK, @username у Telegram
};
```

#### 7.3 `apps/frontend/src/data/services/convo-api.ts`

Текущее: маппинг VK полей (`photo_100`, `screen_name`, `first_name`, `last_name`) → `Member`.

После изменений: маппинг `BotUser` → `Member`:

- `BotUser.photo` → `Member.avatar`
- `BotUser.username` → `Member.username`
- `BotUser.firstName` → `Member.firstName`
- `BotUser.lastName` → `Member.lastName`
- `BotUser.id` → `Member.userId`

Тип ответа `GetChatsResponse` → `BotChatList`, `GetMembersForChatResponse` → `BotChatMembers`.

#### 7.4 `apps/frontend/src/components/member-picker.tsx`

Текущее: фильтрация по `screenName`, `userId`, отображение `screen_name`.

После изменений:

- Фильтрация по `username` (вместо `screenName`).
- Отображение `username` вместо `screen_name`.
- Поле `Member.screenName` → `Member.username`.

#### 7.5 `apps/frontend/src/app/content.tsx`

Текущее: `user?.photo_100`, `user?.first_name`, `user?.last_name`.

После изменений: `BotUser.photo`, `BotUser.firstName`, `BotUser.lastName`.

#### 7.6 `apps/frontend/src/app/login.tsx`

Тип `window.__ENV__` — уже обновлён (`botPlatform`, `telegramBotName`).
`TelegramAuthData` в файле дублирует `IApi.IAuthApi.TelegramAuthData` из common — заменить на импорт из `@vera-reforged/common`.

---

### Фаза 8 — Cleanup

#### 8.1 Удалить `BotSenderService`

Логика `VkSend` переходит в `VkBotPlatformService.sendMessage`.
Логика `TelegramSend` переходит в `TelegramBotPlatformService.sendMessage`.
Убрать из `BotCoreModule` providers/exports.
Убрать инжект из `reactions.service.ts` (заменён на `IBotPlatform`).

#### 8.2 Обновить `BotCoreModule`

После удаления `BotSenderService` модуль экспортирует только:

- `BotEventBusService`
- `TelegramApiService`

`BotPlatformModule` становится отдельным глобальным модулем.

#### 8.3 Обновить `AppModule`

Добавить импорт `BotPlatformModule`.

---

## Полная карта изменений файлов

### Новые файлы

| Файл                                                                    | Описание                                                             |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `libs/common/src/lib/bot-types.ts`                                      | `BotChat`, `BotUser`, `BotChatList`, `BotChatMembers`                |
| `apps/backend/src/bot-platform/IBotPlatform.ts`                         | Интерфейс + `BOT_PLATFORM` токен + `IBotSendOptions`, `IBotKeyboard` |
| `apps/backend/src/bot-platform/vk-bot-platform.service.ts`              | VK реализация `IBotPlatform`                                         |
| `apps/backend/src/bot-platform/telegram-bot-platform.service.ts`        | Telegram реализация `IBotPlatform`                                   |
| `apps/backend/src/bot-platform/bot-platform.module.ts`                  | NestJS модуль с conditional provider                                 |
| `apps/backend/src/bot-platform/entities/telegram-chat.entity.ts`        | TypeORM entity для `telegram_chats`                                  |
| `apps/backend/src/bot-platform/entities/telegram-chat-member.entity.ts` | TypeORM entity для `telegram_chat_members`                           |
| `apps/backend/src/database/migrations/XXXX-telegram-platform-tables.ts` | Миграция для новых таблиц                                            |

### Изменяемые файлы

| Файл                                                            | Изменение                                                                          |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `libs/common/src/lib/api.ts`                                    | Убрать VK типы, использовать `BotChat`, `BotUser`, `BotChatList`, `BotChatMembers` |
| `libs/common/src/index.ts`                                      | Экспортировать `bot-types`                                                         |
| `apps/backend/src/app/app.module.ts`                            | Импорт `BotPlatformModule`                                                         |
| `apps/backend/src/bot-core/bot-core.module.ts`                  | Удалить `BotSenderService`                                                         |
| `apps/backend/src/bot-core/bot-sender.service.ts`               | Удалить файл                                                                       |
| `apps/backend/src/auth/auth.service.ts`                         | Использовать `IBotPlatform`                                                        |
| `apps/backend/src/auth/auth.module.ts`                          | Зависимости убрать (BotPlatformModule глобальный)                                  |
| `apps/backend/src/middlewares/auth.middleware.ts`               | Использовать `IBotPlatform`                                                        |
| `apps/backend/src/convo/convo.service.ts`                       | Использовать `IBotPlatform`                                                        |
| `apps/backend/src/duty/duty.service.ts`                         | Использовать `IBotPlatform`                                                        |
| `apps/backend/src/hello-messages/hello-messages.service.ts`     | Использовать `IBotPlatform`                                                        |
| `apps/backend/src/reactions/reactions.service.ts`               | Использовать `IBotPlatform`                                                        |
| `apps/backend/src/crons/crons.service.ts`                       | Использовать `IBotPlatform`                                                        |
| `apps/backend/src/commands/commands.service.ts`                 | Использовать `IBotPlatform`                                                        |
| `apps/backend/src/telegram-polling/telegram-polling.service.ts` | Upsert `TelegramChat` / `TelegramChatMember` при поллинге                          |
| `apps/backend/src/telegram-polling/telegram-polling.module.ts`  | Импорт TypeORM сущностей                                                           |
| `apps/frontend/src/utils/transformConvosToSelectOptions.ts`     | `BotChat` поля вместо VK полей                                                     |
| `apps/frontend/src/data/types.ts`                               | `screenName` → `username` в `Member`                                               |
| `apps/frontend/src/data/services/convo-api.ts`                  | Маппинг `BotUser` → `Member`                                                       |
| `apps/frontend/src/components/member-picker.tsx`                | Обновить поля фильтрации и отображения                                             |
| `apps/frontend/src/app/content.tsx`                             | `photo_100`/`first_name`/`last_name` → `BotUser` поля                              |
| `apps/frontend/src/app/login.tsx`                               | Импорт `TelegramAuthData` из common вместо локального типа                         |
| `env.example`                                                   | Уже обновлён                                                                       |
| `README.md`                                                     | Уже обновлён                                                                       |

---

## Порядок реализации (рекомендуемый)

1. **Фаза 3** — DB entities и миграция (независимы от остального).
2. **Фаза 1** — `bot-types.ts` + обновление `api.ts` (типы нужны всем остальным).
3. **Фаза 2** — `IBotPlatform`, VK и Telegram реализации, `BotPlatformModule`.
4. **Фаза 4** — Обновление `TelegramPollingService` (кеширование чатов/участников).
5. **Фаза 5** — Бизнес-сервисы (convo → duty → hello-messages → reactions → crons → commands).
6. **Фаза 6** — Auth service + middleware.
7. **Фаза 7** — Фронтенд.
8. **Фаза 8** — Cleanup.

---

## Открытые вопросы для уточнения перед реализацией

1. **Кнопки в crons**: данные кнопок уже хранятся в БД в VK JSON формате. Нужна ли миграция существующих данных в `IBotKeyboard` формат, или конвертация делается on-the-fly при чтении?
   Ответ: Миграция в новый формат не требуется, так как бота не в проде. Сразу начнем писать в новый формат.

2. **«Общие чаты» для Telegram**: при `BOT_PLATFORM=telegram` фронтенд будет видеть все чаты бота (без фильтрации «общих с пользователем»). Это приемлемо, или нужна дополнительная логика ограничения?
   Ответ: Бот должен видеть все чаты бота только если пользователь панели управления - админ, если он не админ, то тогда после получения чатов бота бэкенд должен дополнительно отфильтровать все чаты так, чтобы выдались только те, где есть данный пользователь, а не все чаты. Смотри то как это сделано для ВК.

3. **Фото пользователя в Telegram**: Telegram Login Widget возвращает `photo_url` только при определённых настройках приватности. Часть пользователей будет без фото — это ОК?
   Ответ: Да, это ок.

4. **`VkPollingModule` при `BOT_PLATFORM=telegram`**: сейчас оба поллинга всегда регистрируются в `AppModule`. Нужно ли при `BOT_PLATFORM=telegram` полностью отключать VK поллинг и наоборот? Или оставить текущее поведение (VK поллинг всегда работает, Telegram — только если `TELEGRAM_ENABLED=true`)?
   Ответ: Поллинг взаимозаменяем, как и в целом работоспособность бота. То есть если BOT_PLATFORM=telegram - ничего от ВК не работает, аналогично наоборот, если BOT_PLATFORM=vk, то телеграм не слушает, не отправляет и не работает. Это на данной итерации бота взаимозаменяемый функционал.

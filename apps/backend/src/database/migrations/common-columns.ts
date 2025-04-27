import { TableColumn } from 'typeorm';

export const withCreatedModifiedColumns = () => [
  new TableColumn({
    name: 'created',
    type: 'timestamp',
    isNullable: false,
    default: 'CURRENT_TIMESTAMP',
  }),
  new TableColumn({
    name: 'modified',
    type: 'timestamp',
    isNullable: false,
    default: 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  }),
];

export const withDefaultColumns = () => [
  new TableColumn({
    name: 'id',
    type: 'int',
    unsigned: true,
    isNullable: false,
    isGenerated: true,
    isPrimary: true,
    generationStrategy: 'increment',
  }),
  ...withCreatedModifiedColumns(),
];

export const withChatId = () =>
  new TableColumn({
    name: 'chatId',
    type: 'bigint',
    unsigned: true,
    isNullable: false,
  });

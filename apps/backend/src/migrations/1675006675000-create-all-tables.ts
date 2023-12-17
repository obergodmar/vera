import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { withChatId, withDefaultColumns } from './common-columns';

export class CreateAllTables1675006675000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    /**
     * Duty table
     */
    await queryRunner.createTable(
      new Table({
        name: 'duty',
        columns: [
          ...withDefaultColumns(),
          withChatId(),
          {
            name: 'userId',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'dayNumber',
            type: 'tinyint',
            isNullable: true,
            unsigned: true,
            default: 'null',
          },
          {
            name: 'timeFrom',
            type: 'char(5)',
            isNullable: true,
            default: 'null',
          },
          {
            name: 'timeTo',
            type: 'char(5)',
            isNullable: true,
            default: 'null',
          },
          {
            name: 'tag',
            type: 'varchar(50)',
            isNullable: true,
            default: 'null',
          },
        ],
      }),
    );
    /**
     * Crons table
     */
    await queryRunner.createTable(
      new Table({
        name: 'cron',
        columns: [
          ...withDefaultColumns(),
          withChatId(),
          {
            name: 'message',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'daysRange',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'timeAt',
            type: 'char(5)',
            isNullable: false,
          },
          {
            name: 'enabled',
            type: 'tinyint(1)',
            isNullable: true,
            default: null,
          },
          {
            name: 'buttons',
            type: 'text',
          },
        ],
      }),
    );
    /**
     * Reactions table
     */
    await queryRunner.createTable(
      new Table({
        name: 'reaction',
        columns: [
          ...withDefaultColumns(),
          withChatId(),
          {
            name: 'textTrigger',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'reaction',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'enabled',
            type: 'tinyint(1)',
            isNullable: false,
            default: '0',
          },
        ],
      }),
    );
    /**
     * Hello messages table
     */
    await queryRunner.createTable(
      new Table({
        name: 'hello_message',
        columns: [
          ...withDefaultColumns(),
          {
            name: 'message',
            type: 'text',
            isNullable: false,
          },
          {
            ...withChatId(),
            isUnique: true,
          },
        ],
      }),
    );
    /**
     * Settings table
     */
    await queryRunner.createTable(
      new Table({
        name: 'setting',
        columns: [
          ...withDefaultColumns(),
          {
            name: 'opt',
            type: 'varchar(150)',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'val',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('duty');
    await queryRunner.dropTable('cron');
    await queryRunner.dropTable('reaction');
    await queryRunner.dropTable('hello_message');
    await queryRunner.dropTable('setting');
  }
}

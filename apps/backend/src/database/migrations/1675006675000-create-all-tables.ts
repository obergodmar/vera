import { defaultSettings } from '@vera-reforged/common';

import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

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
          new TableColumn({
            name: 'userId',
            type: 'bigint',
            isNullable: false,
          }),
          new TableColumn({
            name: 'dayNumber',
            type: 'tinyint',
            isNullable: true,
            unsigned: true,
            default: 'null',
          }),
          new TableColumn({
            name: 'timeFrom',
            type: 'char(5)',
            isNullable: true,
            default: 'null',
          }),
          new TableColumn({
            name: 'timeTo',
            type: 'char(5)',
            isNullable: true,
            default: 'null',
          }),
          new TableColumn({
            name: 'tag',
            type: 'varchar(50)',
            isNullable: true,
            default: 'null',
          }),
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
          new TableColumn({
            name: 'message',
            type: 'text',
            isNullable: false,
          }),
          new TableColumn({
            name: 'daysRange',
            type: 'text',
            isNullable: false,
          }),
          new TableColumn({
            name: 'timeAt',
            type: 'char(5)',
            isNullable: false,
          }),
          new TableColumn({
            name: 'enabled',
            type: 'tinyint(1)',
            default: '0',
            isNullable: false,
          }),
          new TableColumn({
            name: 'buttons',
            type: 'text',
            isNullable: true,
          }),
          new TableColumn({
            name: 'startDate',
            type: 'bigint',
            default: 1704748172294,
            unsigned: true,
            isNullable: false,
          }),
          new TableColumn({
            name: 'repeat',
            type: 'tinyint',
            default: 0,
            unsigned: true,
            isNullable: false,
          }),
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
          new TableColumn({
            name: 'textTrigger',
            type: 'text',
            isNullable: false,
          }),
          new TableColumn({
            name: 'reaction',
            type: 'text',
            isNullable: false,
          }),
          new TableColumn({
            name: 'enabled',
            type: 'tinyint(1)',
            default: '0',
            isNullable: false,
          }),
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
          new TableColumn({
            name: 'message',
            type: 'text',
            isNullable: false,
          }),
          new TableColumn({
            ...withChatId(),
            isUnique: true,
          }),
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
          new TableColumn({
            name: 'opt',
            type: 'varchar(150)',
            isUnique: true,
            isNullable: false,
          }),
          new TableColumn({
            name: 'val',
            type: 'text',
            isNullable: true,
          }),
        ],
      }),
    );

    /**
     * Заполняются дефолтные настройки
     */
    for (const [opt, val] of Object.entries(defaultSettings)) {
      await queryRunner.query(
        `INSERT INTO setting (opt, val) values ("${opt}", "${`${val}`}")`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('duty');
    await queryRunner.dropTable('cron');
    await queryRunner.dropTable('reaction');
    await queryRunner.dropTable('hello_message');
    await queryRunner.dropTable('setting');
  }
}

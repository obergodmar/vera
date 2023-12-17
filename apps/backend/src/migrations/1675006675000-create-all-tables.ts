import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAllTables1675006675000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    /**
     * Duty table
     */
    await queryRunner.createTable(
      new Table({
        name: 'duty',
        columns: [
          {
            name: 'id',
            type: 'int',
            unsigned: true,
            isNullable: false,
            isGenerated: true,
            isPrimary: true,
            generationStrategy: 'increment',
          },
          {
            name: 'chatId',
            type: 'bigint',
            unsigned: true,
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'bigint',
            unsigned: true,
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
      true,
    );
    /**
     * Crons table
     */
    await queryRunner.createTable(
      new Table({
        name: 'cron',
        columns: [
          {
            name: 'id',
            type: 'int',
            unsigned: true,
            isNullable: false,
            isGenerated: true,
            isPrimary: true,
            generationStrategy: 'increment',
          },
          {
            name: 'chatId',
            type: 'bigint',
            unsigned: true,
            isNullable: false,
          },
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
      true,
    );
    /**
     * Reactions table
     */
    await queryRunner.createTable(
      new Table({
        name: 'reaction',
        columns: [
          {
            name: 'id',
            type: 'int',
            unsigned: true,
            isNullable: false,
            isGenerated: true,
            isPrimary: true,
            generationStrategy: "increment"
          },
          {
            name: 'chatId',
            type: 'bigint',
            unsigned: true,
            isNullable: false,
          },
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
      true,
    );
    /**
     * Hello messages table
     */
    await queryRunner.createTable(
      new Table({
        name: 'hello_message',
        columns: [
          {
            name: 'id',
            type: 'int',
            unsigned: true,
            isNullable: false,
            isGenerated: true,
            isPrimary: true,
            generationStrategy: "increment"
          },
          {
            name: 'message',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'chatId',
            type: 'bigInt',
            isUnique: true,
            isNullable: false,
          },
        ],
      }),
      true,
    );
    /**
     * Settings table
     */
    await queryRunner.createTable(
      new Table({
        name: 'setting',
        columns: [
          {
            name: 'opt',
            type: 'varchar(150)',
            isNullable: false,
            isPrimary: true,
          },
          {
            name: 'val',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'modified',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('duty', true);
    await queryRunner.dropTable('cron', true);
    await queryRunner.dropTable('reaction', true);
    await queryRunner.dropTable('hello_message', true);
    await queryRunner.dropTable('setting', true);
  }
}

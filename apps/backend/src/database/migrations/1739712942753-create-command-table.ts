import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

import { withChatId, withCreatedModifiedColumns } from './common-columns';

export class CreateCommandTable1739712942753 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'command',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'int',
            unsigned: true,
            isNullable: false,
            isGenerated: false,
            isPrimary: true,
            generationStrategy: 'increment',
          }),
          ...withCreatedModifiedColumns(),
          withChatId(),
          new TableColumn({
            name: 'command',
            type: 'text',
            isNullable: false,
          }),
          new TableColumn({
            name: 'enabled',
            type: 'tinyint(1)',
            default: '0',
            isNullable: false,
          }),
          new TableColumn({
            name: 'name',
            type: 'text',
            isNullable: true,
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('command');
  }
}

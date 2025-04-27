import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

import { withChatId, withDefaultColumns } from './common-columns';

export class CreateRollTable1717355265635 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'roll_command',
        columns: [
          ...withDefaultColumns(),
          withChatId(),
          new TableColumn({
            name: 'phrase',
            type: 'text',
            isNullable: false,
          }),
          new TableColumn({
            name: 'membersIds',
            type: 'text',
            default: 'null',
            isNullable: true,
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('roll_command');
  }
}

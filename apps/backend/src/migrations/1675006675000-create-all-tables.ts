import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAllTables1675006675000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
            isUnique: true,
            isPrimary: true,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('duty', true);
  }
}

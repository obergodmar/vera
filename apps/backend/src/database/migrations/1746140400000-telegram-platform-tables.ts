import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class TelegramPlatformTables1746140400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'telegram_chats',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'bigint',
            unsigned: true,
            isPrimary: true,
            isNullable: false,
          }),
          new TableColumn({
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          }),
          new TableColumn({
            name: 'photo',
            type: 'varchar',
            length: '512',
            isNullable: true,
          }),
          new TableColumn({
            name: 'isActive',
            type: 'tinyint',
            default: '1',
            isNullable: false,
          }),
          new TableColumn({
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'telegram_chat_members',
        columns: [
          new TableColumn({
            name: 'chatId',
            type: 'bigint',
            unsigned: true,
            isPrimary: true,
            isNullable: false,
          }),
          new TableColumn({
            name: 'userId',
            type: 'bigint',
            unsigned: true,
            isPrimary: true,
            isNullable: false,
          }),
          new TableColumn({
            name: 'firstName',
            type: 'varchar',
            length: '255',
            isNullable: false,
          }),
          new TableColumn({
            name: 'lastName',
            type: 'varchar',
            length: '255',
            isNullable: true,
          }),
          new TableColumn({
            name: 'username',
            type: 'varchar',
            length: '255',
            isNullable: true,
          }),
          new TableColumn({
            name: 'photo',
            type: 'varchar',
            length: '512',
            isNullable: true,
          }),
          new TableColumn({
            name: 'isActive',
            type: 'tinyint',
            default: '1',
            isNullable: false,
          }),
          new TableColumn({
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('telegram_chat_members');
    await queryRunner.dropTable('telegram_chats');
  }
}

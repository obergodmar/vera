import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CronsRepeat1702515371054 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('cron', [
      new TableColumn({
        name: 'startDate',
        type: 'bigint',
        unsigned: true,
      }),
      new TableColumn({
        name: 'repeat',
        type: 'tinyint',
        unsigned: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('cron', ['startDate', 'repeat']);
  }
}

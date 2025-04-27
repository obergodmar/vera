import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ReactionCallDuty1705184240582 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('reaction', [
      new TableColumn({
        name: 'callDuty',
        type: 'tinyint(1)',
        isNullable: true,
        default: '0',
      }),
      new TableColumn({
        name: 'dutyTag',
        type: 'varchar(50)',
        isNullable: true,
        default: null,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('reaction', ['callDuty', 'dutyTag']);
  }
}

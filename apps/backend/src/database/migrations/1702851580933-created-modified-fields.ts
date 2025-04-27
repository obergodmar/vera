import { MigrationInterface, QueryRunner } from 'typeorm';

import { withCreatedModifiedColumns } from './common-columns';

export class CreatedModifiedFields1702851580933 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('duty', withCreatedModifiedColumns());
    await queryRunner.addColumns('cron', withCreatedModifiedColumns());
    await queryRunner.addColumns('reaction', withCreatedModifiedColumns());
    await queryRunner.addColumns('hello_message', withCreatedModifiedColumns());
    await queryRunner.addColumns('setting', withCreatedModifiedColumns());
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('duty', withCreatedModifiedColumns());
    await queryRunner.dropColumns('cron', withCreatedModifiedColumns());
    await queryRunner.dropColumns('reaction', withCreatedModifiedColumns());
    await queryRunner.dropColumns(
      'hello_message',
      withCreatedModifiedColumns(),
    );
    await queryRunner.dropColumns('setting', withCreatedModifiedColumns());
  }
}

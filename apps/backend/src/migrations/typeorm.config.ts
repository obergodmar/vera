import { DataSource } from 'typeorm';

import { getOrmConfig } from '../database/database.module';
import { envValidation } from '../environments/env-validator';
import { CronsRepeat1702515371054 } from './1702515371054-crons-repeat';

const env = envValidation();

export default new DataSource({
  ...getOrmConfig(env),
  migrations: [CronsRepeat1702515371054]
});

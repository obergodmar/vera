import { DataSource } from 'typeorm';

import { getOrmConfig } from '../database/database.module';
import { envValidation } from '../environments/env-validator';
import { CreateAllTables1675006675000 } from './1675006675000-create-all-tables';
import { CronsRepeat1702515371054 } from './1702515371054-crons-repeat';

const env = envValidation();

export default new DataSource({
  ...getOrmConfig(env),
  migrations: [CreateAllTables1675006675000, CronsRepeat1702515371054],
});

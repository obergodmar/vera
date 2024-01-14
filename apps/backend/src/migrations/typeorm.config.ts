import { DataSource } from 'typeorm';

import { getOrmConfig } from '../database/database.module';
import { envValidation } from '../environments/env-validator';
import { CreateAllTables1675006675000 } from './1675006675000-create-all-tables';
import { ReactionCallDuty1705184240582 } from './1705184240582-reaction-callDuty';

const env = envValidation();

export default new DataSource({
  ...getOrmConfig(env),
  migrations: [CreateAllTables1675006675000, ReactionCallDuty1705184240582],
});

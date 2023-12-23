import { DataSource } from 'typeorm';

import { getOrmConfig } from '../database/database.module';
import { envValidation } from '../environments/env-validator';
import { CreateAllTables1675006675000 } from './1675006675000-create-all-tables';

const env = envValidation();

export default new DataSource({
  ...getOrmConfig(env),
  migrations: [
    CreateAllTables1675006675000,
  ],
});

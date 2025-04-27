import { DataSource } from 'typeorm';

import { envValidation } from '../../environments/env-validator';
import { getOrmConfig } from '../database.module';
import { CreateAllTables1675006675000 } from './1675006675000-create-all-tables';
import { ReactionCallDuty1705184240582 } from './1705184240582-reaction-callDuty';
import { CreateRollTable1717355265635 } from './1717355265635-create-roll-table';
import { CreateCommandTable1739712942753 } from './1739712942753-create-command-table';

const env = envValidation();

export default new DataSource({
  ...getOrmConfig(env),
  migrations: [
    CreateAllTables1675006675000,
    ReactionCallDuty1705184240582,
    CreateRollTable1717355265635,
    CreateCommandTable1739712942753,
  ],
});

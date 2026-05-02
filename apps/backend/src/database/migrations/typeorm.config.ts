import { DataSource } from 'typeorm';

import { envValidation } from '../../environments/env-validator';
import { getOrmConfig } from '../database.module';

const env = envValidation();

export default new DataSource(getOrmConfig(env));

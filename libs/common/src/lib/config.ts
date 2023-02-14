import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { DutyConfigModel, IDuty } from './duty';

export namespace IConfig {
  export interface IConfig {
    duty: IDuty.IDuty;
  }
}

export class ConfigModel implements IConfig.IConfig {
  @ValidateNested()
  @Type(() => DutyConfigModel)
  duty!: DutyConfigModel;
}

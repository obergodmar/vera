import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { defaultSettings, ISettings } from '@vera-reforged/common';

import { Repository } from 'typeorm';

import { Setting } from './settings.entity';

@Injectable()
export class SettingsService {
  public constructor(
    @InjectRepository(Setting)
    private readonly settingsRepository: Repository<Setting>,
  ) {}

  public async get(
    opt: ISettings.Option,
  ): Promise<ISettings.ValueByOption[typeof opt]> {
    try {
      const { val } = await this.settingsRepository.findOneBy({
        opt,
      });

      switch (opt) {
        case 'debug_log_to_vk':
          return val === 'true' || val === '1';
        case 'convos_fetch_amount': {
          const amount = parseInt(val);

          return Number.isNaN(amount) ? defaultSettings[opt] : amount;
        }
        default:
          return defaultSettings[opt];
      }
    } catch (error: unknown) {
      return defaultSettings[opt];
    }
  }
}

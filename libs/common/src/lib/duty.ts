import { plainToClass, Type } from 'class-transformer';
import {
  IsNumber,
  isObject,
  IsOptional,
  IsString,
  registerDecorator,
  ValidateNested,
  validateSync,
  ValidationOptions,
} from 'class-validator';

export namespace IDuty {
  export interface IDuty {
    chats: number[];
    days: Day[];
    schedule: Schedule;
  }

  export type Day = {
    shortName: string;
    name: string;
    nameWhen: string;
    dayNumber: number;
  };

  /**
   * By ChatId
   */
  export type Schedule = Record<number, Duty[]>;
  export type Duty = {
    peerId: number;
    firstName: string;
    lastName: string;
    avatar: string;
    screenName: string;
    dayNumber: number | undefined;
    timeFrom: string;
    timeTo: string;
    tag?: string;
  };
}

export class DutyConfigModel implements IDuty.IDuty {
  @ValidateNested({ each: true })
  @IsNumber()
  chats!: number[];

  @ValidateNested({ each: true })
  @Type(() => DayModel)
  days!: DayModel[];

  @ValidateNested()
  @IsDuty()
  schedule!: IDuty.Schedule;
}

class DayModel implements IDuty.Day {
  @IsString()
  shortName!: string;

  @IsString()
  name!: string;

  @IsString()
  nameWhen!: string;

  @IsNumber()
  dayNumber!: number;
}

class DutyModel implements IDuty.Duty {
  @IsNumber()
  peerId!: number;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  avatar!: string;

  @IsString()
  screenName!: string;

  @IsOptional()
  @IsNumber()
  dayNumber: number | undefined;

  @IsString()
  timeFrom!: string;

  @IsString()
  timeTo!: string;

  @IsOptional()
  @IsString()
  tag?: string;
}

function IsDuty(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsDuty',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        message: 'Wrong object format',
        ...validationOptions,
      },
      validator: {
        validate(obj: object) {
          if (!isObject(obj)) {
            return false;
          }

          if (Object.keys(obj).length === 0) {
            return true;
          }

          const values = Object.values(obj);
          return values.every((value) => {
            if (!isObject(value)) {
              return false;
            }

            const validatedDuty = plainToClass(DutyModel, value, {
              enableImplicitConversion: true,
            });

            const errors = validateSync(validatedDuty, {
              skipMissingProperties: false,
            });

            if (errors.length > 0) {
              console.error(errors.toString());

              return false;
            }

            return true;
          });
        },
      },
    });
  };
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { MongoUnexpectedServerResponseError } from 'mongodb';
import { Model } from 'mongoose';

import { CreateNewGreetingDto } from './dto/create-new-greeting.dto';
import { Greeting, GreetingDocument } from './schemes/greeting.schema';

@Injectable()
export class GreetingService {
  constructor(
    @InjectModel(Greeting.name)
    private readonly greetingModel: Model<GreetingDocument>
  ) {}

  public async createGreeting(greetingDto: CreateNewGreetingDto) {
    const { peerId } = greetingDto;

    try {
      await this.greetingModel
        .findOneAndUpdate({ peerId }, greetingDto, {
          upsert: true,
          new: true,
        })
        .exec();
    } catch (e: unknown) {
      console.error(e);
      return new MongoUnexpectedServerResponseError(
        'Ошибка при попытке добавить приветствие'
      );
    }

    return {};
  }

  public async removeGreeting(peerId: number) {
    try {
      await this.greetingModel.findOneAndDelete({ peerId }).exec();
    } catch (e: unknown) {
      console.error(e);
      return new MongoUnexpectedServerResponseError(
        'Ошибка при попытке удаления приветствия'
      );
    }
  }
}

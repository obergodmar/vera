import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';

import { CreateNewGreetingDto } from './dto/create-new-greeting.dto';
import { GreetingService } from './greeting.service';

@Controller('greetings')
export class GreetingController {
  public constructor(private readonly greetingsService: GreetingService) {}

  @Post('create')
  public async createGreeting(@Body() createGreetingDto: CreateNewGreetingDto) {
    return this.greetingsService.createGreeting(createGreetingDto);
  }

  @Patch('update')
  public async updateGreeting(@Body() createGreetingDto: CreateNewGreetingDto) {
    return this.greetingsService.createGreeting(createGreetingDto);
  }

  @Delete('remove/:peerId')
  public async removeGreeting(@Param('peerId') peerId: number) {
    return this.greetingsService.removeGreeting(peerId);
  }
}

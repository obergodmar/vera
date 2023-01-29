import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { Duties } from '@vera-reforged/common';

import { ApiService } from './api.service';
@Controller()
export class ApiController {
  public constructor(
    @Inject(ApiService) private readonly apiService: ApiService
  ) {}

  @Get('getConversations')
  public async getConversations() {
    return this.apiService.getConversationsById();
  }
  @Get('getConversationsById')
  public async getConversationsById() {
    return this.apiService.getConversationsById();
  }

  @Get('getConversationMembers/:peerId')
  public async getConversationMembers(@Param('peerId') peerId: number) {
    return this.apiService.getConversationMembers(peerId);
  }

  @Post('updateDuties/:peerId')
  public async updateDuties(
    @Param('peerId') peerId: number,
    @Body('duties') duties: Duties
  ) {
    return this.apiService.updateDutiesSchedule(peerId, duties);
  }

  @Post('getConfig')
  public async getConfig() {
    return this.apiService.getConfig();
  }
}

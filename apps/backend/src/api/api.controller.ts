import { Controller, Get, Inject, Param } from '@nestjs/common';

import { ApiService } from './api.service';
@Controller('methods')
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
}

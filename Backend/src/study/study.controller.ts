import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { UserEntity } from '../users/entities/user.entity';
import { RecordReviewDto } from './dto/record-review.dto';
import { StudyService } from './study.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class StudyController {
  constructor(private readonly service: StudyService) {}

  @Post('entries/:id/review')
  recordReview(@Param('id') id: string, @Body() dto: RecordReviewDto, @CurrentUser() user: UserEntity) { return this.service.recordReview(id, dto, user.id); }

  @Get('decks/:deckId/due')
  getDue(@Param('deckId') deckId: string, @CurrentUser() user: UserEntity, @Query('now') now?: string) { return this.service.getDue(deckId, user.id, now); }
}

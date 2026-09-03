import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { UserEntity } from '../users/entities/user.entity';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { BulkCreateVocabularyDto } from './dto/bulk-create-vocabulary.dto';
import { VocabularyService } from './vocabulary.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class VocabularyController {
  constructor(private readonly service: VocabularyService) {}

  @Get('decks/:deckId/entries')
  list(@Param('deckId') deckId: string, @CurrentUser() user: UserEntity) { return this.service.listByDeck(deckId, user.id); }

  @Post('decks/:deckId/entries')
  create(@Param('deckId') deckId: string, @Body() dto: CreateVocabularyDto, @CurrentUser() user: UserEntity) { return this.service.create(deckId, dto, user.id); }

  @Post('decks/:deckId/entries/bulk')
  bulk(@Param('deckId') deckId: string, @Body() dto: BulkCreateVocabularyDto, @CurrentUser() user: UserEntity) { return this.service.bulkCreate(deckId, dto.entries, user.id); }

  @Patch('entries/:id')
  update(@Param('id') id: string, @Body() dto: UpdateVocabularyDto, @CurrentUser() user: UserEntity) { return this.service.update(id, dto, user.id); }

  @Delete('entries/:id')
  delete(@Param('id') id: string, @CurrentUser() user: UserEntity) { return this.service.delete(id, user.id); }
}

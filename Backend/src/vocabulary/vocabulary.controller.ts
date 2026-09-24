import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { UserEntity } from '../users/entities/user.entity';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { BulkCreateVocabularyDto } from './dto/bulk-create-vocabulary.dto';
import { VocabularyService, type VocabularyPageOptions } from './vocabulary.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class VocabularyController {
  constructor(private readonly service: VocabularyService) {}

  @Get('decks/:deckId/entries')
  list(@Param('deckId') deckId: string, @CurrentUser() user: UserEntity, @Query('limit') limit?: string, @Query('offset') offset?: string) {
    if (limit === undefined && offset === undefined) return this.service.listByDeck(deckId, user.id);
    return this.service.listByDeck(deckId, user.id, { limit: this.parseQueryNumber(limit, 'limit'), offset: this.parseQueryNumber(offset, 'offset') });
  }

  @Get('decks/:deckId/entries/page')
  page(
    @Param('deckId') deckId: string,
    @CurrentUser() user: UserEntity,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('search') search?: string,
    @Query('status') status?: string
  ) {
    const options: VocabularyPageOptions = {
      limit: limit === undefined ? undefined : this.parseQueryNumber(limit, 'limit'),
      offset: offset === undefined ? undefined : this.parseQueryNumber(offset, 'offset'),
      search: search?.trim() || undefined,
      status: this.parseStatus(status)
    };
    return this.service.listPage(deckId, user.id, options);
  }

  @Post('decks/:deckId/entries')
  create(@Param('deckId') deckId: string, @Body() dto: CreateVocabularyDto, @CurrentUser() user: UserEntity) { return this.service.create(deckId, dto, user.id); }

  @Post('decks/:deckId/entries/bulk')
  bulk(@Param('deckId') deckId: string, @Body() dto: BulkCreateVocabularyDto, @CurrentUser() user: UserEntity) { return this.service.bulkCreate(deckId, dto.entries, user.id); }

  @Patch('entries/:id')
  update(@Param('id') id: string, @Body() dto: UpdateVocabularyDto, @CurrentUser() user: UserEntity) { return this.service.update(id, dto, user.id); }

  @Delete('entries/:id')
  delete(@Param('id') id: string, @CurrentUser() user: UserEntity) { return this.service.delete(id, user.id); }

  private parseQueryNumber(value: string | undefined, field: string): number | undefined {
    if (value === undefined) return undefined;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0 || (field === 'limit' && parsed === 0)) {
      throw new BadRequestException({ code: 'request_invalid', message: `Tham số ${field} không hợp lệ.` });
    }
    return parsed;
  }

  private parseStatus(value: string | undefined): VocabularyPageOptions['status'] {
    if (value === undefined || value === '' || value === 'all') return undefined;
    if (value !== 'new' && value !== 'learning' && value !== 'mastered') {
      throw new BadRequestException({ code: 'request_invalid', message: 'Trạng thái từ vựng không hợp lệ.' });
    }
    return value;
  }
}

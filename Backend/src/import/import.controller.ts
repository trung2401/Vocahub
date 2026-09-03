import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { UserEntity } from '../users/entities/user.entity';
import { BulkImportDto } from './dto/bulk-import.dto';
import { ImportService } from './import.service';

@Controller('imports')
@UseGuards(JwtAuthGuard)
export class ImportController {
  constructor(private readonly service: ImportService) {}

  @Post('decks')
  createDeck(@Body() dto: BulkImportDto, @CurrentUser() user: UserEntity) { return this.service.createDeckWithEntries(dto, user.id); }
}

import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { UserEntity } from '../users/entities/user.entity';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { DecksService } from './decks.service';

@Controller('decks')
@UseGuards(JwtAuthGuard)
export class DecksController {
  constructor(private readonly service: DecksService) {}

  @Get()
  list(@CurrentUser() user: UserEntity) { return this.service.list(user.id); }

  @Get('summary')
  summaries(@CurrentUser() user: UserEntity) { return this.service.listSummaries(user.id); }

  @Get(':id')
  get(@Param('id') id: string, @CurrentUser() user: UserEntity) { return this.service.get(id, user.id); }

  @Post()
  create(@Body() dto: CreateDeckDto, @CurrentUser() user: UserEntity) { return this.service.create(dto, user.id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDeckDto, @CurrentUser() user: UserEntity) { return this.service.update(id, dto, user.id); }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: UserEntity) { return this.service.delete(id, user.id); }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createId } from '../lib/id';
import { toDeckResponse, type DeckResponseDto } from '../lib/domain-response';
import { DeckEntity } from './entities/deck.entity';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';

@Injectable()
export class DecksService {
  constructor(@InjectRepository(DeckEntity) private readonly decks: Repository<DeckEntity>) {}

  async list(userId: string): Promise<DeckResponseDto[]> {
    const entities = await this.decks.find({ where: { userId }, order: { updatedAt: 'DESC' } });
    return entities.map(toDeckResponse);
  }

  async get(id: string, userId: string): Promise<DeckResponseDto> {
    const entity = await this.requireEntity(id, userId);
    return toDeckResponse(entity);
  }

  async create(dto: CreateDeckDto, userId: string): Promise<DeckResponseDto> {
    const entity = this.decks.create({ id: createId(), name: dto.name.trim(), source: dto.source ?? 'manual', userId });
    return toDeckResponse(await this.decks.save(entity));
  }

  async update(id: string, dto: UpdateDeckDto, userId: string): Promise<DeckResponseDto> {
    const entity = await this.requireEntity(id, userId);
    if (dto.name !== undefined) entity.name = dto.name.trim();
    return toDeckResponse(await this.decks.save(entity));
  }

  async delete(id: string, userId: string): Promise<void> {
    const result = await this.decks.delete({ id, userId });
    if (!result.affected) throw new NotFoundException({ code: 'not_found', message: 'Bộ từ vựng không tồn tại.' });
  }

  async requireEntity(id: string, userId: string): Promise<DeckEntity> {
    const entity = await this.decks.findOne({ where: { id, userId } });
    if (!entity) throw new NotFoundException({ code: 'not_found', message: 'Bộ từ vựng không tồn tại.' });
    return entity;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createId } from '../lib/id';
import { toDeckResponse, type DeckResponseDto, type DeckSummaryResponseDto } from '../lib/domain-response';
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

  async listSummaries(userId: string): Promise<DeckSummaryResponseDto[]> {
    const rows = await this.decks.createQueryBuilder('deck')
      .leftJoin('deck.entries', 'entry')
      .select('deck.id', 'deckId')
      .addSelect('COUNT(entry.id)', 'totalEntries')
      .addSelect('COALESCE(SUM(CASE WHEN entry.id IS NOT NULL AND entry.next_review_at <= :now THEN 1 ELSE 0 END), 0)', 'dueEntries')
      .addSelect("COALESCE(SUM(CASE WHEN entry.status = 'mastered' THEN 1 ELSE 0 END), 0)", 'masteredEntries')
      .addSelect("COALESCE(SUM(CASE WHEN entry.status = 'learning' THEN 1 ELSE 0 END), 0)", 'learningEntries')
      .where('deck.user_id = :userId', { userId })
      .setParameter('now', new Date())
      .groupBy('deck.id')
      .getRawMany<{ deckId: string; totalEntries: string | number; dueEntries: string | number; masteredEntries: string | number; learningEntries: string | number }>();

    return rows.map((row) => ({
      deckId: row.deckId,
      totalEntries: Number(row.totalEntries ?? 0),
      dueEntries: Number(row.dueEntries ?? 0),
      masteredEntries: Number(row.masteredEntries ?? 0),
      learningEntries: Number(row.learningEntries ?? 0)
    }));
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

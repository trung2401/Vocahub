import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createId } from '../lib/id';
import { toVocabularyResponse, type VocabularyResponseDto } from '../lib/domain-response';
import { DecksService } from '../decks/decks.service';
import { VocabularyEntryEntity } from './entities/vocabulary-entry.entity';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';

@Injectable()
export class VocabularyService {
  constructor(
    @InjectRepository(VocabularyEntryEntity) private readonly entries: Repository<VocabularyEntryEntity>,
    private readonly decks: DecksService
  ) {}

  async listByDeck(deckId: string, userId: string): Promise<VocabularyResponseDto[]> {
    await this.decks.requireEntity(deckId, userId);
    const rows = await this.entries.find({ where: { deckId }, order: { createdAt: 'ASC' } });
    return rows.map(toVocabularyResponse);
  }

  async create(deckId: string, dto: CreateVocabularyDto, userId: string, repository = this.entries): Promise<VocabularyResponseDto> {
    await this.decks.requireEntity(deckId, userId);
    const duplicate = await repository.createQueryBuilder('entry').where('entry.deck_id = :deckId AND LOWER(TRIM(entry.term)) = LOWER(TRIM(:term)) AND LOWER(TRIM(entry.meaning)) = LOWER(TRIM(:meaning))', { deckId, term: dto.term, meaning: dto.meaning }).getOne();
    if (duplicate) console.warn(`Duplicate vocabulary warning for deck ${deckId}: ${dto.term}`);
    const entity = repository.create({ id: createId(), deckId, term: dto.term.trim(), meaning: dto.meaning.trim(), pronunciation: dto.pronunciation?.trim() || null, example: dto.example?.trim() || null, partOfSpeech: dto.partOfSpeech?.trim() || null, status: 'new', lastReviewedAt: null, nextReviewAt: new Date(), correctCount: 0, incorrectCount: 0 });
    return toVocabularyResponse(await repository.save(entity));
  }

  async update(id: string, dto: UpdateVocabularyDto, userId: string): Promise<VocabularyResponseDto> {
    const entity = await this.requireEntity(id, userId);
    if (dto.term !== undefined) entity.term = dto.term.trim();
    if (dto.meaning !== undefined) entity.meaning = dto.meaning.trim();
    if (dto.pronunciation !== undefined) entity.pronunciation = dto.pronunciation.trim() || null;
    if (dto.example !== undefined) entity.example = dto.example.trim() || null;
    if (dto.partOfSpeech !== undefined) entity.partOfSpeech = dto.partOfSpeech.trim() || null;
    return toVocabularyResponse(await this.entries.save(entity));
  }

  async delete(id: string, userId: string): Promise<void> {
    const entity = await this.requireEntity(id, userId);
    const result = await this.entries.delete(entity.id);
    if (!result.affected) throw new NotFoundException({ code: 'not_found', message: 'Từ vựng không tồn tại.' });
  }

  async bulkCreate(deckId: string, items: CreateVocabularyDto[], userId: string, repository = this.entries): Promise<VocabularyResponseDto[]> {
    await this.decks.requireEntity(deckId, userId);
    const created: VocabularyResponseDto[] = [];
    for (const item of items) created.push(await this.create(deckId, item, userId, repository));
    return created;
  }

  async requireEntity(id: string, userId: string): Promise<VocabularyEntryEntity> {
    const entity = await this.entries.findOne({ where: { id }, relations: ['deck'] });
    if (!entity || entity.deck?.userId !== userId) throw new NotFoundException({ code: 'not_found', message: 'Từ vựng không tồn tại.' });
    return entity;
  }
}

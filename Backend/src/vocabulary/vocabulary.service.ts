import { BadRequestException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { createId } from '../lib/id';
import { toVocabularyResponse, type VocabularyPageResponseDto, type VocabularyResponseDto } from '../lib/domain-response';
import { DecksService } from '../decks/decks.service';
import { VocabularyEntryEntity } from './entities/vocabulary-entry.entity';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';

export interface VocabularyListOptions {
  limit?: number;
  offset?: number;
}

export interface VocabularyPageOptions extends VocabularyListOptions {
  search?: string;
  status?: 'new' | 'learning' | 'mastered';
}

@Injectable()
export class VocabularyService {
  constructor(
    @InjectRepository(VocabularyEntryEntity) private readonly entries: Repository<VocabularyEntryEntity>,
    private readonly decks: DecksService,
    @Optional() private readonly dataSource?: DataSource
  ) {}

  async listByDeck(deckId: string, userId: string, options: VocabularyListOptions = {}): Promise<VocabularyResponseDto[]> {
    await this.decks.requireEntity(deckId, userId);
    if (options.limit !== undefined && (!Number.isInteger(options.limit) || options.limit < 1 || options.limit > 500)) {
      throw new BadRequestException({ code: 'request_invalid', message: 'Số dòng mỗi trang phải nằm trong khoảng 1-500.' });
    }
    if (options.offset !== undefined && (!Number.isInteger(options.offset) || options.offset < 0)) {
      throw new BadRequestException({ code: 'request_invalid', message: 'Vị trí bắt đầu trang không hợp lệ.' });
    }
    const rows = await this.entries.find({
      where: { deckId }, order: { createdAt: 'ASC' },
      ...(options.limit !== undefined || options.offset !== undefined ? { skip: options.offset ?? 0, take: options.limit ?? 100 } : {})
    });
    return rows.map(toVocabularyResponse);
  }

  async listPage(deckId: string, userId: string, options: VocabularyPageOptions = {}): Promise<VocabularyPageResponseDto> {
    await this.decks.requireEntity(deckId, userId);
    const limit = options.limit ?? 50;
    const offset = options.offset ?? 0;
    if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
      throw new BadRequestException({ code: 'request_invalid', message: 'Số dòng mỗi trang phải nằm trong khoảng 1-500.' });
    }
    if (!Number.isInteger(offset) || offset < 0) {
      throw new BadRequestException({ code: 'request_invalid', message: 'Vị trí bắt đầu trang không hợp lệ.' });
    }
    const search = options.search?.trim();
    if (search && search.length > 200) {
      throw new BadRequestException({ code: 'request_invalid', message: 'Từ khóa tìm kiếm quá dài.' });
    }

    const query = this.entries.createQueryBuilder('entry').where('entry.deck_id = :deckId', { deckId });
    if (search) query.andWhere('(LOWER(entry.term) LIKE LOWER(:search) OR LOWER(entry.meaning) LIKE LOWER(:search))', { search: `%${search}%` });
    if (options.status) query.andWhere('entry.status = :status', { status: options.status });
    const [rows, total] = await query.orderBy('entry.created_at', 'ASC').skip(offset).take(limit).getManyAndCount();

    return { items: rows.map(toVocabularyResponse), total, limit, offset };
  }

  async create(deckId: string, dto: CreateVocabularyDto, userId: string, repository = this.entries): Promise<VocabularyResponseDto> {
    await this.decks.requireEntity(deckId, userId);
    const duplicate = await repository.createQueryBuilder('entry').where('entry.deck_id = :deckId AND LOWER(TRIM(entry.term)) = LOWER(TRIM(:term)) AND LOWER(TRIM(entry.meaning)) = LOWER(TRIM(:meaning))', { deckId, term: dto.term, meaning: dto.meaning }).getOne();
    if (duplicate) console.warn(`Duplicate vocabulary warning for deck ${deckId}: ${dto.term}`);
    const entity = repository.create({ id: createId(), deckId, term: dto.term.trim(), meaning: dto.meaning.trim(), pronunciation: dto.pronunciation?.trim() || null, example: dto.example?.trim() || null, partOfSpeech: dto.partOfSpeech?.trim() || null, status: 'new', lastReviewedAt: null, nextReviewAt: new Date(), correctCount: 0, incorrectCount: 0, lastRating: null });
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
    // Ownership is checked once for the whole request. The transaction below keeps
    // the duplicate snapshot and insert together so a failed batch cannot partially persist.
    await this.decks.requireEntity(deckId, userId);
    if (!items.length) return [];

    const saveBatch = async (target: Repository<VocabularyEntryEntity>) => {
      const existing = await target.find({ where: { deckId } });
      const seen = new Set(existing.map((entry) => this.duplicateKey(entry.term, entry.meaning)));
      const duplicateTerms: string[] = [];
      const nextReviewAt = new Date();
      const entities = items.map((item) => {
        const term = item.term.trim();
        const meaning = item.meaning.trim();
        const key = this.duplicateKey(term, meaning);
        if (seen.has(key)) duplicateTerms.push(term);
        seen.add(key);
        return target.create({
          id: createId(), deckId, term, meaning,
          pronunciation: item.pronunciation?.trim() || null,
          example: item.example?.trim() || null,
          partOfSpeech: item.partOfSpeech?.trim() || null,
          status: 'new', lastReviewedAt: null, nextReviewAt, correctCount: 0, incorrectCount: 0, lastRating: null
        });
      });
      if (duplicateTerms.length) console.warn(`Duplicate vocabulary warning for deck ${deckId}: ${duplicateTerms.length} duplicate row(s)`);
      const saved = await target.save(entities);
      return saved.map(toVocabularyResponse);
    };

    if (this.dataSource && repository === this.entries) {
      return this.dataSource.transaction((manager) => saveBatch(manager.getRepository(VocabularyEntryEntity)));
    }
    return saveBatch(repository);
  }

  private duplicateKey(term: string, meaning: string): string {
    return `${term.trim().toLocaleLowerCase()}\u0000${meaning.trim().toLocaleLowerCase()}`;
  }

  async requireEntity(id: string, userId: string): Promise<VocabularyEntryEntity> {
    const entity = await this.entries.findOne({ where: { id }, relations: ['deck'] });
    if (!entity || entity.deck?.userId !== userId) throw new NotFoundException({ code: 'not_found', message: 'Từ vựng không tồn tại.' });
    return entity;
  }
}

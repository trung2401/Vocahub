import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createId } from '../lib/id';
import { toDeckResponse, toVocabularyResponse, type DeckResponseDto, type VocabularyResponseDto } from '../lib/domain-response';
import { DeckEntity } from '../decks/entities/deck.entity';
import { VocabularyEntryEntity } from '../vocabulary/entities/vocabulary-entry.entity';
import { BulkImportDto } from './dto/bulk-import.dto';
import { ImportBatchEntity } from './entities/import-batch.entity';

export interface BulkImportResponse {
  deck: DeckResponseDto;
  entries: VocabularyResponseDto[];
  counts: { total: number; created: number; validRows: number; invalidRows: number };
}

@Injectable()
export class ImportService {
  constructor(private readonly dataSource: DataSource) {}

  async createDeckWithEntries(dto: BulkImportDto, userId: string): Promise<BulkImportResponse> {
    return this.dataSource.transaction(async (manager) => {
      const deckRepository = manager.getRepository(DeckEntity);
      const entryRepository = manager.getRepository(VocabularyEntryEntity);
      const batchRepository = manager.getRepository(ImportBatchEntity);
      const now = new Date();
      const deck = await deckRepository.save(deckRepository.create({ id: createId(), name: dto.name.trim(), source: 'import', userId, createdAt: now, updatedAt: now }));
      const existing = await entryRepository.find({ where: { deckId: deck.id } });
      const seen = new Set(existing.map((item) => this.duplicateKey(item.term, item.meaning)));
      const validItems = dto.entries.filter((item) => {
        const term = String(item.term ?? '').trim();
        const meaning = String(item.meaning ?? '').trim();
        if (!term || !meaning) return false;
        const key = this.duplicateKey(term, meaning);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (!validItems.length) throw new BadRequestException({ code: 'invalid_required', message: 'Không có dòng import hợp lệ.' });
      const entries = validItems.map((item) => entryRepository.create({ id: createId(), deckId: deck.id, term: item.term.trim(), meaning: item.meaning.trim(), pronunciation: item.pronunciation?.trim() || null, example: item.example?.trim() || null, partOfSpeech: item.partOfSpeech?.trim() || null, status: 'new', lastReviewedAt: null, nextReviewAt: now, correctCount: 0, incorrectCount: 0, lastRating: null }));
      const saved = await entryRepository.save(entries);
      await batchRepository.save(batchRepository.create({ id: createId(), deckId: deck.id, userId, fileName: dto.fileName?.trim() || 'import', totalRows: dto.entries.length, validRows: saved.length, invalidRows: dto.entries.length - saved.length }));
      return { deck: toDeckResponse(deck), entries: saved.map(toVocabularyResponse), counts: { total: dto.entries.length, created: saved.length, validRows: saved.length, invalidRows: dto.entries.length - saved.length } };
    });
  }

  private duplicateKey(term: string, meaning: string): string {
    return `${term.trim().toLocaleLowerCase()}\u0000${meaning.trim().toLocaleLowerCase()}`;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createId } from '../lib/id';
import { ReviewLogEntity } from './entities/review-log.entity';

@Injectable()
export class ReviewLogsService {
  constructor(@InjectRepository(ReviewLogEntity) private readonly logs: Repository<ReviewLogEntity>) {}

  async create(input: Pick<ReviewLogEntity, 'vocabularyEntryId' | 'deckId' | 'userId' | 'rating' | 'mode'>, repository = this.logs): Promise<void> {
    await repository.save(repository.create({ id: createId(), ...input }));
  }
}

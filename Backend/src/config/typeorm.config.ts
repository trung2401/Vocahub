import 'dotenv/config';
import { DataSource } from 'typeorm';
import { DeckEntity } from '../decks/entities/deck.entity';
import { VocabularyEntryEntity } from '../vocabulary/entities/vocabulary-entry.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ReviewLogEntity } from '../review-logs/entities/review-log.entity';
import { ImportBatchEntity } from '../import/entities/import-batch.entity';
import { InitialSchema1730000000000 } from '../database/migrations/1730000000000-initial-schema';
import { CompleteAuthSchema1730000001000 } from '../database/migrations/1730000001000-complete-auth-schema';

export const typeOrmOptions = {
  type: 'mysql' as const,
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? 'dev',
  password: process.env.DB_PASS ?? 'devpass',
  database: process.env.DB_NAME ?? 'vocahub',
  entities: [UserEntity, DeckEntity, VocabularyEntryEntity, ReviewLogEntity, ImportBatchEntity],
  migrations: [InitialSchema1730000000000, CompleteAuthSchema1730000001000],
  synchronize: false,
  logging: process.env.TYPEORM_LOGGING === 'true'
};

export default new DataSource(typeOrmOptions);

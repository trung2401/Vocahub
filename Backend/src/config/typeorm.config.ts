import 'dotenv/config';
import { DataSource } from 'typeorm';
import { DeckEntity } from '../decks/entities/deck.entity';
import { VocabularyEntryEntity } from '../vocabulary/entities/vocabulary-entry.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ReviewLogEntity } from '../review-logs/entities/review-log.entity';
import { ImportBatchEntity } from '../import/entities/import-batch.entity';
import { RefreshSessionEntity } from '../auth/entities/refresh-session.entity';
import { InitialSchema1730000000000 } from '../database/migrations/1730000000000-initial-schema';
import { CompleteAuthSchema1730000001000 } from '../database/migrations/1730000001000-complete-auth-schema';
import { RefreshSessions1730000002000 } from '../database/migrations/1730000002000-refresh-sessions';
import { RefreshSessionReplacement1730000003000 } from '../database/migrations/1730000003000-refresh-session-replacement';
import { VocabularyLastRating1730000004000 } from '../database/migrations/1730000004000-vocabulary-last-rating';

export const typeOrmOptions = {
  type: 'mysql' as const,
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [UserEntity, DeckEntity, VocabularyEntryEntity, ReviewLogEntity, ImportBatchEntity, RefreshSessionEntity],
  migrations: [InitialSchema1730000000000, CompleteAuthSchema1730000001000, RefreshSessions1730000002000, RefreshSessionReplacement1730000003000, VocabularyLastRating1730000004000],
  synchronize: false,
  logging: process.env.TYPEORM_LOGGING === 'true'
};

export default new DataSource(typeOrmOptions);

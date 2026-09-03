import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'review_logs' })
@Index('idx_review_logs_deck_reviewed', ['deckId', 'reviewedAt'])
@Index('idx_review_logs_user_reviewed', ['userId', 'reviewedAt'])
export class ReviewLogEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'vocabulary_entry_id', type: 'char', length: 36 })
  vocabularyEntryId!: string;

  @Column({ name: 'deck_id', type: 'char', length: 36 })
  deckId!: string;

  @Column({ type: 'char', length: 36 })
  userId!: string;

  @Column({ type: 'enum', enum: ['again', 'hard', 'good'] })
  rating!: 'again' | 'hard' | 'good';

  @Column({ type: 'enum', enum: ['flashcard', 'quiz'] })
  mode!: 'flashcard' | 'quiz';

  @CreateDateColumn({ name: 'reviewed_at', type: 'datetime', precision: 3 })
  reviewedAt!: Date;
}

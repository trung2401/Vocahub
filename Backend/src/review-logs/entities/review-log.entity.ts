import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { DeckEntity } from '../../decks/entities/deck.entity';
import { VocabularyEntryEntity } from '../../vocabulary/entities/vocabulary-entry.entity';

@Entity({ name: 'review_logs' })
@Index('idx_review_logs_deck_reviewed', ['deckId', 'reviewedAt'])
@Index('idx_review_logs_user_reviewed', ['userId', 'reviewedAt'])
export class ReviewLogEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'vocabulary_entry_id', type: 'char', length: 36 })
  vocabularyEntryId!: string;

  @ManyToOne(() => VocabularyEntryEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vocabulary_entry_id' })
  vocabularyEntry!: VocabularyEntryEntity;

  @Column({ name: 'deck_id', type: 'char', length: 36 })
  deckId!: string;

  @ManyToOne(() => DeckEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deck_id' })
  deck!: DeckEntity;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'enum', enum: ['again', 'hard', 'good'] })
  rating!: 'again' | 'hard' | 'good';

  @Column({ type: 'enum', enum: ['flashcard', 'quiz'] })
  mode!: 'flashcard' | 'quiz';

  @CreateDateColumn({ name: 'reviewed_at', type: 'datetime', precision: 3 })
  reviewedAt!: Date;
}

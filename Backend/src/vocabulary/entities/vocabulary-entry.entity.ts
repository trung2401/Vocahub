import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { DeckEntity } from '../../decks/entities/deck.entity';

@Entity({ name: 'vocabulary_entries' })
@Index('idx_entries_deck', ['deckId'])
@Index('idx_entries_next_review', ['nextReviewAt'])
@Index('idx_entries_deck_next_review', ['deckId', 'nextReviewAt'])
export class VocabularyEntryEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'deck_id', type: 'char', length: 36 })
  deckId!: string;

  @ManyToOne(() => DeckEntity, (deck) => deck.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deck_id' })
  deck!: DeckEntity;

  @Column({ type: 'varchar', length: 200 })
  term!: string;

  @Column({ type: 'varchar', length: 1000 })
  meaning!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  pronunciation!: string | null;

  @Column({ type: 'text', nullable: true })
  example!: string | null;

  @Column({ name: 'part_of_speech', type: 'varchar', length: 80, nullable: true })
  partOfSpeech!: string | null;

  @Column({ type: 'enum', enum: ['new', 'learning', 'mastered'], default: 'new' })
  status!: 'new' | 'learning' | 'mastered';

  @Column({ name: 'last_reviewed_at', type: 'datetime', precision: 3, nullable: true })
  lastReviewedAt!: Date | null;

  @Column({ name: 'next_review_at', type: 'datetime', precision: 3 })
  nextReviewAt!: Date;

  @Column({ name: 'correct_count', type: 'int', unsigned: true, default: 0 })
  correctCount!: number;

  @Column({ name: 'incorrect_count', type: 'int', unsigned: true, default: 0 })
  incorrectCount!: number;

  @Column({ name: 'last_rating', type: 'enum', enum: ['again', 'hard', 'good'], nullable: true })
  lastRating!: 'again' | 'hard' | 'good' | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 3 })
  updatedAt!: Date;
}

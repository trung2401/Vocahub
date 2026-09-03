import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { VocabularyEntryEntity } from '../../vocabulary/entities/vocabulary-entry.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'decks' })
@Index('idx_decks_user_updated', ['userId', 'updatedAt'])
export class DeckEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId!: string;

  @ManyToOne(() => UserEntity, (user) => user.decks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'enum', enum: ['manual', 'import'] })
  source!: 'manual' | 'import';

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 3 })
  updatedAt!: Date;

  @OneToMany(() => VocabularyEntryEntity, (entry) => entry.deck)
  entries!: VocabularyEntryEntity[];
}

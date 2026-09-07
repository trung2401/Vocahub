import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { DeckEntity } from '../../decks/entities/deck.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'import_batches' })
@Index('idx_import_batches_user_created', ['userId', 'createdAt'])
export class ImportBatchEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

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

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName!: string;

  @Column({ name: 'total_rows', type: 'int', unsigned: true })
  totalRows!: number;

  @Column({ name: 'valid_rows', type: 'int', unsigned: true })
  validRows!: number;

  @Column({ name: 'invalid_rows', type: 'int', unsigned: true })
  invalidRows!: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt!: Date;
}

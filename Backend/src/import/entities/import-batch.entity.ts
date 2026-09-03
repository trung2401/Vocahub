import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'import_batches' })
@Index('idx_import_batches_user_created', ['userId', 'createdAt'])
export class ImportBatchEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'deck_id', type: 'char', length: 36 })
  deckId!: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId!: string;

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

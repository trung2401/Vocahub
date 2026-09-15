import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'refresh_sessions' })
@Index('uq_refresh_sessions_token_hash', ['tokenHash'], { unique: true })
@Index('idx_refresh_sessions_user_revoked', ['userId', 'revokedAt'])
@Index('idx_refresh_sessions_expires_at', ['expiresAt'])
export class RefreshSessionEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'token_hash', type: 'char', length: 64 })
  tokenHash!: string;

  @Column({ name: 'expires_at', type: 'datetime', precision: 3 })
  expiresAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt!: Date;

  @Column({ name: 'revoked_at', type: 'datetime', precision: 3, nullable: true })
  revokedAt!: Date | null;
}

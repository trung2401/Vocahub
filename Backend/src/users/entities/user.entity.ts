import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { DeckEntity } from '../../decks/entities/deck.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Index('uq_users_email', { unique: true })
  @Column({ type: 'varchar', length: 320 })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 3 })
  updatedAt!: Date;

  @OneToMany(() => DeckEntity, (deck) => deck.user)
  decks!: DeckEntity[];
}

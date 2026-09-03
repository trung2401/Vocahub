import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Compatibility migration for databases that already ran the original
 * two-table schema before authentication and activity tracking were added.
 */
export class CompleteAuthSchema1730000001000 implements MigrationInterface {
  name = 'CompleteAuthSchema1730000001000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('users'))) {
      await queryRunner.query(`CREATE TABLE users (
        id char(36) NOT NULL,
        email varchar(320) NOT NULL,
        password_hash varchar(255) NOT NULL,
        created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id), UNIQUE KEY uq_users_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    }

    if (await queryRunner.hasTable('decks')) {
      const decks = await queryRunner.getTable('decks');
      if (!decks?.findColumnByName('user_id')) {
        await queryRunner.addColumn('decks', new TableColumn({ name: 'user_id', type: 'char', length: '36', isNullable: true }));
        await queryRunner.query('CREATE INDEX idx_decks_user_updated ON decks (user_id, updated_at)');
        await queryRunner.query('ALTER TABLE decks ADD CONSTRAINT fk_decks_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
      }
    }

    if (!(await queryRunner.hasTable('review_logs'))) {
      await queryRunner.query(`CREATE TABLE review_logs (
        id char(36) NOT NULL,
        vocabulary_entry_id char(36) NOT NULL,
        deck_id char(36) NOT NULL,
        user_id char(36) NOT NULL,
        rating enum ('again', 'hard', 'good') NOT NULL,
        mode enum ('flashcard', 'quiz') NOT NULL,
        reviewed_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id), KEY idx_review_logs_deck_reviewed (deck_id, reviewed_at), KEY idx_review_logs_user_reviewed (user_id, reviewed_at),
        CONSTRAINT fk_review_logs_entry FOREIGN KEY (vocabulary_entry_id) REFERENCES vocabulary_entries (id) ON DELETE CASCADE,
        CONSTRAINT fk_review_logs_deck FOREIGN KEY (deck_id) REFERENCES decks (id) ON DELETE CASCADE,
        CONSTRAINT fk_review_logs_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    }

    if (!(await queryRunner.hasTable('import_batches'))) {
      await queryRunner.query(`CREATE TABLE import_batches (
        id char(36) NOT NULL,
        deck_id char(36) NOT NULL,
        user_id char(36) NOT NULL,
        file_name varchar(255) NOT NULL,
        total_rows int unsigned NOT NULL,
        valid_rows int unsigned NOT NULL,
        invalid_rows int unsigned NOT NULL,
        created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id), KEY idx_import_batches_user_created (user_id, created_at),
        CONSTRAINT fk_import_batches_deck FOREIGN KEY (deck_id) REFERENCES decks (id) ON DELETE CASCADE,
        CONSTRAINT fk_import_batches_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS import_batches');
    await queryRunner.query('DROP TABLE IF EXISTS review_logs');
    const decks = await queryRunner.getTable('decks');
    if (decks?.findColumnByName('user_id')) {
      const fk = decks.foreignKeys.find((key) => key.columnNames.includes('user_id'));
      if (fk) await queryRunner.dropForeignKey('decks', fk);
      const index = decks.indices.find((item) => item.name === 'idx_decks_user_updated');
      if (index) await queryRunner.dropIndex('decks', index);
      await queryRunner.dropColumn('decks', 'user_id');
    }
    await queryRunner.query('DROP TABLE IF EXISTS users');
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1730000000000 implements MigrationInterface {
  name = 'InitialSchema1730000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE users (
      id char(36) NOT NULL,
      email varchar(320) NOT NULL,
      password_hash varchar(255) NOT NULL,
      created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      UNIQUE KEY uq_users_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await queryRunner.query(`CREATE TABLE decks (
      id char(36) NOT NULL,
      user_id char(36) NOT NULL,
      name varchar(200) NOT NULL,
      source enum ('manual', 'import') NOT NULL,
      created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      KEY idx_decks_user_updated (user_id, updated_at),
      CONSTRAINT fk_decks_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await queryRunner.query(`CREATE TABLE vocabulary_entries (
      id char(36) NOT NULL,
      deck_id char(36) NOT NULL,
      term varchar(200) NOT NULL,
      meaning varchar(1000) NOT NULL,
      pronunciation varchar(200) NULL,
      example text NULL,
      part_of_speech varchar(80) NULL,
      status enum ('new', 'learning', 'mastered') NOT NULL DEFAULT 'new',
      last_reviewed_at datetime(3) NULL,
      next_review_at datetime(3) NOT NULL,
      correct_count int unsigned NOT NULL DEFAULT 0,
      incorrect_count int unsigned NOT NULL DEFAULT 0,
      created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      KEY idx_entries_deck (deck_id),
      KEY idx_entries_next_review (next_review_at),
      KEY idx_entries_deck_next_review (deck_id, next_review_at),
      CONSTRAINT fk_entries_deck FOREIGN KEY (deck_id) REFERENCES decks (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await queryRunner.query(`CREATE TABLE review_logs (
      id char(36) NOT NULL,
      vocabulary_entry_id char(36) NOT NULL,
      deck_id char(36) NOT NULL,
      user_id char(36) NOT NULL,
      rating enum ('again', 'hard', 'good') NOT NULL,
      mode enum ('flashcard', 'quiz') NOT NULL,
      reviewed_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      KEY idx_review_logs_deck_reviewed (deck_id, reviewed_at),
      KEY idx_review_logs_user_reviewed (user_id, reviewed_at),
      CONSTRAINT fk_review_logs_entry FOREIGN KEY (vocabulary_entry_id) REFERENCES vocabulary_entries (id) ON DELETE CASCADE,
      CONSTRAINT fk_review_logs_deck FOREIGN KEY (deck_id) REFERENCES decks (id) ON DELETE CASCADE,
      CONSTRAINT fk_review_logs_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await queryRunner.query(`CREATE TABLE import_batches (
      id char(36) NOT NULL,
      deck_id char(36) NOT NULL,
      user_id char(36) NOT NULL,
      file_name varchar(255) NOT NULL,
      total_rows int unsigned NOT NULL,
      valid_rows int unsigned NOT NULL,
      invalid_rows int unsigned NOT NULL,
      created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      KEY idx_import_batches_user_created (user_id, created_at),
      CONSTRAINT fk_import_batches_deck FOREIGN KEY (deck_id) REFERENCES decks (id) ON DELETE CASCADE,
      CONSTRAINT fk_import_batches_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS import_batches');
    await queryRunner.query('DROP TABLE IF EXISTS review_logs');
    await queryRunner.query('DROP TABLE IF EXISTS vocabulary_entries');
    await queryRunner.query('DROP TABLE IF EXISTS decks');
    await queryRunner.query('DROP TABLE IF EXISTS users');
  }
}

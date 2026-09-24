import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefreshSessions1730000002000 implements MigrationInterface {
  name = 'RefreshSessions1730000002000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('refresh_sessions')) return;
    await queryRunner.query(`CREATE TABLE refresh_sessions (
      id char(36) NOT NULL,
      user_id char(36) NOT NULL,
      token_hash char(64) NOT NULL,
      expires_at datetime(3) NOT NULL,
      created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      revoked_at datetime(3) NULL,
      replaced_by char(36) NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_refresh_sessions_token_hash (token_hash),
      KEY idx_refresh_sessions_user_revoked (user_id, revoked_at),
      KEY idx_refresh_sessions_expires_at (expires_at),
      CONSTRAINT fk_refresh_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS refresh_sessions');
  }
}

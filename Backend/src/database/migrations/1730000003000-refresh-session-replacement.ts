import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RefreshSessionReplacement1730000003000 implements MigrationInterface {
  name = 'RefreshSessionReplacement1730000003000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('refresh_sessions'))) return;
    const table = await queryRunner.getTable('refresh_sessions');
    if (!table?.findColumnByName('replaced_by')) {
      await queryRunner.addColumn('refresh_sessions', new TableColumn({ name: 'replaced_by', type: 'char', length: '36', isNullable: true }));
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('refresh_sessions'))) return;
    const table = await queryRunner.getTable('refresh_sessions');
    const column = table?.findColumnByName('replaced_by');
    if (column) await queryRunner.dropColumn('refresh_sessions', column);
  }
}

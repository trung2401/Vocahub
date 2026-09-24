import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class VocabularyLastRating1730000004000 implements MigrationInterface {
  name = 'VocabularyLastRating1730000004000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('vocabulary_entries'))) return;
    const table = await queryRunner.getTable('vocabulary_entries');
    if (!table?.findColumnByName('last_rating')) {
      await queryRunner.addColumn('vocabulary_entries', new TableColumn({
        name: 'last_rating',
        type: 'enum',
        enum: ['again', 'hard', 'good'],
        isNullable: true
      }));
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('vocabulary_entries'))) return;
    const table = await queryRunner.getTable('vocabulary_entries');
    const column = table?.findColumnByName('last_rating');
    if (column) await queryRunner.dropColumn('vocabulary_entries', column);
  }
}

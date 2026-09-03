import { IsIn, IsOptional } from 'class-validator';

export class RecordReviewDto {
  @IsIn(['again', 'hard', 'good'])
  rating!: 'again' | 'hard' | 'good';

  @IsOptional()
  @IsIn(['flashcard', 'quiz'])
  mode?: 'flashcard' | 'quiz';
}

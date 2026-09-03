import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateVocabularyDto } from './create-vocabulary.dto';

export class BulkCreateVocabularyDto {
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(5000) @ValidateNested({ each: true }) @Type(() => CreateVocabularyDto)
  entries!: CreateVocabularyDto[];
}

import { Type } from 'class-transformer';
import { ArrayMinSize, ArrayMaxSize, IsArray, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { CreateVocabularyDto } from '../../vocabulary/dto/create-vocabulary.dto';

export class BulkImportDto {
  @IsString() @IsNotEmpty() @MaxLength(200) name!: string;
  @IsOptional() @IsString() @MaxLength(255) fileName?: string;
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(5000) @ValidateNested({ each: true }) @Type(() => CreateVocabularyDto)
  entries!: CreateVocabularyDto[];
}

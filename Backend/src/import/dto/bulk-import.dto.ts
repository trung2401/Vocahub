import { Transform, Type } from 'class-transformer';
import { ArrayMinSize, ArrayMaxSize, IsArray, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { CreateVocabularyDto } from '../../vocabulary/dto/create-vocabulary.dto';

export class BulkImportDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @IsNotEmpty() @MaxLength(200) name!: string;
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional() @IsString() @MaxLength(255) fileName?: string;
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(5000) @ValidateNested({ each: true }) @Type(() => CreateVocabularyDto)
  entries!: CreateVocabularyDto[];
}

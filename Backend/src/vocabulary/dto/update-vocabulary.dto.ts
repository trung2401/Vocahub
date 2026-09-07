import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateVocabularyDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(200) term?: string;
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(1000) meaning?: string;
  @IsOptional() @IsString() @MaxLength(200) pronunciation?: string;
  @IsOptional() @IsString() @MaxLength(10000) example?: string;
  @IsOptional() @IsString() @MaxLength(80) partOfSpeech?: string;
}

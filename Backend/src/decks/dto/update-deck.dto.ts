import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDeckDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;
}

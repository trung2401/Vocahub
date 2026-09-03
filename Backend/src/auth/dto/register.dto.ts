import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail() @MaxLength(320) email!: string;
  @IsString() @IsNotEmpty() @MinLength(8) @MaxLength(128) password!: string;
}

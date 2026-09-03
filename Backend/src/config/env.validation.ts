import { plainToInstance } from 'class-transformer';
import { IsBooleanString, IsInt, IsNotEmpty, IsOptional, IsString, Min, MinLength, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsInt()
  @Min(1)
  PORT = 4000;

  @IsString()
  FRONTEND_ORIGIN = 'http://localhost:3000';

  @IsString()
  DB_HOST = '127.0.0.1';

  @IsInt()
  @Min(1)
  DB_PORT = 3306;

  @IsString()
  DB_USER = 'dev';

  @IsString()
  DB_PASS = 'devpass';

  @IsString()
  DB_NAME = 'vocahub';

  @IsOptional()
  @IsBooleanString()
  TYPEORM_LOGGING = 'false';

  @IsString() @IsNotEmpty() @MinLength(32)
  JWT_ACCESS_SECRET!: string;

  @IsString() @IsNotEmpty() @MinLength(32)
  JWT_REFRESH_SECRET!: string;

  @IsOptional() @IsString()
  JWT_ACCESS_TTL = '15m';

  @IsOptional() @IsString()
  JWT_REFRESH_TTL = '7d';
}

export function validateEnvironment(config: Record<string, unknown>) {
  const normalized = {
    ...config,
    PORT: config.PORT === undefined ? 4000 : Number(config.PORT),
    DB_PORT: config.DB_PORT === undefined ? 3306 : Number(config.DB_PORT)
  };
  const values = plainToInstance(EnvironmentVariables, normalized, { enableImplicitConversion: true });
  const errors = validateSync(values, { skipMissingProperties: false });
  if (errors.length > 0) throw new Error(errors.toString());
  return values;
}

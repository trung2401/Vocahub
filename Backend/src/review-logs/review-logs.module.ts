import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewLogEntity } from './entities/review-log.entity';
import { ReviewLogsService } from './review-logs.service';

@Module({ imports: [TypeOrmModule.forFeature([ReviewLogEntity])], providers: [ReviewLogsService], exports: [ReviewLogsService] })
export class ReviewLogsModule {}

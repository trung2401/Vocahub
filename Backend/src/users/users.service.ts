import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createId } from '../lib/id';
import { UserEntity } from './entities/user.entity';
import type { PublicUserDto } from './dto/public-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(UserEntity) private readonly users: Repository<UserEntity>) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.users.findOne({ where: { email: email.toLowerCase() } });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.users.findOne({ where: { id } });
  }

  async create(email: string, passwordHash: string): Promise<UserEntity> {
    const normalizedEmail = email.trim().toLowerCase();
    if (await this.findByEmail(normalizedEmail)) throw new ConflictException({ code: 'email_taken', message: 'Email đã được sử dụng.' });
    return this.users.save(this.users.create({ id: createId(), email: normalizedEmail, passwordHash }));
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    const result = await this.users.update({ id }, { passwordHash });
    if (!result.affected) throw new NotFoundException({ code: 'not_found', message: 'Người dùng không tồn tại.' });
  }

  toPublicUser(user: UserEntity): PublicUserDto {
    return { id: user.id, email: user.email, createdAt: user.createdAt.toISOString() };
  }
}

import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Sql } from 'postgres';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService implements OnModuleInit {
  private logger = new Logger(UsersService.name);

  constructor(@Inject('PG_CONNECTION') private readonly sql: Sql) {}

  async findOneByUsername(username: string): Promise<User | null> {
    const [user] = await this.sql<User[]>`
        SELECT *
        FROM users
        WHERE username = ${username}
    `;
    return user || null;
  }

  async updatePassword(userId: number, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.sql`
        UPDATE users
        SET password = ${hashedPassword}
        WHERE id = ${userId}
    `;
  }

  async getBalanceById(userId: number, sql?: Sql): Promise<number> {
    const [user] = await (sql || this.sql)<User[]>`
      SELECT balance
      FROM users
      WHERE id = ${userId}
    `;

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.balance;
  }

  async deductBalance(
    userId: number,
    amount: number,
    sql?: Sql,
  ): Promise<void> {
    const currentBalance = await this.getBalanceById(userId, sql);

    if (currentBalance < amount) {
      throw new Error('Insufficient balance');
    }

    await (sql || this.sql)`
      UPDATE users
      SET balance = balance - ${amount}
      WHERE id = ${userId}
    `;
  }

  async createDefaultUser(): Promise<void> {
    const defaultUsername = 'user';
    const defaultPassword = 'password';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const existingUser = await this.findOneByUsername(defaultUsername);

    if (!existingUser) {
      await this.sql`
          INSERT INTO users (username, password, balance)
          VALUES (${defaultUsername}, ${hashedPassword}, 10000.0)
      `;
      this.logger.log('Default user created');
    }
  }

  async onModuleInit() {
    await this.createDefaultUser();
  }
}

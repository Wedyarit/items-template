import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ItemsModule } from './items/items.module';
import { PurchasesModule } from './purchases/purchases.module';
import jwtConfig from './config/jwt.config';
import databaseConfig from './config/database.config';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import redisConfig from './config/redis.config';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ItemsModule,
    PurchasesModule,
    DatabaseModule,
    RedisModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig, databaseConfig, redisConfig],
    }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}

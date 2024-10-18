import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as postgres from 'postgres';

@Global()
@Module({
  providers: [
    {
      provide: 'PG_CONNECTION',
      useFactory: (configService: ConfigService) => {
        return postgres({
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          database: configService.get<string>('database.database'),
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password'),
          transform: postgres.toCamel,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['PG_CONNECTION'],
})
export class DatabaseModule {}

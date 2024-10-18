import { Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { ItemsModule } from '../items/items.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ItemsModule, UsersModule],
  controllers: [PurchasesController],
  providers: [PurchasesService],
})
export class PurchasesModule {}

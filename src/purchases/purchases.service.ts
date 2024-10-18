import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Sql } from 'postgres';
import { ItemsService } from '../items/items.service';
import { UsersService } from '../users/users.service';
import { Item } from '../items/entities/item.entity';

@Injectable()
export class PurchasesService {
  constructor(
    @Inject('PG_CONNECTION') private readonly sql: Sql,
    private readonly itemsService: ItemsService,
    private readonly usersService: UsersService,
  ) {}

  async purchase(
    itemId: number,
    quantity: number,
    userId: number,
  ): Promise<number> {
    return this.sql.begin(async (sql) => {
      const item = await this.findItemById(itemId, sql);
      const totalCost = item.suggestedPrice * quantity;

      const userBalance = await this.usersService.getBalanceById(userId, sql);
      if (userBalance < totalCost) {
        throw new BadRequestException('Insufficient balance');
      }

      await this.usersService.deductBalance(userId, totalCost, sql);
      await this.recordPurchase(userId, itemId, quantity, totalCost, sql);

      return await this.usersService.getBalanceById(userId, sql);
    });
  }

  private async findItemById(itemId: number, sql?: Sql): Promise<Item> {
    const item = await this.itemsService.findById(itemId, sql);
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return item;
  }

  private async recordPurchase(
    userId: number,
    itemId: number,
    quantity: number,
    totalCost: number,
    sql?: Sql,
  ): Promise<void> {
    await (this.sql || sql)`
      INSERT INTO purchases (user_id, item_id, quantity, total_price, purchase_date)
      VALUES (${userId}, ${itemId}, ${quantity}, ${totalCost}, ${new Date()})
    `;
  }
}

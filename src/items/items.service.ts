import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import axios from 'axios';
import { Sql } from 'postgres';
import { ApiItem } from './interfaces/api-item.interface';
import { Item } from './entities/item.entity';
import { RedisService } from '../redis/redis.service';
import { CacheKey } from '../redis/enums/cache-key.enum';

@Injectable()
export class ItemsService implements OnModuleInit {
  private readonly logger = new Logger(ItemsService.name); // Create a logger instance

  constructor(
    @Inject('PG_CONNECTION') private readonly sql: Sql,
    private readonly redisService: RedisService,
  ) {}

  async findAll(limit: number, page: number): Promise<Item[]> {
    const cacheKey = `${CacheKey.ITEMS}:${page}:${limit}`;
    let items = await this.redisService.get<Item[]>(cacheKey);

    if (!items) {
      items = await this.sql<Item[]>`
      SELECT * 
      FROM items 
      ORDER BY id 
      LIMIT ${limit} OFFSET ${limit * page}
    `;

      void this.redisService.set<Item[]>(cacheKey, items, 3600);
    }

    return items;
  }

  async findById(id: number, sql?: Sql): Promise<Item> {
    const [item] = await (sql || this.sql)<Item[]>`SELECT *
      FROM items
      WHERE id = ${id}
      LIMIT 1`;

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    return item;
  }

  async fetch() {
    this.logger.log(`Fetching items...`);

    const [itemsResponse, tradableItemsResponse] = await Promise.all([
      axios.get<ApiItem[]>('https://api.skinport.com/v1/items'),
      axios.get<ApiItem[]>('https://api.skinport.com/v1/items?tradable=1'),
    ]);

    const items = itemsResponse.data;
    const tradableItems = tradableItemsResponse.data;

    const sortedItems = items.sort((a, b) => {
      if (a.market_hash_name < b.market_hash_name) return -1;
      if (a.market_hash_name > b.market_hash_name) return 1;
      return 0;
    });

    const tradableItemsMap = new Map();
    for (const tradableItem of tradableItems) {
      tradableItemsMap.set(
        tradableItem.market_hash_name,
        tradableItem.min_price,
      );
    }

    await this.sql.begin(async (sql) => {
      try {
        for (const item of sortedItems) {
          const tradableMinPrice =
            tradableItemsMap.get(item.market_hash_name) || null;

          await sql`
              INSERT INTO items (market_hash_name, currency, suggested_price, item_page, market_page, min_price,
                                 tradable_min_price, max_price, mean_price, median_price, quantity, created_at,
                                 updated_at)
              VALUES (${item.market_hash_name}, ${item.currency}, ${item.suggested_price}, ${item.item_page},
                      ${item.market_page}, ${item.min_price}, ${tradableMinPrice}, ${item.max_price},
                      ${item.mean_price},
                      ${item.median_price}, ${item.quantity}, ${new Date()}, ${new Date()})
          `;
        }
      } catch (error) {
        this.logger.error('Transaction error:', error);
      }
    });
  }

  async onModuleInit() {
    const [{ count }] = await this.sql`SELECT COUNT(*) AS count
                                       FROM items`;
    if (count == 0) {
      await this.fetch();
    }
  }
}

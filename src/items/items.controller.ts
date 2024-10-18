import { Controller, Get, Query } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@Controller('items')
@ApiBearerAuth()
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit the number of items to return',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number of items to return',
  })
  async findAll(@Query('limit') limit = 10, @Query('page') page = 0) {
    return this.itemsService.findAll(+limit, +page);
  }
}

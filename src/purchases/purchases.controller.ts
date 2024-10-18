import {
  Body,
  Controller,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PurchaseItemDto } from './dto/purchase-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller()
@ApiBearerAuth()
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/items/:id/purchase')
  async purchase(
    @Param('id') itemId: number,
    @Body() createPurchaseDto: PurchaseItemDto,
    @Request() req: { user: AuthUser },
  ) {
    const updatedBalance = await this.purchasesService.purchase(
      itemId,
      createPurchaseDto.quantity,
      req.user.userId,
    );
    return { updatedBalance };
  }
}

import { IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseItemDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  quantity: number;
}

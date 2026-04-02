import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetInventoyItemsCostQueryDto {
  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The date to get the inventory cost for',
    example: '2021-01-01',
  })
  date: Date;

  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(Number);
    if (typeof value === 'string') return value.split(',').map(Number);
    return [Number(value)];
  })
  @ApiProperty({
    description: 'The ids of the items to get the inventory cost for',
    example: [1, 2, 3],
  })
  itemsIds: Array<number>;
}

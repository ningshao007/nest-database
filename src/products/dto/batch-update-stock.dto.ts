import { IsArray, IsUUID, IsNumber, Min, ArrayMinSize } from "class-validator";

export class BatchUpdateStockDto {
  @IsArray({ message: "updates 必须是数组" })
  @ArrayMinSize(1, { message: "至少需要更新一个商品" })
  updates: UpdateStockItemDto[];
}

export class UpdateStockItemDto {
  @IsUUID("4", { message: "商品ID必须是有效的UUID格式" })
  productId: string;

  @IsNumber()
  @Min(0, { message: "库存数量不能为负数" })
  quantity: number;
}

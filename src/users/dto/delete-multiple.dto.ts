import { IsArray, IsUUID, ArrayMinSize } from "class-validator";

export class DeleteMultipleDto {
  @IsArray({ message: "userIds 必须是数组" })
  @ArrayMinSize(1, { message: "至少需要选择一个用户" })
  @IsUUID("4", { each: true, message: "每个用户ID必须是有效的UUID格式" })
  userIds: string[];
}

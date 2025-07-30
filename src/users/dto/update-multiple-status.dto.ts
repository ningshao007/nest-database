import { IsArray, IsEnum, IsUUID, ArrayMinSize } from "class-validator";
import { UserStatus } from "../user.entity";

export class UpdateMultipleStatusDto {
  @IsArray()
  @ArrayMinSize(1, { message: "至少需要选择一个用户" })
  @IsUUID("4", { each: true, message: "每个用户ID必须是有效的UUID格式" })
  userIds: string[];

  @IsEnum(UserStatus, { message: "状态必须是有效的用户状态" })
  status: UserStatus;
}

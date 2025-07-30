import { IsUUID, IsNumber, Min } from "class-validator";

export class TransferBalanceDto {
  @IsUUID("4", { message: "转出用户ID必须是有效的UUID格式" })
  fromUserId: string;

  @IsUUID("4", { message: "转入用户ID必须是有效的UUID格式" })
  toUserId: string;

  @IsNumber()
  @Min(0.01, { message: "转账金额必须大于0" })
  amount: number;
}

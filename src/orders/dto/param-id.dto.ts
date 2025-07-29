import { IsUUID } from "class-validator";

export class ParamIdDto {
  @IsUUID("4", { message: "ID 必须是有效的 UUID 格式" })
  id: string;
}

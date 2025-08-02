import { IsObject, IsOptional, MaxLength } from "class-validator";

export class SearchAttributesDto {
  @IsObject({ message: "attributes 必须是对象" })
  @IsOptional()
  @MaxLength(1000, { message: "attributes 对象过大" })
  attributes: Record<string, any>;
}

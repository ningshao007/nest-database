import { IsNumber, Min, Max } from "class-validator";

export class UpdateRatingDto {
  @IsNumber({}, { message: "评分必须是数字" })
  @Min(1, { message: "评分不能小于1" })
  @Max(5, { message: "评分不能大于5" })
  rating: number;
}

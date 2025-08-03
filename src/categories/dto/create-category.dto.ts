import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsObject,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  metadata?: {
    [key: string]: string | number | boolean;
  };
}

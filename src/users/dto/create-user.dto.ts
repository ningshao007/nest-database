import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
  MaxLength,
  Matches,
  MinLength,
} from "class-validator";
import { UserRole, UserStatus } from "../user.entity";

export class CreateUserDto {
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: "用户名只能包含字母、数字和下划线" })
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: "密码至少8个字符" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/, {
    message: "密码必须包含大小写字母、数字和特殊字符",
  })
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;

  @IsOptional()
  preferences?: Record<string, any>;
}

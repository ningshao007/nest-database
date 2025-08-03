import { IsString, IsNotEmpty } from "class-validator";

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: "当前密码不能为空" })
  currentPassword: string;

  @IsString()
  @IsNotEmpty({ message: "新密码不能为空" })
  newPassword: string;
}

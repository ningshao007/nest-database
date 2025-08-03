import { IsString, IsNotEmpty } from "class-validator";

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: "用户名或邮箱不能为空" })
  username: string; // 可以是用户名或邮箱

  @IsString()
  @IsNotEmpty({ message: "密码不能为空" })
  password: string;
}

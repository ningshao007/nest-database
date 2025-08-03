import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { PasswordService } from "../common/services/password.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private passwordService: PasswordService
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.usersService.findByUsernameOrEmail(username);

    if (!user) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    if (user.status !== "active") {
      throw new BadRequestException("账户已被禁用，请联系管理员");
    }

    const { password: _, ...userWithoutPassword } = user;

    return {
      message: "登录成功",
      user: userWithoutPassword,
      loginTime: new Date().toISOString(),
    };
  }

  async validateUser(userId: string) {
    return await this.usersService.findOne(userId);
  }

  async register(registerDto: RegisterDto) {
    const { username, email } = registerDto;

    const existingUserByUsername =
      await this.usersService.findByUsername(username);
    if (existingUserByUsername) {
      throw new ConflictException("用户名已存在");
    }

    const existingUserByEmail = await this.usersService.findByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictException("邮箱已存在");
    }

    const user = await this.usersService.create(registerDto);

    const { password: _, ...userWithoutPassword } = user;

    return {
      message: "注册成功",
      user: userWithoutPassword,
      registerTime: new Date().toISOString(),
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.usersService.findOne(userId);

    const isCurrentPasswordValid = await this.passwordService.comparePassword(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException("当前密码错误");
    }

    if (!this.passwordService.validatePasswordStrength(newPassword)) {
      throw new BadRequestException(
        "新密码必须至少8个字符，包含大小写字母、数字和特殊字符"
      );
    }

    const hashedNewPassword =
      await this.passwordService.hashPassword(newPassword);

    await this.usersService.update(userId, {
      password: hashedNewPassword,
    });

    return {
      message: "密码修改成功",
      changeTime: new Date().toISOString(),
    };
  }
}

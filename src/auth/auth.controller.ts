import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post("change-password/:userId")
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Param("userId") userId: string,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return await this.authService.changePassword(userId, changePasswordDto);
  }

  @Get("profile/:userId")
  async getProfile(@Param("userId") userId: string) {
    const user = await this.authService.validateUser(userId);
    const { password: _, ...userWithoutPassword } = user;
    return {
      message: "获取用户信息成功",
      user: userWithoutPassword,
    };
  }
}

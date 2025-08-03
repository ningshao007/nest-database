import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";

@Injectable()
export class PasswordService {
  private readonly saltRounds = 12; // 加密强度

  /**
   * 加密密码
   * @param password 明文密码
   * @returns 加密后的密码
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * 验证密码
   * @param password 明文密码
   * @param hashedPassword 加密后的密码
   * @returns 是否匹配
   */
  async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * 检查密码强度
   * @param password 密码
   * @returns 是否满足强度要求
   */
  validatePasswordStrength(password: string): boolean {
    // 至少8个字符，包含大小写字母、数字和特殊字符
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  }
}

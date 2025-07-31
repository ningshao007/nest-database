import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";

@Injectable()
export class EmailValidationPipe implements PipeTransform {
  transform(value: string): string {
    if (!value || !this.isValidEmail(value)) {
      throw new BadRequestException("邮箱格式无效");
    }
    return value.toLowerCase(); // 统一转换为小写
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

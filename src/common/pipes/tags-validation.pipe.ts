import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";

@Injectable()
export class TagsValidationPipe implements PipeTransform {
  transform(value: string): string[] {
    if (!value || value.trim().length === 0) {
      throw new BadRequestException("标签参数不能为空");
    }

    const tagArray = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (tagArray.length === 0) {
      throw new BadRequestException("至少需要提供一个有效标签");
    }

    // 验证每个标签的长度
    for (const tag of tagArray) {
      if (tag.length > 50) {
        throw new BadRequestException(`标签 "${tag}" 长度不能超过50个字符`);
      }
      if (tag.length < 1) {
        throw new BadRequestException("标签不能为空字符串");
      }
    }

    return tagArray;
  }
}

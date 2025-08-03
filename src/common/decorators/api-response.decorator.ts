import { applyDecorators, Type } from "@nestjs/common";
import { ApiOkResponse, getSchemaPath, ApiProperty } from "@nestjs/swagger";

// 创建一个通用的响应DTO
export class ApiResponseDto<T> {
  @ApiProperty({ description: "响应状态码", example: 0, enum: [0, 1] })
  code: number;

  @ApiProperty({ description: "响应消息", example: "Success" })
  message: string;

  @ApiProperty({ description: "响应数据" })
  data: T;

  @ApiProperty({
    description: "响应时间戳",
    example: "2024-01-01T00:00:00.000Z",
  })
  timestamp: string;

  @ApiProperty({ description: "请求路径", example: "/api/users" })
  path: string;
}

export const ApiResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: {
                $ref: getSchemaPath(model),
              },
            },
          },
        ],
      },
    })
  );
};

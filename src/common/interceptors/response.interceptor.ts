import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ApiProperty } from "@nestjs/swagger";

export class Response<T> {
  @ApiProperty({ description: "响应状态码", example: 0, enum: [0, 1] })
  code: number;

  @ApiProperty({ description: "响应消息", example: "Success" })
  message: string;

  @ApiProperty({ description: "响应数据" })
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();

    return next.handle().pipe(
      map((data) => ({
        code: 0,
        message: "Success",
        data,
      }))
    );
  }
}

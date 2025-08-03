import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      // 只保留DTO中定义的属性，删除其他属性
      whitelist: true,
      // 如果请求中包含DTO中没有的属性，则抛出异常
      forbidNonWhitelisted: true,
      // 自动转换请求中的数据类型
      transform: true,
    })
  );

  const config = new DocumentBuilder()
    .setTitle("API Documentation")
    .setDescription("API documentation for the application")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, documentFactory);

  app.setGlobalPrefix("");

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();

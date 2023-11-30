import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception';
import { ApiKeyGuard } from './common/guards/api-key';
import { WrapResponseInterceptor } from './common/interceptor/wrap-response';
import { Timeoutnterceptor } from './common/interceptor/timout';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { // 全局数据类型的隐式转换
      enableImplicitConversion: true,
    }
  }));
  app.useGlobalFilters(new HttpExceptionFilter());
  // app.useGlobalGuards(new ApiKeyGuard());
  app.useGlobalInterceptors(new WrapResponseInterceptor(), new Timeoutnterceptor());
  await app.listen(3000);
}
bootstrap();

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from './guards/api-key';
import { ConfigModule } from '@nestjs/config';
import { LoggingMiddleware } from './middleware/logging.middleware';

@Module({
  imports: [
    ConfigModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard
    }
  ]
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) { // MiddlewareConsumer 提供了一组方法将中间件绑定到特定的路由
    consumer.apply(LoggingMiddleware).forRoutes("*");  
  }
}

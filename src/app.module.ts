import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoffeesModule } from './coffees/coffees.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    CoffeesModule,
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: "test",
      password: "123456",
      database: "nest-coffee",
      autoLoadEntities: true, // 自动加载模块
      synchronize: true, // Typeorm 每次运行实体时都会与数据库同步，确保在生产环境下禁用它
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

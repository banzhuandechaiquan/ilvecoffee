import { Injectable, Module } from '@nestjs/common';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coffee } from './entities/coffees.entity';
import { Flavor } from './entities/flavor.entity';
import { Event } from 'src/events/entities/event.entity';
import { COFFEE_BRANDS } from './coffees.constants';
import { DataSource } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import coffeeConfig from './config/coffee.config';

// @Injectable()
// export class CoffeeBrandFactory {
//   create() {
//     // do something...
//     return ["雀氏", "瑞幸", "1"];
//   }
// }

@Module({
  imports: [
    TypeOrmModule.forFeature([Coffee, Flavor, Event]),
    ConfigModule.forFeature(coffeeConfig), // 部分注册
  ],
  exports: [CoffeesService],
  controllers: [CoffeesController],
  providers: [
    CoffeesService,
    // CoffeeBrandFactory, // // 需要先注册工厂函数所需的提供者
    // {
    //   provide: COFFEE_BRANDS,
    //   useFactory: (brandFactory: CoffeeBrandFactory) => brandFactory.create(),
    //   inject: [CoffeeBrandFactory]
    // }
    {
      provide: COFFEE_BRANDS,
      useFactory: async (dataSource: DataSource): Promise<string[]> => {
        // const coffeeBrands = await dataSource.query('SELECT * ...');
        const coffeeBrands = await Promise.resolve(["雀氏", "瑞幸", "666"]); // 模拟从数据库获取数据后才返回
        return coffeeBrands;
      },
      inject: [DataSource],
    }
  ], 
})
export class CoffeesModule {}

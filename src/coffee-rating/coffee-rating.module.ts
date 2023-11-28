import { Module } from '@nestjs/common';
import { CoffeeRatingService } from './coffee-rating.service';
import { CoffeesModule } from 'src/coffees/coffees.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    CoffeesModule,
    DatabaseModule.register({
      type: "mysql",
      host: "localhost",
      port: 3306,
    })
  ],
  providers: [CoffeeRatingService],
})
export class CoffeeRatingModule {}

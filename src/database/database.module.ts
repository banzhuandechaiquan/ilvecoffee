import { DynamicModule, Module } from '@nestjs/common';
import { DataSourceOptions, DataSource } from 'typeorm';

@Module({})
export class DatabaseModule {
  static register(options: DataSourceOptions): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: "CONNECTON",
          useValue: new DataSource(options)
        }
      ]
    }
  }
}

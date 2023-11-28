## **第一章**

### 一、控制器：controller

1.nest g co coffees --no-spec

2.指定位置创建文件：
nest g class <directory-path>/<class-name>

--dry-run：测试在哪创建，实际并不会创建文件

3.原生响应

```typescript
findAll(@Res() response) {
  response.status(202).send("这个请求返回所有咖啡！");
}
```

默认为 express， 需要用 express 返回响应结果的方式



### 二、服务：service

创建：nest g s coffees --no-spec



### 三、异常：HttpException

两个参数：① 错误响应的消息字符串 ② 响应的状态码

```typescript
throw new HttpException(`找不到id为${id}的咖啡`, HttpStatus.NOT_FOUND);
```

辅助方法：

```typescript
throw new NotFoundException(`找不到id为${id}的咖啡`);
```



### 四、模块：module

创建：nest g mo coffees --no-spec

@module 的四个属性：① controllers； ② providers； ③ imports； ④ exports；

每一个模块都是封闭独立的，需要导入别的模块导出的提供者，才可以在本模块中使用。



### 五、数据传输对象： DTO

用于封装数据并将其从一个应用程序发送到另一个应用程序。帮助系统定义接口的输入和输出。

nest g class coffees/dto/create-coffee.dto --no-spec



#### 1.ValidationPipe

 确保请求传递的参数正确（确保必填项等）的验证规则

① 安装库：

npm i class-validator class-transformer

② 开启全局管道验证

```typescript
app.useGlobalPipes(new ValidationPipe());
```

③ DTO 添加验证规则

```typescript
import { IsString } from "class-validator";

export class CreateCoffeeDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly brand: string;

  @IsString({ each: true })
  readonly flavors: string[];
}
```



#### 2.常见的类型转换

安装：

 npm i @nestjs/mapped-types

例子：设置 DTO 中所有选项均为可选

```typescript
import { PartialType } from "@nestjs/mapped-types";
import { CreateCoffeeDto } from "./create-coffee.dto";

export class UpdateCoffeeDto extends PartialType(CreateCoffeeDto ) {}
```



#### 3.设置白名单

① 过滤不应有处理程序方法接收的参数

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
}));
```

② 存在非白名单属性时停止处理请求程序的执行并抛出错误

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
}));
```

③ 为传入参数中的"基本类型"执行类型转换

解决：让传入对象为 DTO 对象的实例

```typescript
transform: true,
```



## **第二章**

### 一、docker

#### 1.安装 dokcer 并下载 mysql 镜像.略

#### 2.根目录下创建一个 docker-compose.yml 文件，并写入

```yaml
version: '3'

services:
  db:
    image: mysql
    restart: always
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: 123456
```

#### 3.启动 mysql 容器

docker-compose up -d

### 二、Typeorm

#### 1.安装依赖项

npm i @nestjs/typeorm typeorm mysql

#### 2.通过 Typeorm 配置数据库与应用程序之间的关联

在 app.module 文件中的 @module 装饰器中配置与 typeorm 的链接以及一些可用于将其与 Nest 集成的附加工具

```typescript
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
```

#### 3.实体与列

① 在 nest 中使用实体表示类与数据库表的关系，通过一个实体装饰器 @Entity() 装饰的类为数据库中一个实际存在的表

② 列装饰器映射表中的每一列属性： @PrimaryGeneratedColumn()、@Column();

```typescript
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// @Entity("table-name") // 定义表名
@Entity()
export class coffee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  brand: string;

  @Column("json", { nullable: true })
  flavors: string[];
}
```

#### 4.在模块中注册实体

```typescript
import { coffee } from './entities/coffees.entity';
imports: [
  TypeOrmModule.forFeature([coffee])
],
```

5.实体存储库（Repository 类）

使用 typeorm 创建的实体都有自己的存储库，通过 Repository 类的各种方法来与存储在数据库中的记录进行交互

```typescript
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { coffee } from './entities/coffees.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCoffeeDto } from './dto/create-coffee.dto';

@Injectable()
export class CoffeesService {
  private coffees: coffee[] = [
    {
      id: 1,
      name: "生椰拿铁",
      brand: "瑞幸",
      flavors: ["美味的", "浓郁的"],
    }
  ];

  constructor(
    @InjectRepository(coffee) 
    private readonly coffeeRepository: Repository<coffee>
  ) {}

  findAll() {
    return this.coffeeRepository.find();
  }

  async findOne(id: string) {
    // throw "随机错误";
    const coffee = await this.coffeeRepository.findOne({ where: { id: +id }});
    if(!coffee) {
      // throw new HttpException(`找不到id为${id}的咖啡`, HttpStatus.NOT_FOUND);
      throw new NotFoundException(`找不到id为${id}的咖啡`);
    }
    return coffee;
  }

  create(createCoffeeDto: CreateCoffeeDto) {
    const coffee = this.coffeeRepository.create(createCoffeeDto);
    return this.coffeeRepository.save(coffee);
  }

  async update(id: string, updateCoffeeDto: any) {
    // 先检查数据库中是否存在该实体，如果存在，则检索它且与之相关的内容，并将其内容替换为 updateCoffeeDto
    // 如果检索不到则返回 undefined
    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto
    })
    if(!coffee) {
      throw new NotFoundException(`找不到id为${id}的咖啡`);
    }
    return this.coffeeRepository.save(coffee);
  }

  async remove(id: string) {
    const coffee = await this.findOne(id);
    return this.coffeeRepository.remove(coffee);
  }
}

```

#### 5.多对多关系

① 定义关系
@ManyToMany() 装饰器：定义表与表之间的关系

@JoinTable() 装饰器：确定表之间的所属关系

```typescript
// coffees.entity.ts

@JoinTable()
@ManyToMany(type => Flavor, flavor => flavor.coffees)
flavors: string[];
```

```typescript
// flavor.entity.ts

import { Column, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Coffee } from "./coffees.entity";

export class Flavor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(type => Coffee, coffee => coffee.flavors)
  coffees: Coffee[];
}
```

注：风味表记得在模块中进行注册

② 将风味表数据填充到响应中

```typescript
 return this.coffeeRepository.find({
   relations: ['flavors']
 });
```

#### 6.业务场景(级联插入)

内容：我们将新咖啡添加到我们的数据库表中，并将其风味插入到数据库中（级联插入）

① 开启关系级联插入/更新

```typescript
@ManyToMany(
  type => Flavor, 
  flavor => flavor.coffees,
  {
  cascade: true,  // ['insert']
  }
)
```

② 在 coffeeSerice.ts 中引入 flavorRepository

```typescript
@InjectRepository(Flavor)
private readonly flavorRepository: Repository<Flavor>
```

③ 将风味名称输入参数并返回

首先创建方法 => 如果数据库中已经存在指定名称的风味，则返回，否则创建新的实例

```typescript
private async preloadFlavorByName(name: string): Promise<Flavor> {
  // 如果数据库中已经存在指定名称的风味，则返回，否则创建新的实例
  const existingFlavor = await this.flavorRepository.findOne({
  where: { name: name }, 
  });
  if(existingFlavor) {
  return existingFlavor;
  }
  return this.flavorRepository.create({ name });
}
```

然后在 create 和 update 中，将风味数组进行循环，以确定是否添加到数据库，同时将结果返回并存入数据库

```typescript
async create(createCoffeeDto: CreateCoffeeDto) {
  // 将风味数组进行循环，以确定是否添加到数据库,同时将结果返回并存入数据库
  const flavors = await Promise.all(
  createCoffeeDto.flavors.map(name => this.preloadFlavorByName(name)),
  );

  // 将 createCoffeeDto 与更新的 Flavor 实体合并
  const coffee = this.coffeeRepository.create({
  ...createCoffeeDto,
  flavors,
  });
  return this.coffeeRepository.save(coffee);
  }

  async update(id: string, updateCoffeeDto: any) {
  // 同上
  const flavors = updateCoffeeDto.flavors && 
  (await Promise.all(
  updateCoffeeDto.flavors.map(name => this.preloadFlavorByName(name)),
  ));

  // 先检查数据库中是否存在该实体，如果存在，则检索它且与之相关的内容，并将其内容替换为 updateCoffeeDto
  // 如果检索不到则返回 undefined
  const coffee = await this.coffeeRepository.preload({
  id: +id,
  ...updateCoffeeDto,
  flavors
  })
  if(!coffee) {
  throw new NotFoundException(`找不到id为${id}的咖啡`);
  }
  return this.coffeeRepository.save(coffee);
}
```

#### 7.limit 和 offset

① 新建 DTO (创建在 common 文件夹下)

```typescript
import { IsOptional, IsPositive } from "class-validator";

export class PaginationQueryDto {
  @IsOptional() // 标记属性为可选属性，即属性缺失也不会报错
  @IsPositive() // 检查是否为证书
  // @Type(() => Number) // 由全局管道中开启数据类型的隐式转换
  limit: number;

  @IsOptional()
  @IsPositive()
  offset: number;
}
```

② 验证管道添加数据类型隐式转换

```typescript
// main.ts

app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: { // 全局数据类型的隐式转换
    enableImplicitConversion: true,
  }
}));
```

③ 修改控制器和服务中的方法 => 传入 DTO 和 修改 Repository 的 find 方法

控制器.略

```typescript
findAll(paginationQueryDto: PaginationQueryDto) {
  const { limit, offset } = paginationQueryDto;
  return this.coffeeRepository.find({
  relations: ['flavors'],
  take: limit,
  skip: offset,
  });
}
```

####  ***8.业务场景(事务)

产品团队希望用户能够推荐不同的咖啡

技术： 使用 QueryRunner，可以完全控制事务

① 根目录下 events 文件夹实体目录下新建 DTO

```typescript
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  name: string;

  @Column("json")
  payload: Record<string, any> // 对象：key 为 string, value 为 any
}
```

② 在 coffee.module 中注册实体并在 coffee.entity 中创建 "推荐" 列

```typescript
@Column({ default: 0 })
recommendations: number;
```

③ 在 coffee.service 中使用 Connection 对象创建事务 =>创建连接成功后，开始执行事务，并设置回滚

```typescript
@InjectDataSource()
private readonly dataSource: DataSource,
```

```typescript
// 确保对数据库的多个操作只有在都成功时才执行
async recommendCoffee(coffee: Coffee) {
  const queryRunner = this.dataSource.createQueryRunner();

  await queryRunner.connect(); // 连接
  await queryRunner.startTransaction(); // 开始交易
  try {
    coffee.recommendations++;

    const recommendEvent = new Event();
    recommendEvent.name = "recommend_coffee";
    recommendEvent.type = "coffee";
    recommendEvent.payload = { coffeeId: coffee.id };
  } catch (err) {
    await queryRunner.rollbackTransaction(); // 出错回滚
  } finally {
    await queryRunner.release(); // 关闭
  }
}
```

####  9.索引-加速数据库搜索引擎

类或字段加 @Index() 装饰器

```typescript
@Index(["name", "type"])
@Entity()
export class Event {}
```

```typescript
@Index()
@Column()
name: string;
```



#### ***10.数据库迁移

p33



## 第三章

### 一、依赖注入

#### 1.nest 依赖注入原理/实现/传递

​		依赖注入是一种技术，通过依赖注入，对象之间可以创建各种关系。在 Nest 应用程序中，关于所有依赖注入繁重的工作将委托给 "控制反转"(IpC)容器处理， "IpC" 容器为 NestJs 运行时系统。开发者只需要在控制器中处理相应请求。本质上，当我们“询问”类构造函数中的依赖项时。NestJs 处理并检索返回给我们的对象，以及它可能需要的任何依赖项，等等......

步骤：

① 通过 @Injectable() 装饰器声明了一个可以由 Nest "容器" 管理的类，这个装饰器将类标记为"提供者"。（例如：CoffeeService）

② 在 module 中通过 providers 注册提供者，让 Nest 知道该类为一个提供者

③ 当类中的构造函数中请求某个类，这个请求告诉 Nest 将提供程序 "注入" 到我们的控制器中，以便我们可以使用它。(例如： CoffeeController 构造函数中注入 CoffeeService 服务类)

完整写法：

```typescript
providers: [
  {
  provide: CoffeesService, // TOKEN
  useClass: CoffeesService, // 相关联的类
  }
],
```

注：当 Nest 实例化控制器时，首先检查是否有依赖项。如果有，Nest 容器将会通过 "TOKEN" 找到依赖项 ，并且返回依赖项。或者，在单例的正常情况下，如果已在其他地方请求过，则返回现有实例。

依赖传递传递：

​		上述依赖分析是可以传递的，例如服务类（提供者）本身也具有依赖关系，也将会得到解决。本质上依赖关系自下而上解决。

#### 2.提供者的作用域

​		默认情况下，NestJs 模块封装了自身的提供者，因此无法使用不直接属于本模块或其他模块未导出的提供者。 注入非本模块的提供者时，需要先 "导入" 其他已明确导出 "提供者" 的模块。另外，从模块中 "导出" 的提供者可以看作//该模块的公共接口。

```typescript
// coffees.module.ts

import { CoffeesService } from './coffees.service';
exports: [CoffeesService],
```

```typescript
// coffee-rating.module.ts

import { CoffeesModule } from 'src/coffees/coffees.module';
imports: [CoffeesModule],
```

```typescript
// coffee-rating.service.ts

import { CoffeesService } from 'src/coffees/coffees.service';
constructor(private readonly coffeesService: CoffeesService) {}
```

#### 3.自定义提供程序(提供者)

① useValue

使用场景：常量，Nest 使用外部库，或使用 Mock 进行替换服务的真实实现

案例：使用 MockCoffeeService 模拟服务实现

```typescript
class MockCoffeeService {};

@Module({
  providers: [
    {
      provide: CoffeesService, // TOKEN
      useValue: MockCoffeeService
    }
  ],
})
```

② 自定义 "TOKEN" 令牌

案例：自定义字符串作为提供者令牌

```typescript
providers: [
  CoffeesService,
  {
  provide: COFFEE_BRANDS,
  useValue: ["雀氏", "瑞幸"]
  }
], 
```

注入：使用 @Inject() 装饰器

```typescript
constructor(
	@Inject(COFFEE_BRANDS) coffeeBrands: string[],
) {
	console.log(coffeeBrands);
}
```

 注：COFFEE_BRANDS 变量为常量文件夹定义

```typescript
// coffees.constants.ts

export const COFFEE_BRANDS = "COFFEE_BRANDS";
```

③ useClass

场景：例如应用程序中有一个抽象或默认的 ConfigService 类，根据当前环境，我们需要为 Nest 每个配置服务提供不同的实现

```typescript
class ConfigService {}
class DevelopmentConfigService {}
class ProductionConfigService {}

{
  provide: ConfigService,
  useClass: process.env.NODE_ENV === "development" 
  ? DevelopmentConfigService 
  : ProductionConfigService
}
```

④ useFactory

"动态" 创建提供者。提供者的值基于其他依赖项，可以注入计算返回结果所需的其他提供程序。

简单使用：

```typescript
{
  provide: COFFEE_BRANDS,
  useFactory: () => ["雀氏", "瑞幸"]
}
```

工厂函数注入提供者：

```typescript
@Injectable()
export class CoffeeBrandFactory {
  create() {
    // do something...
    return ["雀氏", "瑞幸"];
  }
}

providers: [
  CoffeesService,
  CoffeeBrandFactory, // 需要先注册工厂函数所需的提供者
  {
    provide: COFFEE_BRANDS,
    useFactory: (brandFactory: CoffeeBrandFactory) => brandFactory.create(),
    inject: [CoffeeBrandFactory]
  }
], 
```

⑤ 异步提供程序

场景：在与数据库连接成功前，不接受请求

使用：将 async/await 与 useFactory 结合使用

```typescript
providers: [
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
```

#### 4.动态模块

场景：通用模块需要在不同情况下有不同的表现

案例：创建一个 DatabaseModule，它可以在实例化之前传递配置设置（模拟）

```typescript
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
```

使用：

```typescript
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

```

#### 5.获得所需提供者生命周期

​		Nest 并不遵循请求/响应的多线程无状态模型，默认情况下每个提供者都是一个单例。例如，在 CoffeeService 中使用 @Injectable() 时，其实是将其传递给具有作用域和 Scope.DEFAULT 的对象。(DEFAULT 是 单例模式 Singleton 的值)。

```typescript
@Injectable({ scope: Scope.DEFAULT })
```

提供者的生命周期与应用程序的生命周期直接相关。

@Injectable() 提供者可用的另外两个声明周期： "瞬态"，"请求范围"。

①  "瞬态" 提供者不会在多个注入对象中共享，注入 "瞬态" 提供者的每个对象都将得到新专用实例

```typescript
@Injectable({ scope: Scope.TRANSIENT })

constructor(
    @InjectRepository(Coffee) 
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>, 
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(COFFEE_BRANDS) coffeeBrands: string[],
  ) {
    console.log("666");
  }
```

打印结果有两次，因此确定该提供者在应用程序中会被多次实例化。

② "请求范围" 为每一个请求提供一个新的提供者实例，在请求完成后，Nest 会自动对实例进行垃圾收集

```typescript
@Injectable({ scope: Scope.REQUEST })
```

​		当对该提供者所处理的程序每发送一次请求时，就会打印一遍，因此提供者为每一次请求单独创建一次实例，并在请求结束后被回收。

### 二、加载运行时配置

#### 1.从当前环境加载配置

① 安装：

npm i @nestjs/config

② 创建 .env 环境文件

```typescript
// .env

DATABASE_USER=test
DATABASE_PASSWORD=123456
DATABASE_NAME=nest-coffee
DATABASE_PORT=3306
DATABASE_HOST=localhost
```

③ 引入配置模块并修改连接数据库配置：

```typescript
imports: [
  ConfigModule.forRoot(), // 默认从应用程序的根目录下查找 .env 文件
  TypeOrmModule.forRoot({
    type: "mysql",
    host: process.env.DATABASE_HOST,
    port: +process.env.DATABASE_PORT,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    autoLoadEntities: true, // 自动加载模块
    synchronize: true, // Typeorm 每次运行实体时都会与数据库同步，确保在生产环境下禁用它
  }),
],
```

#### 2.为 ConfigModule 指定路径

```typescript
ConfigModule.forRoot({
	envFilePath: ".environment",
}),
```

#### 3.禁用加载 .env 文件(例如生产环境下)

```typescript
ConfigModule.forRoot({
  ignoreEnvFile: true, 
}),
```

#### 4.验证环境变量

​		环境变量对于应用程序的正常启动至关重要，必须确保应用程序运行前拥有所有的必需变量，否则，在应用程序启用期间必须抛出异常。

技术：利用 joi 包确保任何重要的环境变量得到验证

① 安装：

npm i  @hapi/joi 

npm i --save-dev @types/hapi__joi

② 定义 joi 验证

```typescript
import * as Joi from '@hapi/joi';

ConfigModule.forRoot({
  validationSchema: Joi.object({
    DATABASE_HOST: Joi.required(),
    DATABASE_PORT: Joi.number().default(3306)
  })
}),
```

#### 5.ConfigService

​		在应用程序中设置了 ConfigModule 后，其带有一个名为 CongifService 的有用服务，它提供了一个 get() 方法来读取我们所有已解析的配置变量。

使用 CongifService：

① 将它从包含的模块 ConfigModule 导入到任何需要使用它的模块

```typescript
// coffee.module.ts

imports: [
  ConfigModule
],
```

② 使用 get 方法

```typescript
export class CoffeesService {
  constructor(
    private readonly configService: ConfigService,
  ) {
    const databaseHost = this.configService.get<string>("DATABASE_HOST", "666"); // 第二个参数为默认值
    console.log(databaseHost);
  }
} 
```

#### 6.自定义配置文件返回嵌套对象

​		自定义配置文件可以让应用程序按照 "业务域" 对相关配置设置进行分组。将相关设置存储在单个文件中，并独立管理它们。

① 新建 src/config/app.config.ts 文件

```typescript
export default () => ({
  environment: process.env.NODE_ENV || "development",
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 3306
  }
})
```

优点：可以完全控制返回的配置对象，可以添加任何逻辑：转换类型/设置默认值

② 使用自定义配置文件：

```typescript
// app.module.ts

@module({
  imports:[
    ConfigModule.forRoot({
      load: [appConfig] // 接受一个配置数组
    }),
  ]
})
```

```typescript
// coffee.service.ts

export class CoffeesService {
  constructor(
    private readonly configService: ConfigService,
  ) {
    const databaseHost = this.configService.get("database.host", "666"); // 第二个参数为默认值
    console.log(databaseHost);
  }
}
```

缺点：没有类型推断

#### 7.自定义配置文件命名空间

解决问题：

配置命名空间和部分注册来验证配置设置，以此来解决大项目中单独服务于业务的各种配置文件和类型推断的问题。

① 新建 src/coffee/config/coffee.config.ts 文件

```typescript
// coffee/config/coffee.config.ts

import { registerAs } from "@nestjs/config";
 
// registerAs 函数在 key 下注册一个命名空间的配置对象
export default registerAs("coffees", () => ({
  foo: "bar",
}));
```

② 使用

```typescript
// coffee.module.ts

@Module({
imports: [
  ConfigModule.forFeature(coffeeConfig), // 部分注册
],
```

```typescript
// coffee.service.ts

@Injectable()
export class CoffeesService {
  constructor(
    @Inject(coffeeConfig.KEY)
    private readonly coffeesConfiguration: ConfigType<typeof coffeeConfig>
  ) {
    console.log(coffeesConfiguration.foo);
  }
}
```

#### 8.异步加载提供者

让提供者的导入顺序不会影响到程序的执行。本质上是先执行完同步后再执行异步。

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoffeesModule } from './coffees/coffees.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoffeeRatingModule } from './coffee-rating/coffee-rating.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import appConfig from './config/app.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: "mysql",
        host: process.env.DATABASE_HOST,
        port: +process.env.DATABASE_PORT,
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        autoLoadEntities: true, // 自动加载模块
        synchronize: true, // Typeorm 每次运行实体时都会与数据库同步，确保在生产环境下禁用它
      })
    }),
    ConfigModule.forRoot({
      load: [appConfig] // 接受一个配置数组
    }),
    CoffeesModule,
    CoffeeRatingModule,
    DatabaseModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```


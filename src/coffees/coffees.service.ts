import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffees.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Connection, DataSource, Repository } from 'typeorm';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { Flavor } from './entities/flavor.entity';
import { PaginationQueryDto } from 'src/common/Pagination-query.dto';
import { Event } from 'src/events/entities/event.entity';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee) 
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>, 
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  findAll(paginationQueryDto: PaginationQueryDto) {
    const { limit, offset } = paginationQueryDto;
    return this.coffeeRepository.find({
      relations: ['flavors'],
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    // throw "随机错误";
    const coffee = await this.coffeeRepository.findOne({ 
      where: { id: +id }, 
      relations: ['flavors']
    });
    if(!coffee) {
      // throw new HttpException(`找不到id为${id}的咖啡`, HttpStatus.NOT_FOUND);
      throw new NotFoundException(`找不到id为${id}的咖啡`);
    }
    return coffee;
  }

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

  async remove(id: string) {
    const coffee = await this.findOne(id);
    return this.coffeeRepository.remove(coffee);
  }

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
}

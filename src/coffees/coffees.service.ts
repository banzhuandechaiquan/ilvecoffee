import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { coffee } from './entities/coffees.entity';

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

  findAll() {
    return this.coffees;
  }

  findOne(id: string) {
    // throw "随机错误";
    const coffee = this.coffees.find(item => item.id === +id);
    if(!coffee) {
      // throw new HttpException(`找不到id为${id}的咖啡`, HttpStatus.NOT_FOUND);
      throw new NotFoundException(`找不到id为${id}的咖啡`);
    }
    return coffee;
  }

  create(createCoffeeDto: any) {
    this.coffees.push(createCoffeeDto);
  }

  update(id: string, updateCoffeeDto: any) {
    let index = this.coffees.findIndex(item => item.id === +id);
    if(index >= 0) {
      this.coffees[index] = updateCoffeeDto;
    }
  }

  remove(id: string) {
    const existingCoffee = this.findOne(id);
    if(existingCoffee) {
      let index = this.coffees.findIndex(item => item.id === +id);
      this.coffees.splice(index, 1);
    }
  }
}

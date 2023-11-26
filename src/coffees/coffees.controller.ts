import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { PaginationQueryDto } from 'src/common/Pagination-query.dto';

@Controller('coffees')
export class CoffeesController {
  constructor(private readonly coffeesService: CoffeesService) {}
  // @Get()
  // findAll(@Res() response) {
  //   response.status(202).send("这个请求返回所有咖啡！");
  // }

  @Get()
  findAll(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.coffeesService.findAll(paginationQueryDto);
  }

  @Get(":id")
  findOne(@Param("id") id: number) {
    console.log(typeof id);
    return this.coffeesService.findOne("" + id);
  }

  @Post()
  // @HttpCode(HttpStatus.GONE) // 410
  create(@Body() createCoffeeDto: CreateCoffeeDto) {
    return this.coffeesService.create(createCoffeeDto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateCoffeeDto: UpdateCoffeeDto) {
    return this.coffeesService.update(id, updateCoffeeDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.coffeesService.remove(id);
  }
}

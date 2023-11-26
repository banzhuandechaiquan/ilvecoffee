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
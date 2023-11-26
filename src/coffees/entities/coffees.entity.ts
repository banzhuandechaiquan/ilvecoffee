import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Flavor } from "./flavor.entity";

// @Entity("table-name") // 定义表名
@Entity()
export class Coffee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  brand: string;

  @Column({ default: 0 })
  recommendations: number;

  @JoinTable()
  @ManyToMany(
    type => Flavor, 
    flavor => flavor.coffees,
    {
      cascade: true,  // ['insert'] => 仅插入时可使用级联
    }
  )
  flavors: Flavor[];
}
import { Entity, Column, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Coffee } from "./coffees.entity";

@Entity()
export class Flavor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(type => Coffee, coffee => coffee.flavors)
  coffees: Coffee[];
}
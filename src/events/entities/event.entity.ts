import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index(["name", "type"])
@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Index()
  @Column()
  name: string;

  @Column("json")
  payload: Record<string, any> // 对象：key 为 string, value 为 any
}
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Dev } from "./dev";

@Entity()
export class App extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    appName!: string;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column()
    price!: number;
}

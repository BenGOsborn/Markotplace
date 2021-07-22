import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Dev } from "./dev";

@Entity()
export class App extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @Column()
    title!: string;

    @Column()
    description!: string;

    @Column({ default: 0 })
    price!: number;

    @ManyToOne(() => Dev, (dev) => dev.apps)
    dev!: Dev;
}
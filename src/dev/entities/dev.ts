import {
    BaseEntity,
    Column,
    Entity,
    OneToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user";

@Entity()
export class Dev extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    token!: string;

    @OneToOne(() => User, (user) => user.dev)
    user!: User;
}

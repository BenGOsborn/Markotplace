import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
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

    @Column({ unique: true })
    ghUsername!: string;

    @OneToOne(() => User)
    @JoinColumn()
    user!: User;
}

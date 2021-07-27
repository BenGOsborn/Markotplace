import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { App } from "./app";
import { Dev } from "./dev";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    username!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column({ unique: true })
    stripeCustomerID!: string;

    @OneToOne(() => Dev)
    @JoinColumn()
    dev!: Dev;

    @ManyToMany(() => App)
    @JoinTable()
    apps!: App[];
}

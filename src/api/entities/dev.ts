import {
    BaseEntity,
    Column,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user";
import { App } from "./app";

@Entity()
export class Dev extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    ghAccessToken!: string;

    @Column()
    ghUsername!: string;

    @Column({ unique: true })
    stripeConnectID!: string;

    @OneToOne(() => User, (user) => user.dev)
    user!: User;

    @OneToMany(() => App, (app) => app.dev)
    apps!: App[];
}

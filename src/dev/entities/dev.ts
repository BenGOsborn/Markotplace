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
    token!: string;

    @Column({ unique: true })
    ghUsername!: string;

    @Column({ unique: true, nullable: true })
    stripeConnectID!: string | null;

    @OneToOne(() => User)
    user!: User;

    @OneToMany(() => App, (app) => app.dev)
    apps!: App[];
}

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

    @Column({ type: "int" })
    price!: number;

    @Column()
    ghRepoOwner!: string;

    @Column()
    ghRepoName!: string;

    @Column()
    ghRepoBranch!: string;

    @Column({ unique: true })
    ghWebhookID!: string;

    @Column({ default: 1, type: "int" })
    version!: number;

    @Column()
    env!: string;

    @ManyToOne(() => Dev, (dev) => dev.apps)
    dev!: Dev;
}

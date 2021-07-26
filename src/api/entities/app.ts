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

    @Column({ default: 0, type: "int" })
    price!: number;

    @Column()
    ghRepoOwner!: string;

    @Column()
    ghRepoName!: string;

    // **** PERHAPS WE SHOULD HAVE A BRANCH AS WELL ?

    // **** Also need some way of identifying the app so that the app knows from the webhook
    // **** If I update the repository, I will have to update the webhook to the new repository as well
    // **** This means I should get rid of that check for if a user with the same repo name and owner exists

    @ManyToOne(() => Dev, (dev) => dev.apps)
    dev!: Dev;
}

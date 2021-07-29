import { createConnection } from "typeorm";
import { User } from "../entities/user";
import { Dev } from "../entities/dev";
import { App } from "../entities/app";

// Initialize ORM
export const connectDB = () => {
    createConnection({
        type: "postgres",
        host:
            process.env.ENVIRONMENT === "production"
                ? process.env.POSTGRES_HOST
                : "0.0.0.0",
        database: process.env.POSTGRES_DB,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        synchronize: true,
        entities: [User, Dev, App],
    }).then((connection) => connection.synchronize());
};

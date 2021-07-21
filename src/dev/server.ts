import express from "express";
import { createConnection } from "typeorm";
import { User } from "./entities/user";

// Initialize express
const app = express();
app.use(express.json());

// Initialize ORM
createConnection({
    type: "postgres",
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    synchronize: true,
    entities: [User],
});

// Start the server on the specified port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

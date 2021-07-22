import express from "express";
import { User } from "../entities/user";
import { cacheData, clearCache } from "../utils/cache";
import { registerSchema, updateSchema } from "../utils/joiSchema";
import bcrypt from "bcrypt";
import { protectedMiddleware } from "../utils/middleware";

// Initialize the router
const router = express.Router();

// Register a new user
router.post("/user/register", async (req, res) => {
    // Get data from request
    const {
        username,
        email,
        password,
    }: { username: string; email: string; password: string } = req.body;

    // Validate the data against the schema
    const { error } = registerSchema.validate({ username, email, password });
    if (error) return res.status(400).end(error.details[0].message);

    // Check if the username and email are unique
    const exists = await cacheData(
        `user-register:${username}${email}`,
        async () => {
            const existingUser = await User.findOne({
                where: [{ username }, { email }],
            });
            return existingUser;
        }
    );
    if (typeof exists !== "undefined")
        return res.status(400).end("Username or email already taken");

    // Hash the password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user
    const user = User.create({
        username,
        email,
        password: hashedPassword,
    });
    await user.save();

    // Set the ID of the user in the session
    // @ts-ignore
    req.session.userID = user.id;

    // Return the userID
    res.json({ userID: user.id });
});

// Login a user
router.post("/user/login", async (req, res) => {
    // Get data from request
    const {
        username,
        password,
    }: { username: string; email: string; password: string } = req.body;

    // Get the user if they exist
    const user = await cacheData(`user-login:${username}`, async () => {
        const existingUser = await User.findOne({
            where: { username },
        });
        return existingUser;
    });
    if (typeof user === "undefined")
        return res.status(400).end("User does not exist");

    // Check that the passwords match
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.sendStatus(400);

    // Set the session and the userID
    // @ts-ignore
    req.session.userID = user.id;
    res.json({ userID: user.id });
});

// Validate a users session
router.get("/user/authorized", protectedMiddleware, async (req, res) => {
    // Return the userID
    // @ts-ignore
    return res.json({ userID: req.locals.user.id });
});

// Provide a way for the user to edit their account
router.patch("/user/edit", protectedMiddleware, async (req, res) => {
    // Get the user and extract the userID
    // @ts-ignore
    const { user }: { user: User } = req.locals;
    const { id: userID } = user;

    // Get the data to update
    const {
        email,
        username,
        password,
    }: {
        username: string | undefined;
        email: string | undefined;
        password: string | undefined;
    } = req.body;

    // Check that at least one parameter is specified
    if (
        typeof username === "undefined" &&
        typeof email === "undefined" &&
        typeof password === "undefined"
    )
        return res
            .status(400)
            .end("At least one parameter to modify is required");

    // Verify the data against the schema
    const { error } = updateSchema.validate({ username, email, password });
    if (error) return res.status(400).end(error.details[0].message);

    // Set the data to update
    const updateData: any = {};
    if (typeof username !== "undefined") updateData.username = username;
    if (typeof email !== "undefined") updateData.email = email;
    if (typeof password !== "undefined") {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        updateData.password = hashedPassword;
    }

    // Update the user
    await User.update(userID, updateData);

    // Get the old username and email
    const { username: oldUsername, email: oldEmail } = user;

    // Clear the cached data for the user
    await clearCache(`user-register:${oldUsername}${oldEmail}`);
    await clearCache(`user-login:${oldUsername}`);
    await clearCache(`user-authorized:${oldUsername}`);

    // Return success
    return res.sendStatus(200);
});

// Allow a user to view their apps

// Authenticate a user for accessing an ap

// Export the router
export default router;

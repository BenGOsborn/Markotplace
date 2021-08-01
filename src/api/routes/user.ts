import express from "express";
import { User } from "../entities/user";
import { registerSchema, updateSchema } from "../utils/joiSchema";
import bcrypt from "bcrypt";
import { protectedMiddleware } from "../utils/middleware";
import { stripe } from "../utils/stripe";

// Initialize the router
const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
    // Get data from request
    const {
        username,
        email,
        password,
    }: { username: string; email: string; password: string } = req.body;

    // Validate the data against the schema
    const { error } = registerSchema.validate({ username, email, password });
    if (error) return res.status(400).send(error.details[0].message);

    // Check if the username and email are unique
    const exists = await User.findOne({ where: [{ username }, { email }] });
    if (typeof exists !== "undefined")
        return res.status(400).send("Username or email already taken");

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new Stripe customer for the user
    const stripeCustomerID = (await stripe.customers.create({ email })).id;

    // Create the new user
    const user = User.create({
        username,
        email,
        password: hashedPassword,
        stripeCustomerID,
    });
    await user.save();

    // Set the ID of the user in the session
    // @ts-ignore
    req.session.userID = user.id;

    // Return success
    res.sendStatus(200);
});

// Login a user
router.post("/login", async (req, res) => {
    // Get data from request
    const {
        username,
        password,
    }: { username: string; email: string; password: string } = req.body;

    // Get the user if they exist
    const user = await User.findOne({ where: { username } });
    if (typeof user === "undefined")
        return res.status(400).send("User does not exist");

    // Check that the passwords match
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.sendStatus(400);

    // Set the session
    // @ts-ignore
    req.session.userID = user.id;

    // Return success
    res.sendStatus(200);
});

// Provide a way for the user to edit their account
router.patch("/edit", protectedMiddleware, async (req, res) => {
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
            .send("At least one parameter to modify is required");

    // Verify the data against the schema
    const { error } = updateSchema.validate({ username, email, password });
    if (error) return res.status(400).send(error.details[0].message);

    // Set the data to update
    const updateData: any = {};
    if (typeof username !== "undefined") {
        // Check that the new username is unique
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) return res.status(400).send("This username is taken");

        // Set the new username
        updateData.username = username;
    }
    if (typeof email !== "undefined") {
        // Check that the new email is unique
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).send("This email is taken");

        // Set the new email
        updateData.email = email;
    }
    if (typeof password !== "undefined") {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
    }

    // Update the user
    await User.update(userID, updateData);

    // Update the users Stripe customer email if there is a new email
    if (typeof email !== "undefined")
        await stripe.customers.update(user.stripeCustomerID, { email });

    // Return success
    return res.sendStatus(200);
});

// Log a user out and delete their session cookie
router.post("/logout", async (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.sendStatus(500);
        res.clearCookie("connect.sid");
        return res.sendStatus(200);
    });
});

// Verify that a user is authorized
router.get("/is-authenticated", protectedMiddleware, async (req, res) => {
    res.sendStatus(200);
});

// Get a users profile
router.get("/profile", protectedMiddleware, async (req, res) => {
    // Get the user
    // @ts-ignore
    const { user }: { user: User } = req.locals;

    // Return the specified data for the user
    res.status(200).json({ username: user.username, email: user.email });
});

// Export the router
export default router;

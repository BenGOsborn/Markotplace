import express from "express";
import { User } from "../entities/user";
import { stripe } from "../utils/stripe";

// Initialize the router
const router = express.Router();

// Allow a dev to view their Stripe account
router.get("/profile", async (req, res) => {
    // Get the user
    // @ts-ignore
    const { user }: { user: User } = req.locals;

    // Check that the user has a dev account
    if (typeof user.dev === "undefined")
        return res.status(400).end("No user account");

    // Also check the status of the account - if it is not verified allow the user to be able to create it (this is the best way)
});

// Allow a user to purchase an app
router.post("/purchase", async (req, res) => {
    // Get the details about the user
    // How do I do this with the payment intents (or even charges ?)
    // Transfer an amount to the user as well

    res.sendStatus(200);
});

// Export the router
export default router;

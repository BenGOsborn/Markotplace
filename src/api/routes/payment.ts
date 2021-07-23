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

    // Also check the status of the account
    const detailsSubmitted = (
        await stripe.accounts.retrieve(user.dev.stripeConnectID)
    ).details_submitted;
    if (!detailsSubmitted) {
        // Create an onboarding link for the dev
        const onboardingLink = (
            await stripe.accountLinks.create({
                account: user.dev.stripeConnectID,
                type: "account_onboarding",
            })
        ).url;

        // Redirect the user to it
        return res.redirect(onboardingLink);
    }

    // Redirect the user to their Stripe dashboard
    const dashbordLink = (
        await stripe.accounts.createLoginLink(user.dev.stripeConnectID)
    ).url;

    // Redirect the user to it
    res.redirect(dashbordLink);
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

import express from "express";
import { User } from "../entities/user";
import { protectedMiddleware } from "../utils/middleware";
import { stripe } from "../utils/stripe";

// Initialize the router
const router = express.Router();

// Allow a dev to view their Stripe account
router.get("/profile", protectedMiddleware, async (req, res) => {
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
router.post("/purchase", protectedMiddleware, async (req, res) => {
    // Get the details about the user
    // How do I do this with the payment intents (or even charges ?)
    // Transfer an amount to the user as well

    res.sendStatus(200);
});

// On payment success
router.post("/purchase/success", async (req, res) => {
    // When a payment has been made, verify the intent and add the item to the users account
    // Also make sure this can only occur once ?

    // Verify the request was valid from Stripe and only occured once ? https://stripe.com/docs/webhooks/signatures

    res.sendStatus(200);
});

// Export the router
export default router;

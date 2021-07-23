import express from "express";
import Stripe from "stripe";
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
        return res.status(400).send("No user account");

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
    // **** This article also has a section on replay attacks

    // Check that these webhooks are indeed secure ? (it shouldnt matter because the construct event WILL make them secure)

    // Verify the request was valid from Stripe and only occured once ? https://stripe.com/docs/webhooks/signatures

    // Get the Stripe signature
    const signature = req.headers["stripe-signature"];

    try {
        // Get the webhook event
        const event = stripe.webhooks.constructEvent(
            req.body,
            signature as string,
            process.env.STRIPE_WEBOOK_SECRET_PURCHASE as string
        );

        // Check that the payment succeeded
        if (event.type === "payment_intent.succeeded") {
            // Get the payment intent
            const paymentIntent = event.data.object as Stripe.PaymentIntent;

            // Return success
            res.sendStatus(200);
        }
    } catch (err) {
        // Return the error
        res.status(400).send(err.message);
    }
});

// Export the router
export default router;

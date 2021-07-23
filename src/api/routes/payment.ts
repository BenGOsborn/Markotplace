import express from "express";
import Stripe from "stripe";
import { App } from "../entities/app";
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

        // Return the url
        return res.json({url: onboardingLink, connected: false});
    }

    // Redirect the user to their Stripe dashboard
    const dashbordLink = (
        await stripe.accounts.createLoginLink(user.dev.stripeConnectID)
    ).url;

    // Return the url
    res.json({url: dashbordLink, connected: true});
});

// Allow a user to purchase an app
router.post("/purchase", protectedMiddleware, async (req, res) => {
    // Get the user
    // @ts-ignore
    const { user }: { user: User } = req.locals;

    // Get the data from the request
    const { appID }: { appID: number } = req.body;

    // **** Check the list of the users apps to see if that game already exists (might be a bad temporary solution)
    if (typeof user.apps !== "undefined") {
        for (const app of user.apps) {
            if (app.id === appID) return res.status(400).send("You already own this app");
        }
    }

    // Get the app from the database
    const app = await App.findOne(appID);
    if (typeof app == "undefined") return res.status(400).send("Invalid app")

    // **** If the app is free, then automatically allow the user to make the purchase without the need for the payment intent
    // ******* Rounding point errors are going to ruin this for sure
    if (app.price === 0) return res.status(200).send("Game purchased for free!");

    // Create a payment intent for the customer
    const paymentIntent = await stripe.paymentIntents.create({
        amount: app.price * 100,
        currency: "usd",
        // setup_future_usage: "on_session", // How does this work exactly ? (how does it work with the customer ?)
        customer: user.stripeCustomerID,
        metadata: {
            userID: user.id,
            appID
        },
    })

    // Return the payment intent
    res.json({ clientSecret: paymentIntent.client_secret })
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

            // Get the metadata from the payment intent
            // @ts-ignore
            const { userID, appID }: { userID: string; appID: number } = paymentIntent.metadata;

            // Get the app
            const app = await App.findOne(appID);

            // Update the users apps
            const user = await User.findOne(userID);
            if (typeof user?.apps === "undefined") {
                await User.update(userID, { apps: [app as App] })
            } else {
                await User.update(userID, { apps: [...user.apps as App[], app as App] })
            }

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

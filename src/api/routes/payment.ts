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
        return res.json({ url: onboardingLink, connected: false });
    }

    // Redirect the user to their Stripe dashboard
    const dashbordLink = (
        await stripe.accounts.createLoginLink(user.dev.stripeConnectID)
    ).url;

    // Return the url
    res.json({ url: dashbordLink, connected: true });
});

// Allow a user to purchase an app
router.post("/purchase", protectedMiddleware, async (req, res) => {
    // Get the user
    // @ts-ignore
    const { user }: { user: User } = req.locals;

    // Get the data from the request
    const { appID }: { appID: number } = req.body;

    // Check the list of the users apps to see if that game already exists
    if (typeof user.apps !== "undefined") {
        for (const app of user.apps) {
            if (app.id === appID)
                return res.status(400).send("You already own this app");
        }
    }

    // Get the app from the database
    const app = await App.findOne(appID);
    if (typeof app == "undefined") return res.status(400).send("Invalid app");

    // If the app is free, add the app to the users account
    if (app.price === 0) {
        // Add the app to the users account
        if (typeof user?.apps === "undefined") {
            await User.update(user.id, { apps: [app as App] });
        } else {
            await User.update(user.id, {
                apps: [...(user.apps as App[]), app as App],
            });
        }

        // Return success
        return res.json({
            clientSecret: null,
            free: true,
            message: "Game purchased for free!",
        });
    }

    // *** I also need to check that a card has already been created, if so the user can just accept the make a purchase without the need for their card OR can make a new one ?
    const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerID,
        type: "card",
    });
    // How do I just find a single one though ?
    paymentMethods.data[0].card;

    // Create a payment intent for the customer
    const paymentIntent = await stripe.paymentIntents.create({
        amount: app.price,
        currency: "usd",
        customer: user.stripeCustomerID,
        metadata: {
            userID: user.id,
            appID,
        },
    });

    // Return the payment intent
    res.json({
        clientSecret: paymentIntent.client_secret,
        free: false,
        message: null,
    });
});

// On payment success
router.post("/purchase/success", async (req, res) => {
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
            const { userID, appID }: { userID: number; appID: number } =
                paymentIntent.metadata;

            // Get the app
            const app = await App.findOne(appID);

            // Update the users apps
            const user = await User.findOne(userID);
            if (typeof user?.apps === "undefined") {
                await User.update(userID, { apps: [app as App] });
            } else {
                await User.update(userID, {
                    apps: [...(user.apps as App[]), app as App],
                });
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

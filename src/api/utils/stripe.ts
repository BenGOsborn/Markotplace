import Stripe from "stripe";

// Initialize Stripe
export const stripe = new Stripe(
    (process.env.ENVIRONMENT === "production"
        ? process.env.STRIPE_SECRET
        : process.env.STRIPE_SECRET_TEST) as string,
    { apiVersion: "2020-08-27" }
);

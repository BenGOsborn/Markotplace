import express from "express";

// Initialize the router
const router = express.Router();

// Allow a user to purchase an app
router.post("/purchase", async (req, res) => {
    // Get the details about the user
    // How do I do this with the payment intents (or even charges ?)
    // Transfer an amount to the user as well

    res.sendStatus(200);
});

// Export the router
export default router;

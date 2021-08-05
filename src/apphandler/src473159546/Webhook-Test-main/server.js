const express = require("express")

const app = express();

app.get("/", async (req, res) => {
    return res.status(200).send("Webhook");
})

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`)
})

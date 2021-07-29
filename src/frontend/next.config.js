module.exports = {
    reactStrictMode: true,
    env: {
        BACKEND_URL:
            process.env.NODE_ENV === "production"
                ? "http://localhost:8000"
                : "http://localhost:4000",
    },
};

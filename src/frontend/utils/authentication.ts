import axios from "axios";

export const isAuthorized = async (cookie: string | undefined) => {
    // If there is no cookie return false
    if (typeof cookie === "undefined") return false;

    // Verify the session cookie
    try {
        await axios.get(
            `${process.env.BACKEND_URL}/api/user/is-authenticated`,
            { withCredentials: true, headers: { Cookie: cookie } }
        );
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
};

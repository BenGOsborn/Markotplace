import axios from "axios";
import { GetServerSideProps, NextPage } from "next";

interface Props {}

const Authorize: NextPage<Props> = () => {
    return <></>;
};

export const getServerSideProps: GetServerSideProps = async ({
    req,
    res,
    query,
}) => {
    // Get the code from the query
    const { code } = query;

    // ******************** There is a problem with the following code ?
    // ******************** Also what happens if I use multiple of my accounts for one GitHub account - does it still work ?
    // ******************** Could also be a problem in dashboard ?

    // ******************** Maybe some option in the future for checking if a user is already a dev ?

    // If there is no code in the URL query redirect the user to login with their account, otherwise update their account
    if (typeof code === "undefined") {
        try {
            // Get the GitHub OAuth URL
            const { data: url } = await axios.get<string>(
                `${process.env.BACKEND_URL}/api/dev/authorize/github`,
                {
                    withCredentials: true,
                    headers: { Cookie: req.headers.cookie },
                }
            );

            // Redirect the user
            return { redirect: { destination: url, permanent: false } };
        } catch {
            // Redirect the user to their settings
            return {
                redirect: { destination: "/user/settings", permanent: false },
            };
        }
    } else {
        try {
            // Update the data
            await axios.post<string>(
                `${process.env.BACKEND_URL}/api/dev/authorize/github`,
                { code },
                {
                    withCredentials: true,
                    headers: { Cookie: req.headers.cookie },
                }
            );

            // Redirect to the dashboard
            return {
                redirect: {
                    destination: "/user/dev/dashboard",
                    permanent: false,
                },
            };
        } catch {
            // Redirect the user to their settings
            return {
                redirect: { destination: "/user/settings", permanent: false },
            };
        }
    }
};

// Export the page
export default Authorize;

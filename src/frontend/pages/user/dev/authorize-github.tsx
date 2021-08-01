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

    console.log(code);

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
            res.statusCode = 302;
            res.setHeader("Location", url);
        } catch {
            // Redirect the user to their settings
            res.statusCode = 302;
            res.setHeader("Location", "/user/settings");
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
            res.statusCode = 302;
            res.setHeader("Location", "/user/dev/dashboard");
        } catch {
            // Redirect to the settings
            res.statusCode = 302;
            res.setHeader("Location", "/user/settings");
        }
    }

    return { props: {} as Props };
};

// Export the page
export default Authorize;

import { GetServerSideProps, NextPage } from "next";
import { useEffect, useState } from "react";
import cookie from "cookie";
import axios from "axios";
import { Status } from "../../utils/status";
import { useRouter } from "next/dist/client/router";

const Login: NextPage<{}> = () => {
    // Declare the states
    const username = useState<string | null>(null);
    const password = useState<string | null>(null);

    const router = useRouter();

    return <>Hello</>;
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    // Get the cookie from the request and parse it
    const cookies = req.headers.cookie;
    if (typeof cookies == "undefined")
        return {
            props: {},
        };
    const parsedCookies = cookie.parse(cookies);

    // Get the session cookie
    const sess = parsedCookies["connect.sid"];
    if (!sess)
        return {
            props: {},
        };

    // Verify that the user is logged in
    try {
        await axios.post<string>(
            "http://0.0.0.0:80/api/user/is-authenticated", // **** Flag for an environment variable thing needs to be set
            {},
            { headers: { Cookie: cookies } }
        );

        // Redirect
        res.statusCode = 302;
        res.setHeader("Location", "/");

        return {
            props: {},
        };
    } catch {
        return {
            props: {},
        };
    }
};

// Export the page
export default Login;

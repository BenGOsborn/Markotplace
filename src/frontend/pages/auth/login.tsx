import { GetServerSideProps, NextPage } from "next";
import { useContext, useState } from "react";
import cookie from "cookie";
import axios, { AxiosError } from "axios";
import { Status, StatusMessage } from "../../utils/status";
import { useRouter } from "next/dist/client/router";
import { authenticatedCtx } from "../../utils/context";

interface Props {} // How can I make this work with TypeScript getserversideprops

const Login: NextPage<Props> = () => {
    // Initialize the context
    const [isAuthenticated, setIsAuthenticated] = useContext(authenticatedCtx);

    // Declare the states
    const [username, setUsername] = useState<string | null>(null);
    const [password, setPassword] = useState<string | null>(null);

    const [status, setStatus] = useState<Status | null>(null);

    // Used for redirecting
    const router = useRouter();

    return (
        <>
            <h1>Login</h1>
            <form
                onSubmit={(e) => {
                    // Prevent the page from refreshing
                    e.preventDefault();

                    // Make the login request
                    axios
                        .post<string>(
                            `${process.env.BACKEND_URL}/api/user/login`,
                            { username, password },
                            { withCredentials: true }
                        )
                        .then((res) => {
                            // Set the status
                            setStatus({
                                success: true,
                                message: "Login successful",
                            });

                            // Update the context
                            setIsAuthenticated(true);

                            // Redirect
                            router.push("/");
                        })
                        .catch((err: AxiosError) => {
                            // Set the status
                            setStatus({
                                success: false,
                                message: err.response?.data,
                            });

                            // Update the context
                            setIsAuthenticated(true);
                        });
                }}
            >
                <input
                    type="text"
                    required={true}
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    required={true}
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input type="submit" value="Login" />

                <StatusMessage status={status} />
            </form>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    // Get the cookie from the request and parse it
    const cookies = req.headers.cookie;
    if (typeof cookies == "undefined")
        return {
            props: {} as Props,
        };
    const parsedCookies = cookie.parse(cookies);

    // Get the session cookie
    const sess = parsedCookies["connect.sid"];
    if (!sess)
        return {
            props: {} as Props,
        };

    // Verify that the user is logged in
    try {
        await axios.post<string>(
            `${process.env.BACKEND_URL}/api/user/is-authenticated`,
            {},
            { headers: { Cookie: cookies } }
        );

        // Redirect
        res.statusCode = 302;
        res.setHeader("Location", "/");

        return {
            props: {} as Props,
        };
    } catch {
        return {
            props: {} as Props,
        };
    }
};

// Export the page
export default Login;

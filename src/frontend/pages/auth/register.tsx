import { GetServerSideProps, NextPage } from "next";
import cookie from "cookie";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/dist/client/router";
import { useContext, useState } from "react";
import { Status, StatusMessage } from "../../utils/status";
import { authenticatedCtx } from "../../utils/context";

interface Props {}

const Register: NextPage<Props> = () => {
    // Initialize the context
    const [isAuthenticated, setIsAuthenticated] = useContext(authenticatedCtx);

    // Declare the states
    const [username, setUsername] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [password, setPassword] = useState<string | null>(null);

    const [status, setStatus] = useState<Status | null>(null);

    // Used for redirecting
    const router = useRouter();

    return (
        <>
            <h1>Register</h1>
            <form
                onSubmit={(e) => {
                    // Prevent the page from refreshing
                    e.preventDefault();

                    // Make the register request
                    axios
                        .post<string>(
                            `${process.env.BACKEND_URL}/api/user/register`,
                            { username, email, password },
                            { withCredentials: true }
                        )
                        .then((res) => {
                            // Set the status
                            setStatus({
                                success: true,
                                message: "Registration successful",
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
                            setIsAuthenticated(false);
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
                    type="email"
                    required={true}
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
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
export default Register;

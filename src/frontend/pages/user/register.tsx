import { NextPage } from "next";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/dist/client/router";
import { useContext, useState } from "react";
import { Status, StatusMessage } from "../../utils/status";
import { authenticatedCtx } from "../../utils/context";
import Link from "next/link";

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

                <Link href="/user/login">{"Already have an account?"}</Link>
            </form>
        </>
    );
};

// Export the page
export default Register;

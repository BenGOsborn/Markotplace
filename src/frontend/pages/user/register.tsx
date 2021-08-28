import { NextPage } from "next";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/dist/client/router";
import { useContext, useState } from "react";
import { Status, StatusMessage } from "../../utils/status";
import { authenticatedCtx } from "../../utils/context";
import Link from "next/link";
import styles from "../../styles/Register.module.scss";
import Head from "next/head";

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
            <Head>
                <title>Register - Markotplace</title>
                <meta
                    name="description"
                    content="Register a new Markotplace account to purchase or deploy an app."
                />
            </Head>
            <div className={styles.register}>
                <h1>Register a new account</h1>
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
                    <input type="submit" value="Register" />
                </form>
                <span className={styles.extra}>
                    <Link href="/user/login">{"Already have an account?"}</Link>
                </span>
                <StatusMessage status={status} />
            </div>
        </>
    );
};

// Export the page
export default Register;

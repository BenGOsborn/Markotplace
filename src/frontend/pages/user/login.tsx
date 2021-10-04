import { NextPage } from "next";
import { useContext, useState } from "react";
import axios, { AxiosError } from "axios";
import { Status, StatusMessage } from "../../utils/status";
import { useRouter } from "next/dist/client/router";
import { authenticatedCtx } from "../../utils/context";
import Link from "next/link";
import styles from "../../styles/Login.module.scss";
import Head from "next/head";

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
            <Head>
                <title>Login - Markotplace</title>
                <meta name="description" content="Login to your Markotplace account." />
            </Head>
            <div className={styles.login}>
                <h1>Sign in to your account</h1>
                <form
                    onSubmit={(e) => {
                        // Prevent the page from refreshing
                        e.preventDefault();

                        // Make the login request
                        axios
                            .post<string>(`https://${process.env.BACKEND_HOSTNAME}/api/user/login`, { username, password }, { withCredentials: true })
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
                                setIsAuthenticated(false);
                            });
                    }}
                >
                    <input type="text" required={true} placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                    <input type="password" required={true} placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                    <input type="submit" value="Login" />
                </form>
                <span className={styles.extra}>
                    <Link href="/user/register">{"Don't have an account?"}</Link>
                </span>
                <StatusMessage status={status} />
            </div>
        </>
    );
};

// Export the page
export default Login;

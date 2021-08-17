import axios from "axios";
import Link from "next/link";
import { useContext } from "react";
import { authenticatedCtx } from "../utils/context";
import styles from "../styles/Nav.module.scss";

const Nav = () => {
    // Initialize the context
    const [isAuthenticated, setIsAuthenticated] = useContext(authenticatedCtx);

    return (
        <nav className={styles.nav}>
            <span className={styles.logo}>
                <Link href="/">Home</Link>
            </span>
            <ul>
                <li>
                    <Link href="/apps">Market</Link>
                </li>
                {!isAuthenticated ? (
                    <>
                        <li>
                            <Link href="/user/login">Login</Link>
                        </li>
                        <li>
                            <Link href="/user/register">Register</Link>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link href="/">
                                <a
                                    onClick={(e) =>
                                        axios
                                            .post<string>(
                                                `${process.env.BACKEND_URL}/api/user/logout`,
                                                {},
                                                { withCredentials: true }
                                            )
                                            .then((res) =>
                                                setIsAuthenticated(false)
                                            )
                                    }
                                >
                                    Logout
                                </a>
                            </Link>
                        </li>
                        <li>
                            <Link href="/user/library">Library</Link>
                        </li>
                        <li>
                            <Link href="/user/settings">Settings</Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

// Export the component
export default Nav;

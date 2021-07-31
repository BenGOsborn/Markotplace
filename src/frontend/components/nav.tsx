import axios from "axios";
import Link from "next/link";
import { useContext } from "react";
import { authenticatedCtx } from "../utils/context";

const Nav = () => {
    // Initialize the context
    const [isAuthenticated, setIsAuthenticated] = useContext(authenticatedCtx);

    return (
        <>
            <Link href="/">Home</Link>
            <Link href="/apps">Market</Link>
            {!isAuthenticated ? (
                <>
                    <Link href="/user/login">Login</Link>
                    <Link href="/user/register">Register</Link>
                </>
            ) : (
                <>
                    <Link href="/">
                        <a
                            onClick={(e) =>
                                axios
                                    .post<string>(
                                        `${process.env.BACKEND_URL}/api/user/logout`,
                                        {},
                                        { withCredentials: true }
                                    )
                                    .then((res) => setIsAuthenticated(false))
                            }
                        >
                            Logout
                        </a>
                    </Link>
                    <Link href="/user/library">Library</Link>
                    <Link href="/user/settings">Settings</Link>
                </>
            )}
        </>
    );
};

// Export the component
export default Nav;

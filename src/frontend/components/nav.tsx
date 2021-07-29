import Link from "next/link";
import { useContext } from "react";
import { authenticatedCtx } from "../utils/context";

const Nav = () => {
    // Initialize the context
    const [isAuthenticated, setIsAuthenticated] = useContext(authenticatedCtx);

    return (
        <>
            <Link href="/">Home</Link>
            {!isAuthenticated ? (
                <>
                    <Link href="/auth/login">Login</Link>
                    <Link href="/auth/register">Register</Link>
                </>
            ) : null}
        </>
    );
};

// Export the component
export default Nav;

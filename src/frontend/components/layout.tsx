import axios from "axios";
import { FC, useEffect, useState } from "react";
import { authenticatedCtx } from "../utils/context";
import Nav from "./nav";

const Layout: FC<{}> = ({ children }) => {
    // Initialize the contexts
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        // Check if the user is authenticated then update the context
        axios
            .post<string>(
                `${process.env.BACKEND_URL}/api/user/is-authenticated`,
                {},
                { withCredentials: true }
            )
            .then((res) => setIsAuthenticated(true))
            .catch((err) => setIsAuthenticated(false));
    }, []);

    return (
        <>
            <authenticatedCtx.Provider
                value={[isAuthenticated, setIsAuthenticated]}
            >
                <Nav />
                <main>{children}</main>
            </authenticatedCtx.Provider>
        </>
    );
};

// Export the component
export default Layout;

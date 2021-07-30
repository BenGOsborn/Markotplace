import axios from "axios";
import { FC, useEffect, useState } from "react";
import { authenticatedCtx } from "../utils/context";
import Nav from "./nav";

const Layout: FC<{}> = ({ children }) => {
    // Initialize the contexts
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        // Check if the user is authenticated then update the context

        // **** This doesnt make sense - instead we should just attempt to populate the users details across the state, and if they dont exist then just return false
        axios
            .get<string>(
                `${process.env.BACKEND_URL}/api/user/is-authenticated`,
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

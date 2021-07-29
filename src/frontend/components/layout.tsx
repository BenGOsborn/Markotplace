import axios from "axios";
import { FC, useEffect, useState } from "react";
import { authenticated } from "../utils/context";

const Layout: FC<{}> = ({ children }) => {
    // Initialize the contexts
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        // I can simply make a request to the isAuthenticated route and return that back ?
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
            <authenticated.Provider
                value={[isAuthenticated, setIsAuthenticated]}
            >
                <main>{children}</main>
            </authenticated.Provider>
        </>
    );
};

// Export the component
export default Layout;

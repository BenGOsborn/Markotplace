import { FC, useEffect, useState } from "react";
import { authenticated } from "../utils/context";

const Layout: FC<{}> = ({ children }) => {
    // Initialize the contexts
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        // Some way of checking if a user is authenticated when they relog in (probably just check the cookie)
        // How will I check the cookie though if it is only accessible from HTTP ?
        console.log(document.cookie);
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

import axios from "axios";
import { FC, useEffect, useState } from "react";
import { authenticatedCtx, marketAppsCtx, MarketApp } from "../utils/context";
import Nav from "./nav";
import Footer from "./footer";

const Layout: FC<{}> = ({ children }) => {
    // Initialize the contexts
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [marketApps, setMarketApps] = useState<MarketApp[] | null>(null);

    useEffect(() => {
        // Check if the user is authenticated then update the context
        axios
            .get<string>(
                `${process.env.BACKEND_URL}/api/user/is-authenticated`,
                {
                    withCredentials: true,
                }
            )
            .then((res) => setIsAuthenticated(true))
            .catch((err) => setIsAuthenticated(false));
    }, []);

    return (
        <>
            <marketAppsCtx.Provider value={[marketApps, setMarketApps]}>
                <authenticatedCtx.Provider
                    value={[isAuthenticated, setIsAuthenticated]}
                >
                    <Nav />
                    <main>{children}</main>
                    <Footer />
                </authenticatedCtx.Provider>
            </marketAppsCtx.Provider>
        </>
    );
};

// Export the component
export default Layout;

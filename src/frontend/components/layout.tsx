import axios from "axios";
import { FC, useEffect, useState } from "react";
import { authenticatedCtx, marketAppsCtx, MarketApp } from "../utils/context";
import Head from "next/head";
import Nav from "./nav";
import Footer from "./footer";

const Layout: FC<{}> = ({ children }) => {
    // Initialize the contexts
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [marketApps, setMarketApps] = useState<MarketApp[] | null>(null); // Now use this context across the app AND use it to create cards under each market app

    useEffect(() => {
        // Check if the user is authenticated then update the context
        axios
            .get<string>(`https://${process.env.BACKEND_ADDRESS}/api/user/is-authenticated`, {
                withCredentials: true,
            })
            .then((res) => setIsAuthenticated(true))
            .catch((err) => setIsAuthenticated(false));
    }, []);

    return (
        <>
            <Head>
                <meta charSet="UTF-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="robots" content="index, follow" />
                <link rel="manifest" href="/manifest.json" />
                <title>Markotplace - Deploy, Monetize, Fast, Free</title>
                <meta name="description" content="A PaaS startup that allows developers to deploy and monetize their app in under 5 minutes for free." />
            </Head>

            <marketAppsCtx.Provider value={[marketApps, setMarketApps]}>
                <authenticatedCtx.Provider value={[isAuthenticated, setIsAuthenticated]}>
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

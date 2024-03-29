import axios from "axios";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/dist/client/router";
import { useContext, useEffect, useState } from "react";
import Card from "../../components/card";
import { MarketApp, marketAppsCtx } from "../../utils/context";
import { Status, StatusMessage } from "../../utils/status";
import styles from "../../styles/App.module.scss";
import Head from "next/head";

interface Props {
    app: {
        name: string;
        title: string;
        description: string;
        author: string;
        price: number;
    };
}

// Choose a number of apps to display on screen
function chooseApps(apps: MarketApp[], app: MarketApp, numApps: number) {
    const displayApps: MarketApp[] = [];
    let i = 0;
    let endLen = Math.min(apps.length, 3);
    while (i < endLen) {
        if (apps[i].name !== app.name) {
            displayApps.push(apps[i]);
        } else {
            if (apps.length > endLen) {
                endLen++;
            }
        }
        i++;
    }

    return displayApps;
}

const App: NextPage<Props> = ({ app }) => {
    // Get the app context
    const [marketApps, setMarketApps] = useContext(marketAppsCtx);

    // Initialize the states
    const [status, setStatus] = useState<Status | null>(null);
    const [displayApps, setDisplayApps] = useState<MarketApp[]>([]);

    console.log(app);

    // Get the market apps or load them
    useEffect(() => {
        if (marketApps === null) {
            axios
                .get<{ apps: MarketApp[] }>(`https://${process.env.BACKEND_ADDRESS}/api/apps/list`)
                .then((res) => {
                    // Cache the apps
                    const apps = res.data.apps;

                    // Store the market apps in the state
                    setMarketApps(apps);

                    // Set the items to display under the app data
                    const displayApps = chooseApps(apps, app, 3);
                    setDisplayApps(displayApps);
                })
                .catch((err) => {});
        } else {
            // Set the items to display under the app data
            const displayApps = chooseApps(marketApps, app, 3);
            setDisplayApps(displayApps);
        }
    }, []);

    // Used for redirects
    const router = useRouter();

    return (
        <>
            <Head>
                <title>{app.title} - Markotplace</title>
                <meta name="description" content={app.description} />
            </Head>
            <div className={styles.app}>
                <div className={styles.content}>
                    <h1>{app.title}</h1>
                    <h3>{app.author}</h3>
                    <p>{app.description}</p>
                </div>
                <div className={styles.pricing}>
                    <p>${(app.price / 100).toFixed(2)}</p>
                    <a
                        href="#"
                        onClick={(e) => {
                            // Prevent the default action
                            e.preventDefault();
                            // Get the redirect URL
                            axios
                                .post<{ redirectURL: string }>(
                                    `https://${process.env.BACKEND_ADDRESS}/api/payment/checkout`,
                                    { appName: app.name },
                                    { withCredentials: true }
                                )
                                .then((res) => {
                                    // Set the status
                                    setStatus({
                                        success: true,
                                        message: "Redirecting",
                                    });
                                    // Redirect to the URL
                                    router.push(res.data.redirectURL);
                                })
                                .catch((err) => {
                                    // Set the status
                                    setStatus({
                                        success: false,
                                        message: err.response?.data,
                                    });
                                });
                        }}
                    >
                        {app.price == 0 ? "Add To Library" : "Purchase Now"}
                    </a>
                </div>
                <StatusMessage status={status} />
                {displayApps.length > 0 ? (
                    <div className={styles.extras}>
                        {displayApps.map((dApp, index) => {
                            return <Card key={index} title={dApp.title} link={`/apps/${dApp.name}`} description={dApp.description} author={dApp.author} />;
                        })}
                    </div>
                ) : null}
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    // Get the app name from the url
    const appName = params?.appName;

    try {
        // Fetch and return the data for the app
        const {
            data: { app },
        } = await axios.get<Props>(`https://${process.env.BACKEND_ADDRESS}/api/apps/details/${appName}`);

        return { props: { app } as Props };
    } catch {
        return { notFound: true };
    }
};

// Export the page
export default App;

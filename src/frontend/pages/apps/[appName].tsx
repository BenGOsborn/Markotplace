import axios from "axios";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/dist/client/router";
import { useContext, useEffect, useState } from "react";
import { MarketApp, marketAppsCtx } from "../../utils/context";
import { Status, StatusMessage } from "../../utils/status";

interface Props {
    app: {
        name: string;
        title: string;
        description: string;
        author: string;
        price: number;
    };
}

const App: NextPage<Props> = ({ app }) => {
    // Get the app context
    const [marketApps, setMarketApps] = useContext(marketAppsCtx);

    // Initialize the states
    const [status, setStatus] = useState<Status | null>(null);
    const [displayApps, setDisplayApps] = useState<MarketApp[]>([]);

    // Get the market apps or load them
    useEffect(() => {
        if (marketApps === null) {
            axios
                .get<MarketApp[]>(`${process.env.BACKEND_URL}/api/apps/list`)
                .then((res) => {
                    // Cache the apps
                    const apps = res.data;

                    // Store the market apps in the state
                    setMarketApps(apps);

                    // Set the items to display under the apps
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
                    setDisplayApps(displayApps);
                })
                .catch((err) => {});
        }
    }, []);

    // Used for redirects
    const router = useRouter();

    return (
        <>
            <h1>{app.title}</h1>
            <h3>{app.author}</h3>
            <p>{app.description}</p>
            <p>${(app.price / 100).toFixed(2)}</p>
            <a
                href="#"
                onClick={(e) => {
                    // Prevent the default action
                    e.preventDefault();

                    // Get the redirect URL
                    axios
                        .post<{ redirectURL: string }>(
                            `${process.env.BACKEND_URL}/api/payment/checkout`,
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

            <StatusMessage status={status} />
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
        } = await axios.get<Props>(
            `${process.env.BACKEND_URL}/api/apps/details/${appName}`
        );
        return { props: { app } as Props };
    } catch {
        return { notFound: true };
    }
};

// Export the page
export default App;

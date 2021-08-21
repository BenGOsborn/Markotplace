import axios from "axios";
import { GetServerSideProps, NextPage } from "next";
import { useContext, useEffect } from "react";
import Card from "../../components/card";
import styles from "../../styles/Apps.module.scss";
import { marketAppsCtx } from "../../utils/context";

interface Props {
    apps: {
        name: string;
        title: string;
        description: string;
        author: string;
        price: number;
    }[];
}

const Apps: NextPage<Props> = ({ apps }) => {
    // Get the app context
    const [marketApps, setMarketApps] = useContext(marketAppsCtx);

    // Set the market apps to be the loaded apps
    useEffect(() => {
        setMarketApps(apps);
    }, []);

    return (
        <div className={styles.apps}>
            <div className={styles.description}>
                <h1>Welcome to the App markets</h1>
                <h2>
                    All of these apps are ready for you to play when you are!
                </h2>
            </div>
            {apps.length > 0 ? (
                <div className={styles.grid}>
                    {apps.map((app, index) => {
                        return (
                            <Card
                                key={index}
                                title={app.title}
                                author={app.author}
                                description={app.description}
                                link={`/apps/${app.name}`}
                            />
                        );
                    })}
                </div>
            ) : (
                <h3>No apps to display</h3>
            )}
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async ({}) => {
    try {
        const {
            data: { apps },
        } = await axios.get<Props>(`${process.env.BACKEND_URL}/api/apps/list`);
        return { props: { apps } as Props };
    } catch {
        return { props: { apps: [] } as Props };
    }
};

// Export the page
export default Apps;

import axios from "axios";
import { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import Card from "../../../components/card";
import styles from "../../../styles/Dashboard.module.scss";

interface Props {
    apps: {
        name: string;
        title: string;
        description: string;
        price: number;
        ghRepoOwner: string;
        ghRepoName: string;
        ghRepoBranch: string;
        env: string;
    }[];
    url: string;
    onboarded: boolean;
}

const Dashboard: NextPage<Props> = ({ apps, url, onboarded }) => {
    return (
        <div className={styles.dashboard}>
            <nav>
                {onboarded ? (
                    <a href={url}>View your Stripe dashboard</a>
                ) : (
                    <a href={url}>
                        Connect with Stripe to start receiving monetizing your
                        apps
                    </a>
                )}
                <Link href="/user/dev/authorize-github">
                    Reconnect GitHub account
                </Link>
                <Link href="/user/dev/apps/create">
                    <a>
                        <span>Create new app</span>
                    </a>
                </Link>
            </nav>
            <div className={styles.description}>
                <h1>Your apps</h1>
                <h2>Select an app to edit it</h2>
            </div>
            {apps.length > 0 ? (
                <div className={styles.grid}>
                    {apps.map((app, index) => {
                        return (
                            <Card
                                key={index}
                                title={app.title}
                                description={app.description}
                                link={`/user/dev/apps/edit/${app.name}`}
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

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    try {
        // Fetch a list of the devs apps
        const {
            data: { apps },
        } = await axios.get<Props>(`${process.env.BACKEND_URL}/api/apps/dev`, {
            withCredentials: true,
            headers: { Cookie: req.headers.cookie },
        });

        // Get the devs payment link
        const {
            data: { url, onboarded },
        } = await axios.get<Props>(
            `${process.env.BACKEND_URL}/api/payment/stripe-dashboard`,
            {
                withCredentials: true,
                headers: { Cookie: req.headers.cookie },
            }
        );

        return { props: { apps, url, onboarded } as Props };
    } catch (e) {
        // Redirect to the settings page
        return {
            redirect: {
                destination: "/user/dev/authorize-github",
                permanent: false,
            },
        };
    }
};

// Export the page
export default Dashboard;

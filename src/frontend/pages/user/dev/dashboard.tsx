import axios from "axios";
import { GetServerSideProps, NextPage } from "next";
import Link from "next/link";

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
        <>
            {onboarded ? (
                <a href={url}>View your Stripe dashboard</a>
            ) : (
                <a href={url}>
                    Connect with Stripe to start receiving monetizing your apps
                </a>
            )}
            <Link href="/user/dev/authorize-github">
                Reconnect GitHub account
            </Link>
            <Link href="/user/dev/apps/create">Create new app</Link>
            {apps.length > 0 ? (
                <div>
                    {apps.map((app, index) => {
                        return (
                            <div key={index}>
                                <h3>
                                    <a href={app.name}>{app.title}</a>
                                </h3>
                                <p>{app.description}</p>
                                <p>{app.price}</p>
                                <p>{app.ghRepoOwner}</p>
                                <p>{app.ghRepoName}</p>
                                <p>{app.ghRepoBranch}</p>
                                <p>{app.env}</p>
                                <Link href={`/user/dev/apps/edit/${app.name}`}>
                                    Edit
                                </Link>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <h3>No apps to display</h3>
            )}
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    try {
        // Fetch a list of the devs apps
        const {
            data: { apps },
        } = await axios.get<Props>(
            `${process.env.BACKEND_URL}/api/apps/dev/dashboard`,
            {
                withCredentials: true,
                headers: { Cookie: req.headers.cookie },
            }
        );

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
            redirect: { destination: "/user/dev/authorize-github", permanent: false },
        };
    }
};

// Export the page
export default Dashboard;

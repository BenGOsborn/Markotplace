import axios from "axios";
import { GetServerSideProps, NextPage } from "next";

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
                            </div>
                        );
                    })}
                </div>
            ) : (
                <h3>No apps to display</h3>
            )}
            {onboarded ? (
                <a href={url}>View your Stripe dashboard</a>
            ) : (
                <a href={url}>
                    Connect with Stripe to start receiving monetizing your apps
                </a>
            )}
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
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
        res.statusCode = 302;
        res.setHeader("Location", "/user/dev/authorize-github");
        return { props: {} as Props };
    }
};

// Export the page
export default Dashboard;

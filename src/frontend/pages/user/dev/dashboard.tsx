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
}

const Dashboard: NextPage<Props> = ({ apps }) => {
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
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    try {
        // Try and fetch a list of the users apps
        const {
            data: { apps },
        } = await axios.get<Props>(`${process.env.BACKEND_URL}/api/apps/dev`, {
            withCredentials: true,
            headers: { Cookie: req.headers.cookie },
        });
        return { props: { apps } as Props };
    } catch {
        // Redirect to the settings page
        res.statusCode = 302;
        res.setHeader("Location", "/user/settings");
        return { props: {} as Props };
    }
};

// Export the page
export default Dashboard;

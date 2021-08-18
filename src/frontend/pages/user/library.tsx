import axios from "axios";
import { GetServerSideProps, NextPage } from "next";
import Card from "../../components/card";
import Link from "next/link";
import styles from "../../styles/Library.module.scss";

interface Props {
    apps: { name: string; title: string; description: string }[];
}

const Library: NextPage<Props> = ({ apps }) => {
    return (
        <div className={styles.library}>
            <div className={styles.description}>
                <h1>Your owned apps</h1>
                <h2>Select an app to play it now!</h2>
            </div>
            {apps.length > 0 ? (
                <div className={styles.grid}>
                    {apps.map((app, index) => {
                        return (
                            <Card
                                key={index}
                                title={app.title}
                                description={app.description}
                                link={`${process.env.BACKEND_URL}/apphandler/${app.name}`}
                            />
                        );
                    })}
                </div>
            ) : (
                <h3>
                    No apps to display. Get some <Link href="/apps">here</Link>.
                </h3>
            )}
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    try {
        // Fetch a list of the users apps
        const apps = await axios.get<Props>(
            `${process.env.BACKEND_URL}/api/apps/owned`,
            { withCredentials: true, headers: { Cookie: req.headers.cookie } }
        );
        return { props: { apps: apps.data.apps } as Props };
    } catch {
        // Redirect the user
        return { redirect: { destination: "/user/login", permanent: false } };
    }
};

// Export the page
export default Library;

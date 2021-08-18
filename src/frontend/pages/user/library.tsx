import axios from "axios";
import { GetServerSideProps, NextPage } from "next";
import Card from "../../components/card";
import styles from "../../styles/Library.module.scss";

interface Props {
    apps: { name: string; title: string; description: string }[];
}

const Library: NextPage<Props> = ({ apps }) => {
    return (
        <div className={styles.library}>
            {apps.length > 0 ? (
                <>
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
                </>
            ) : (
                <h3>No apps to display</h3>
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

import axios from "axios";
import { GetServerSideProps, NextPage } from "next";
import Card from "../../components/card";
import styles from "../../styles/Apps.module.scss";

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
    return (
        <div className={styles.apps}>
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

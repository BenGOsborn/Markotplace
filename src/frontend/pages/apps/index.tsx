import axios from "axios";
import { GetServerSideProps, NextPage } from "next";
import Link from "next/link";

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
        <>
            {apps.length > 0 ? (
                <div>
                    {apps.map((app, index) => {
                        return (
                            <div key={index}>
                                <h3>
                                    <Link href={`/apps/${app.name}`}>
                                        {app.title}
                                    </Link>
                                </h3>
                                <h4>{app.author}</h4>
                                <p>{app.description}</p>
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

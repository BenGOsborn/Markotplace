import axios from "axios";
import { GetServerSideProps, NextPage } from "next";

interface Props {
    apps: { name: string; title: string; description: string }[];
}

const Library: NextPage<Props> = ({ apps }) => {
    return (
        <>
            {apps.length > 0 ? (
                <div>
                    {apps.map((app, index) => {
                        return (
                            <div key={index}>
                                <h3>
                                    <a
                                        // href={`${process.env.BACKEND_URL}/apphandler?appName=${app.name}`} // **** This is the right one eventually
                                        href={`http://localhost:49155/apphandler?appName=${app.name}`} // THE PORT COULD BREAK WHEN RESTARTED
                                    >
                                        {app.title}
                                    </a>
                                </h3>
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

import axios from "axios";
import { GetServerSideProps, NextPage } from "next";
import { useEffect } from "react";
import { isAuthorized } from "../../utils/authentication";

interface Props {
    apps: { name: string; title: string; description: string }[];
}

const Library: NextPage<Props> = ({ apps }) => {
    return (
        <>
            {apps.length > 0 ? (
                <div>
                    {apps.map((app) => {
                        return (
                            <div>
                                <h3>
                                    <a href={app.name}>{app.title}</a>
                                </h3>
                                <p>{app.description}</p>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <h3>No apps to show</h3>
            )}
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    // Check if the user is authorized
    const authorized = await isAuthorized(req.headers.cookie);

    // If the user is not authorized then redirect
    if (!authorized) {
        res.statusCode = 302;
        res.setHeader("Location", "/user/login");

        return { props: { apps: [] } as Props };
    }

    try {
        // Fetch a list of the users apps
        const apps = await axios.get<Props>(
            `${process.env.BACKEND_URL}/apps/owned`,
            { withCredentials: true, headers: { Cookie: req.headers.cookie } }
        );
        return { props: { apps: apps.data.apps } as Props };
    } catch {
        // Return an emtpy list
        return { props: { apps: [] } as Props };
    }
};

// Export the page
export default Library;

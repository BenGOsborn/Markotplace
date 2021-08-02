import axios from "axios";
import { GetServerSideProps, NextPage } from "next";

interface Props {
    app: {
        name: string;
        title: string;
        description: string;
        price: number;
        ghRepoOwner: string;
        ghRepoName: string;
        ghRepoBranch: string;
        env: string;
    };
}

const Edit: NextPage<Props> = ({ app }) => {
    return (
        <>
            <p>{app.title}</p>
            <p>{app.description}</p>
            <p>{app.price}</p>
            <p>{app.ghRepoOwner}</p>
            <p>{app.ghRepoName}</p>
            <p>{app.ghRepoBranch}</p>
            <p>{app.env}</p>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async ({
    req,
    res,
    params,
}) => {
    // Get the app name from the query
    const appName = params?.appName;

    try {
        // Get the details for the app
        const {
            data: { app },
        } = await axios.get<Props>(
            `${process.env.BACKEND_URL}/api/apps/dev/details/${appName}`,
            {
                withCredentials: true,
                headers: { Cookie: req.headers.cookie },
            }
        );
        return { props: { app } as Props };
    } catch {
        // Redirect to the settings page
        res.statusCode = 302;
        res.setHeader("Location", "/user/settings");
        return { props: {} as Props };
    }
};

// Export the page
export default Edit;

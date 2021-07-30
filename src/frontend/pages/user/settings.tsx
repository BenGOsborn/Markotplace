import { GetServerSideProps, NextPage } from "next";
import { isAuthorized } from "../../utils/authentication";

interface Props {}

const Settings: NextPage<Props> = () => {
    return <div></div>;
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    // Check if the user is authorized
    const authorized = await isAuthorized(req.headers.cookie);

    // If the user is not authorized then redirect
    if (!authorized) {
        res.statusCode = 302;
        res.setHeader("Location", "/user/login");
    }

    // Return something
    return { props: {} as Props };
};

// Export the page
export default Settings;

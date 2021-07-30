import axios from "axios";
import { GetServerSideProps, NextPage } from "next";
import { isAuthorized } from "../../utils/authentication";

interface Props {
    username: string;
    email: string;
}

const Settings: NextPage<Props> = ({ username, email }) => {
    return (
        <>
            <h3>{username}</h3>
            <h3>{email}</h3>
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

        // Return something
        return { props: {} as Props };
    }

    try {
        // Get the users profile
        const {
            data: { username, email },
        } = await axios.get<Props>(
            `${process.env.BACKEND_URL}/api/user/profile`,
            {
                withCredentials: true,
                headers: { Cookie: req.headers.cookie },
            }
        );
        return { props: { username, email } as Props };
    } catch {
        // Return something
        return { props: {} as Props };
    }
};

// Export the page
export default Settings;

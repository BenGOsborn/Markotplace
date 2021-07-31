import axios from "axios";
import { GetServerSideProps, NextPage } from "next";

interface Props {}

const Dashboard: NextPage<Props> = () => {
    return <></>;
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    try {
        // Get the GitHub OAuth URL
        const { data: url } = await axios.get<string>(
            `${process.env.BACKEND_URL}/api/dev/authorize/github`,
            { withCredentials: true, headers: { Cookie: req.headers.cookie } }
        );

        // Redirect the user
        res.statusCode = 302;
        res.setHeader("Location", url);
    } catch {
        // Redirect the user to their user dashboard
        res.statusCode = 302;
        res.setHeader("Location", "/user/login");
    }

    return { props: {} as Props };
};

// Export the page
export default Dashboard;

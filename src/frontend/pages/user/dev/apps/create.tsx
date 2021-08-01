import axios from "axios";
import { GetServerSideProps, NextPage } from "next";

interface Props {}

const Create: NextPage<Props> = () => {
    return <>{/* Allow a developer to create their app here */}</>;
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    try {
        // Verify that the user is a developer
        await axios.get<Props>(`${process.env.BACKEND_URL}/api/dev/is-dev`, {
            withCredentials: true,
            headers: { Cookie: req.headers.cookie },
        });
        return { props: {} as Props };
    } catch {
        // Redirect to the settings page
        res.statusCode = 302;
        res.setHeader("Location", "/user/settings");
        return { props: {} as Props };
    }
};

// Export the page
export default Create;

import axios from "axios";
import { GetServerSideProps, NextPage } from "next";

interface Props {}

const Dashboard: NextPage<Props> = () => {
    return <></>;
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    try {
        // Try and return the users data
    } catch {}

    return { props: {} as Props };
};

// Export the page
export default Dashboard;

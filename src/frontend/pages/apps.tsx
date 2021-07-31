import { GetServerSideProps, NextPage } from "next";

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
    return <></>;
};

export const getServerSideProps: GetServerSideProps = async ({}) => {
    return { props: {} as Props };
};

// Export the page
export default Apps;

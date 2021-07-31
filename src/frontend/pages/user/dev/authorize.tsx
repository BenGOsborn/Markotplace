import { GetServerSideProps, NextPage } from "next";

interface Props {}

const Authorize: NextPage<Props> = () => {
    return <></>;
};

export const getServerSideProps: GetServerSideProps = async () => {
    return { props: {} as Props };
};

export default Authorize;

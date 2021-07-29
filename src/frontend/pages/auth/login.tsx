import { GetServerSideProps, NextPage } from "next";
import { useState } from "react";
import cookie from "cookie";

interface Props {
    redirect: boolean;
}

const Login: NextPage<Props> = () => {
    const username = useState<null>(null);

    return <div>Hello</div>;
};

export const getServerSideProps: GetServerSideProps = async ({
    req,
    res,
    params,
}) => {
    // Get the cookie from the request and parse it
    const cookies = req.headers.cookie;
    if (typeof cookies == "undefined")
        return { props: { redirect: false } as Props };
    const parsedCookies = cookie.parse(cookies);

    // Get the session cookie
    const sess = parsedCookies["connect.sid"];
    if (!sess) return { props: { redirect: false } as Props };

    return { props: { redirect: true } as Props };
};

// Export the page
export default Login;

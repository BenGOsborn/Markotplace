import axios from "axios";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/dist/client/router";
import { useState } from "react";
import { Status, StatusMessage } from "../../utils/status";

interface Props {
    app: {
        name: string;
        title: string;
        description: string;
        author: string;
        price: number;
    };
}

const App: NextPage<Props> = ({ app }) => {
    // Store the status
    const [status, setStatus] = useState<Status | null>(null);

    // Used for redirects
    const router = useRouter();

    return (
        <>
            <p>{app.name}</p>
            <p>{app.title}</p>
            <p>{app.description}</p>
            <p>{app.author}</p>
            <p>{app.price}</p>
            <a
                href="#"
                onClick={(e) => {
                    // Prevent the default action
                    e.preventDefault();

                    // Get the redirect URL
                    axios
                        .post<{ redirectURL: string }>(
                            `${process.env.BACKEND_URL}/api/payment/checkout`,
                            { appName: app.name },
                            { withCredentials: true }
                        )
                        .then((res) => {
                            // Set the status
                            setStatus({
                                success: true,
                                message: "Redirecting",
                            });

                            // Redirect to the URL
                            router.push(res.data.redirectURL);
                        })
                        .catch((err) => {
                            // Set the status
                            setStatus({
                                success: false,
                                message: err.response?.data,
                            });
                        });
                }}
            >
                {app.price == 0 ? "Add To Library" : "Purchase Now"}
            </a>

            <StatusMessage status={status} />
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    // Get the app name from the url
    const appName = params?.appName;

    try {
        // Fetch and return the data for the app
        const {
            data: { app },
        } = await axios.get<Props>(
            `${process.env.BACKEND_URL}/api/apps/details/${appName}`
        );
        return { props: { app } as Props };
    } catch {
        return { notFound: true };
    }
};

// Export the page
export default App;

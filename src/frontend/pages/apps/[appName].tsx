import axios from "axios";
import { GetServerSideProps, NextPage } from "next";

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
    return (
        <>
            <p>{app.name}</p>
            <p>{app.title}</p>
            <p>{app.description}</p>
            <p>{app.author}</p>
            <p>{app.price}</p>
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

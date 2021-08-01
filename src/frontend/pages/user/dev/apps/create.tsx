import axios from "axios";
import { GetServerSideProps, NextPage } from "next";
import { useState } from "react";
import { Status, StatusMessage } from "../../../../utils/status";

interface Props {}

const Create: NextPage<Props> = () => {
    // Initialize the states
    const [name, setName] = useState<string | null>(null);
    const [title, setTitle] = useState<string | null>(null);
    const [description, setDescription] = useState<string | null>(null);
    const [price, setPrice] = useState<number | null>(null);
    const [ghRepoOwner, setGhRepoOwner] = useState<string | null>(null);
    const [ghRepoName, setGhRepoName] = useState<string | null>(null);
    const [ghRepoBranch, setGhRepoBranch] = useState<string | null>(null);
    const [env, setEnv] = useState<string | null>(null);

    const [status, setStatus] = useState<Status | null>(null);

    return (
        <>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    console.log(e);
                }}
            >
                <input
                    type="text"
                    required={true}
                    placeholder="Name"
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="text"
                    required={true}
                    placeholder="Title"
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    required={true}
                    placeholder="Description"
                    onChange={(e) => setDescription(e.target.value)}
                />
                <input
                    type="number"
                    required={true}
                    placeholder="Price"
                    onChange={(e) => setPrice(e.target.valueAsNumber)}
                />
                <input
                    type="text"
                    required={true}
                    placeholder="GitHub Repo Owner"
                    onChange={(e) => setGhRepoOwner(e.target.value)}
                />
                <input
                    type="text"
                    required={true}
                    placeholder="GitHub Repo Name"
                    onChange={(e) => setGhRepoName(e.target.value)}
                />
                <input
                    type="text"
                    required={true}
                    placeholder="GitHub Repo Branch"
                    onChange={(e) => setGhRepoBranch(e.target.value)}
                />
                <input
                    type="text" // This is actually going to be JSON
                    required={true}
                    placeholder="Env"
                    onChange={(e) => setEnv(e.target.value)}
                />
                <input type="submit" value="Create" />
            </form>

            <StatusMessage status={status} />
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    try {
        // Verify that the user is a developer
        await axios.get<Props>(
            `${process.env.BACKEND_URL}/api/dev/is-authorized`,
            {
                withCredentials: true,
                headers: { Cookie: req.headers.cookie },
            }
        );
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

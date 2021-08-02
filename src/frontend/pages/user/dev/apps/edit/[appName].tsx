import axios from "axios";
import { GetServerSideProps, NextPage } from "next";
import { useState } from "react";
import { Status, StatusMessage } from "../../../../../utils/status";

interface Props {
    app: {
        name: string;
        title: string;
        description: string;
        price: number;
        ghRepoOwner: string;
        ghRepoName: string;
        ghRepoBranch: string;
        env: string;
    };
}

const Edit: NextPage<Props> = ({ app }) => {
    // Initialize the states
    const [name, setName] = useState<string | null>(null);
    const [title, setTitle] = useState<string | null>(null);
    const [description, setDescription] = useState<string | null>(null);
    const [price, setPrice] = useState<number | null>(null);
    const [ghRepoOwner, setGhRepoOwner] = useState<string | null>(null);
    const [ghRepoName, setGhRepoName] = useState<string | null>(null);
    const [ghRepoBranch, setGhRepoBranch] = useState<string | null>(null);

    // I need one where it can be set to null also
    const [env, setEnv] = useState<[string, string][]>(
        (() => {
            // Parse the env to JSON
            const envJSON = JSON.parse(app.env);

            // Convert the JSON to pairs
            const pairs: [string, string][] = [];
            for (let key of Object.keys(envJSON)) {
                const pair = [key, envJSON[key]];
                pairs.push(pair as any);
            }

            // Return the pairs
            return envJSON;
        })()
    );

    // const [envKey, setEnvKey] = useState<string>("");
    // const [envValue, setEnvValue] = useState<string>("");

    const [status, setStatus] = useState<Status | null>(null);

    return (
        <>
            <form
                onSubmit={(e) => {
                    // Prevent the page from reloading
                    e.preventDefault();

                    // Make the request to updateb the form
                }}
            >
                <input
                    type="text"
                    required={true}
                    value={name || app.name}
                    placeholder="Name"
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="text"
                    required={true}
                    value={title || app.title}
                    placeholder="Title"
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    required={true}
                    value={description || app.description}
                    placeholder="Description"
                    onChange={(e) => setDescription(e.target.value)}
                />
                <input
                    type="number"
                    step={0.01}
                    required={true}
                    value={price || app.price}
                    placeholder="Price"
                    onChange={(e) => setPrice(e.target.valueAsNumber)}
                />
                <input
                    type="text"
                    required={true}
                    value={ghRepoOwner || app.ghRepoOwner}
                    placeholder="GitHub Repo Owner"
                    onChange={(e) => setGhRepoOwner(e.target.value)}
                />
                <input
                    type="text"
                    required={true}
                    value={ghRepoName || app.ghRepoName}
                    placeholder="GitHub Repo Name"
                    onChange={(e) => setGhRepoName(e.target.value)}
                />
                <input
                    type="text"
                    required={true}
                    value={ghRepoBranch || app.ghRepoBranch}
                    placeholder="GitHub Repo Branch"
                    onChange={(e) => setGhRepoBranch(e.target.value)}
                />
                {/* <ul>
                    {env.map((variable, index) => {
                        return (
                            <li key={index}>
                                {variable[0]}={variable[1]}
                                <button
                                    onClick={(e) => {
                                        // Prevent the page from reloading
                                        e.preventDefault();

                                        // Remove the key
                                        const envCopy = [...env];
                                        envCopy.splice(index, 1);
                                        setEnv(envCopy);
                                    }}
                                >
                                    -
                                </button>
                            </li>
                        );
                    })}
                </ul>
                <input
                    type="text"
                    required={true}
                    value={envKey}
                    placeholder="Env key"
                    onChange={(e) => setEnvKey(e.target.value)}
                />
                <input
                    type="text"
                    required={true}
                    value={envValue}
                    placeholder="Env value"
                    onChange={(e) => setEnvValue(e.target.value)}
                />
                <button
                    onClick={(e) => {
                        // Prevent page from reloading
                        e.preventDefault();

                        // Check that both fields are not null
                        if (envKey.length > 0) {
                            // Make sure that the same key does not exist
                            const exists = env.filter(
                                (variable) => variable[0] === envKey
                            );
                            if (exists.length === 0) {
                                // Update the environment variables
                                setEnv([...env, [envKey, envValue]]);

                                // Reset the key and value
                                setEnvKey("");
                                setEnvValue("");
                            }
                        }
                    }}
                >
                    +
                </button> */}
                <input type="submit" value="Create" />
            </form>
            <StatusMessage status={status} />
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async ({
    req,
    res,
    params,
}) => {
    // Get the app name from the query
    const appName = params?.appName;

    try {
        // Get the details for the app
        const {
            data: { app },
        } = await axios.get<Props>(
            `${process.env.BACKEND_URL}/api/apps/dev/details/${appName}`,
            {
                withCredentials: true,
                headers: { Cookie: req.headers.cookie },
            }
        );
        return { props: { app } as Props };
    } catch {
        // Redirect to the settings page
        res.statusCode = 302;
        res.setHeader("Location", "/user/settings");
        return { props: {} as Props };
    }
};

// Export the page
export default Edit;

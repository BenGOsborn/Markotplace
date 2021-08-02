import axios, { AxiosError } from "axios";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/dist/client/router";
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

// Parse the environment JSON string into key value pairs
const parseEnv = (envString: string) => {
    // Parse the env to JSON
    const envJSON = JSON.parse(envString);

    // Convert the JSON to pairs
    const pairs: [string, string][] = [];
    for (let key of Object.keys(envJSON)) {
        const pair = [key, envJSON[key]];
        pairs.push(pair as [string, string]);
    }

    // Return the pairs
    return pairs;
};

const Edit: NextPage<Props> = ({ app }) => {
    // Initialize the states
    const [newName, setNewName] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState<string | null>(null);
    const [newDescription, setNewDescription] = useState<string | null>(null);
    const [newPrice, setNewPrice] = useState<number | null>(null);
    const [newGhRepoOwner, setNewGhRepoOwner] = useState<string | null>(null);
    const [newGhRepoName, setNewGhRepoName] = useState<string | null>(null);
    const [newGhRepoBranch, setNewGhRepoBranch] = useState<string | null>(null);
    const [newEnv, setNewEnv] = useState<[string, string][] | null>(null);

    const [envKey, setEnvKey] = useState<string>("");
    const [envValue, setEnvValue] = useState<string>("");

    const [status, setStatus] = useState<Status | null>(null);

    // Used for redirects
    const router = useRouter();

    return (
        <>
            <form
                onSubmit={(e) => {
                    // Prevent the page from reloading
                    e.preventDefault();

                    // Make the request to update the form

                    // Create the env to send
                    let sendEnv;
                    if (newEnv === null) {
                        sendEnv = undefined;
                    } else {
                        sendEnv = {} as any;
                        for (let pair of newEnv) {
                            sendEnv[pair[0]] = pair[1];
                        }
                    }

                    // Make the request to create the new app
                    axios
                        .post<string>(
                            `${process.env.BACKEND_URL}/api/apps/dev/create`,
                            {
                                name: newName ? newName : undefined,
                                title: newTitle ? newTitle : undefined,
                                description: newDescription
                                    ? newDescription
                                    : undefined,
                                price: newPrice ? newPrice : undefined,
                                ghRepoOwner: newGhRepoOwner
                                    ? newGhRepoOwner
                                    : undefined,
                                ghRepoName: newGhRepoName
                                    ? newGhRepoName
                                    : undefined,
                                ghRepoBranch: newGhRepoBranch
                                    ? newGhRepoBranch
                                    : undefined,
                                env: JSON.stringify(sendEnv),
                            },
                            { withCredentials: true }
                        )
                        .then((res) => {
                            // Set the status
                            setStatus({
                                success: true,
                                message: "Successfully created app",
                            });

                            // Redirect to dev dashboard
                            router.push("/user/dev/dashboard");
                        })
                        .catch((err: AxiosError) => {
                            // Update the status
                            setStatus({
                                success: false,
                                message: err.response?.data,
                            });
                        });
                }}
            >
                <input
                    type="text"
                    required={true}
                    value={newName || app.name}
                    placeholder="Name"
                    onChange={(e) => setNewName(e.target.value)}
                />
                <input
                    type="text"
                    required={true}
                    value={newTitle || app.title}
                    placeholder="Title"
                    onChange={(e) => setNewTitle(e.target.value)}
                />
                <textarea
                    required={true}
                    value={newDescription || app.description}
                    placeholder="Description"
                    onChange={(e) => setNewDescription(e.target.value)}
                />
                <input
                    type="number"
                    step={0.01}
                    required={true}
                    value={newPrice || app.price}
                    placeholder="Price"
                    onChange={(e) => setNewPrice(e.target.valueAsNumber)}
                />
                <input
                    type="text"
                    required={true}
                    value={newGhRepoOwner || app.ghRepoOwner}
                    placeholder="GitHub Repo Owner"
                    onChange={(e) => setNewGhRepoOwner(e.target.value)}
                />
                <input
                    type="text"
                    required={true}
                    value={newGhRepoName || app.ghRepoName}
                    placeholder="GitHub Repo Name"
                    onChange={(e) => setNewGhRepoName(e.target.value)}
                />
                <input
                    type="text"
                    required={true}
                    value={newGhRepoBranch || app.ghRepoBranch}
                    placeholder="GitHub Repo Branch"
                    onChange={(e) => setNewGhRepoBranch(e.target.value)}
                />
                <ul>
                    {(newEnv !== null ? newEnv : parseEnv(app.env)).map(
                        (variable, index) => {
                            return (
                                <li key={index}>
                                    {variable[0]}={variable[1]}
                                    <button
                                        onClick={(e) => {
                                            // Prevent the page from reloading
                                            e.preventDefault();

                                            // Remove the key
                                            let envCopy;
                                            if (newEnv !== null) {
                                                envCopy = [...newEnv];
                                            } else {
                                                envCopy = parseEnv(app.env);
                                            }
                                            envCopy.splice(index, 1);
                                            setNewEnv(envCopy);
                                        }}
                                    >
                                        -
                                    </button>
                                </li>
                            );
                        }
                    )}
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
                            // Check that the key does not exist
                            const exists = (
                                newEnv !== null ? newEnv : parseEnv(app.env)
                            ).filter((variable) => variable[0] === envKey);
                            if (exists.length === 0) {
                                // Update the environment variables
                                setNewEnv([
                                    ...(newEnv !== null
                                        ? newEnv
                                        : parseEnv(app.env)),
                                    [envKey, envValue],
                                ]);

                                // Reset the key and value
                                setEnvKey("");
                                setEnvValue("");
                            }
                        }
                    }}
                >
                    +
                </button>
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

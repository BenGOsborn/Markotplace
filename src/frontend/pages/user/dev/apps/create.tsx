import axios, { AxiosError } from "axios";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/dist/client/router";
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
    const [env, setEnv] = useState<[string, string][]>([]);

    const [envKey, setEnvKey] = useState<string>("");
    const [envValue, setEnvValue] = useState<string>("");

    const [status, setStatus] = useState<Status | null>(null);

    // Used for redirects
    const router = useRouter();

    return (
        <>
            <form
                onSubmit={(e) => {
                    // Prevent page from reloading
                    e.preventDefault();

                    // Create the env to send
                    const sendEnv: any = {};
                    for (let pair of env) {
                        sendEnv[pair[0]] = pair[1];
                    }

                    // Make the request to create the new app
                    axios
                        .post<string>(
                            `${process.env.BACKEND_URL}/api/apps/dev/create`,
                            {
                                name,
                                title,
                                description,
                                price,
                                ghRepoOwner,
                                ghRepoName,
                                ghRepoBranch,
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
                    step={0.01}
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
                <ul>
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
                    value={envKey}
                    placeholder="Env key"
                    onChange={(e) => setEnvKey(e.target.value)}
                />
                <input
                    type="text"
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
                </button>
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

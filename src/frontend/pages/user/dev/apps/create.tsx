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
    const [env, setEnv] = useState<[string, string][]>([]);

    const [envKey, setEnvKey] = useState<string>("");
    const [envValue, setEnvValue] = useState<string>("");

    const [status, setStatus] = useState<Status | null>(null);

    return (
        <>
            <form
                onSubmit={(e) => {
                    e.preventDefault();

                    // We should send the request here and update the values
                    // Also DO NOT FORGET TO PARSE THE JSON PROPERLY - THIS SHOULD ALSO BE REFLECTED IN THE FORM
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
                        if (envKey.length > 0 && envValue.length > 0) {
                            // Make sure that the same key does not exist
                            const exists = env.filter(
                                (variable) => variable[0] === envKey
                            );
                            if (exists.length === 0)
                                setEnv([...env, [envKey, envValue]]);
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

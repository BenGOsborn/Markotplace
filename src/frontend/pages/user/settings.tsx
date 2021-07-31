import axios, { AxiosError } from "axios";
import { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { useState } from "react";
import { Status, StatusMessage } from "../../utils/status";

interface Props {
    username: string;
    email: string;
}

const Settings: NextPage<Props> = ({ username, email }) => {
    // Initialize the states
    const [newUsername, setNewUsername] = useState<string | null>(null);
    const [newEmail, setNewEmail] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState<string | null>(null);

    const [status, setStatus] = useState<Status | null>(null);

    return (
        <>
            <form
                onSubmit={(e) => {
                    // Prevent the page from refreshing
                    e.preventDefault();

                    // Make the request to edit the users details
                    axios
                        .patch<string>(
                            `${process.env.BACKEND_URL}/api/user/edit`,
                            {
                                username: newUsername ? newUsername : undefined,
                                email: newEmail ? newEmail : undefined,
                                password: newPassword ? newPassword : undefined,
                            },
                            { withCredentials: true }
                        )
                        .then((res) => {
                            // Reset the form
                            // @ts-ignore
                            e.target.reset();

                            // Set the status
                            setStatus({
                                success: true,
                                message: "Settings successfully updated",
                            });
                        })
                        .catch((err: AxiosError) => {
                            // Set the status
                            setStatus({
                                success: false,
                                message: err.response?.data,
                            });
                        });
                }}
            >
                <input
                    type="text"
                    placeholder="New username"
                    value={newUsername || username}
                    onChange={(e) => setNewUsername(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="New email"
                    value={newEmail || email}
                    onChange={(e) => setNewEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="New password"
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <input type="submit" value="Update" />
            </form>

            <StatusMessage status={status} />

            <Link href="/user/dev/settings">Dev settings</Link>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    try {
        // Get the users profile
        const {
            data: { username, email },
        } = await axios.get<Props>(
            `${process.env.BACKEND_URL}/api/user/profile`,
            {
                withCredentials: true,
                headers: { Cookie: req.headers.cookie },
            }
        );
        return { props: { username, email } as Props };
    } catch {
        // Redirect the user
        res.statusCode = 302;
        res.setHeader("Location", "/user/login");
        return { props: {} as Props };
    }
};

// Export the page
export default Settings;

export interface Status {
    success: boolean;
    message: string;
}

// Displays a status message from a status
export const StatusMessage = (props: { status: Status | null }) => {
    return (
        <>
            {props.status ? (
                props.status?.success ? (
                    <p className="textSuccess">{props.status?.message}</p>
                ) : (
                    <p className="textFail">{props.status?.message}</p>
                )
            ) : null}
        </>
    );
};

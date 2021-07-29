export interface Status {
    success: boolean;
    message: string;
}

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

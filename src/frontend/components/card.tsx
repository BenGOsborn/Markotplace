import Link from "next/link";
import styles from "../styles/Card.module.scss";

// Displays a status message from a status
const Card = (props: {
    title: string;
    link: string;
    description: string;
    author?: string;
}) => {
    return (
        <div className={styles.card}>
            <Link href={props.link}>
                <h1>{props.title}</h1>
            </Link>
            {typeof props.author !== "undefined" ? (
                <h2>{props.author}</h2>
            ) : null}
            <p>{props.description}</p>
        </div>
    );
};

// Export the component
export default Card;

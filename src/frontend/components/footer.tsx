import Link from "next/link";
import styles from "../styles/Footer.module.scss";

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.links}>
                <Link href="#">{`© Copyright Markotplace ${new Date().getFullYear()}`}</Link>
            </div>
        </footer>
    );
};

// Export the component
export default Footer;

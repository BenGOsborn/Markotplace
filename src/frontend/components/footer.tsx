import Link from "next/link";
import styles from "../styles/Footer.module.scss";

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.rows}>
                <div className={styles.links}>
                    <a
                        href="https://github.com/BenGOsborn"
                        target="_blank"
                        rel="noreferrer"
                    >
                        GitHub
                    </a>
                </div>
                <div className={styles.links}>
                    <Link href="#">{`© Copyright Markotplace ${new Date().getFullYear()}`}</Link>
                </div>
            </div>
        </footer>
    );
};

// Export the component
export default Footer;

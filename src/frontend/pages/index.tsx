import Link from "next/link";
import styles from "../styles/Home.module.scss";

const Home = () => {
    return (
        <div className={styles.home}>
            <header>
                <h1>
                    Deploy. <span>Monetize</span>. Fast. For free.
                </h1>
                <h2>
                    Deploy and monetize your web app in under three minutes, all
                    for free.
                </h2>
                <div className={styles.buttons}>
                    <Link href="/user/dev/dashboard">Get Started</Link>
                    <Link href="/apps">Find Apps</Link>
                </div>
            </header>
        </div>
    );
};

// Export the page
export default Home;

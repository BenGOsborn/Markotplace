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
            <div id="about" className={styles.content}>
                <h1>For developers, by developers</h1>
                <div className={styles.blocks}>
                    <div className={styles.block}>
                        <p>
                            Lorem ipsum <a>dolor sit</a> amet consectetur
                            adipisicing elit. Dignissimos quo voluptatibus
                            quidem id dolore. Facilis, quis. Doloribus cumque
                            labore est voluptatibus <a>reprehenderit</a>{" "}
                            voluptas unde corrupti atque harum,{" "}
                            <a>voluptatem</a> amet similique.
                        </p>
                    </div>
                    <div className={styles.block}>
                        <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. <a>Dignissimos</a> quo voluptatibus quidem id
                            dolore. Facilis, quis. Doloribus cumque labore est{" "}
                            <a>voluptatibus</a> reprehenderit voluptas unde
                            corrupti atque harum, voluptatem <a>amet</a>{" "}
                            similique.
                        </p>
                    </div>
                </div>
            </div>
            <div id="docker" className={styles.content}>
                <h1>Deploy with Docker</h1>
                <div className={styles.blocks}>
                    <div className={styles.block}>
                        <p>
                            Lorem ipsum <a>dolor sit</a> amet consectetur
                            adipisicing elit. Dignissimos quo voluptatibus
                            quidem id dolore. Facilis, quis. Doloribus cumque
                            labore est voluptatibus <a>reprehenderit</a>{" "}
                            voluptas unde corrupti atque harum,{" "}
                            <a>voluptatem</a> amet similique.
                        </p>
                    </div>
                    <div className={styles.block}>
                        <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. <a>Dignissimos</a> quo voluptatibus quidem id
                            dolore. Facilis, quis. Doloribus cumque labore est{" "}
                            <a>voluptatibus</a> reprehenderit voluptas unde
                            corrupti atque harum, voluptatem <a>amet</a>{" "}
                            similique.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Export the page
export default Home;

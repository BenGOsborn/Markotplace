import Link from "next/link";
import styles from "../styles/Home.module.scss";

const Home = () => {
    return (
        <div className={styles.home}>
            <header>
                <h1>
                    Deploy. <span>Monetize</span>. Fast. Free.
                </h1>
                <h2>
                    Deploy and monetize your web app in under three minutes,
                    free forever.
                </h2>
                <div className={styles.buttons}>
                    <Link href="/user/dev/dashboard">Get Started</Link>
                    <Link href="/apps">Find Apps</Link>
                </div>
            </header>
            <div id="about" className={styles.content}>
                <h1>
                    For <span>developers</span>, by developers
                </h1>
                <div className={styles.blocks}>
                    <div className={styles.block}>
                        <p>
                            Did you know that the majority of abandoned projects
                            are abandoned due to deployment struggles?{" "}
                            <Link href="#">Markotplace</Link> was designed to
                            take the pain out of the{" "}
                            <strong>
                                monetization, deployment, and marketing
                            </strong>{" "}
                            aspects of developing web applications so you can
                            focus all of your attention on your code.
                        </p>
                    </div>
                    <div className={styles.block}>
                        <p>
                            Simply deploy your app to our platform in under 5
                            minutes from your{" "}
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noreferrer"
                            >
                                GitHub
                            </a>{" "}
                            account, set the price of your app, and then{" "}
                            {"you're"} done. We will{" "}
                            <strong>promote your app</strong> on our market, and
                            will <strong>automatically rebuild</strong> your
                            code whenever you make changes to the monitored Git
                            branch.
                        </p>
                    </div>
                </div>
            </div>
            <div id="docker" className={styles.content}>
                <h1>
                    Deploy with <span>Docker</span>
                </h1>
                <div className={styles.blocks}>
                    <div className={styles.block}>
                        <p>
                            <Link href="#">Markotplace</Link> uses{" "}
                            <a
                                href="https://www.docker.com"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Docker
                            </a>{" "}
                            for deploying your apps to our platform, meaning
                            that you can test how your app will run once it is
                            deployed on your own machine and that it is{" "}
                            <strong>guaranteed to work</strong> the same way on
                            our platform.
                        </p>
                    </div>
                    <div className={styles.block}>
                        <p>
                            Simply create a <strong>Dockerfile</strong> in the
                            root folder of your{" "}
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noreferrer"
                            >
                                GitHub
                            </a>{" "}
                            repo branch specifying how your app should run in
                            production, and then we will{" "}
                            <strong>deploy this container</strong> containing
                            your app to our platform.
                        </p>
                    </div>
                </div>
            </div>
            <div id="play" className={styles.content}>
                <h1>
                    Use <span>apps</span> made by your favourite creators
                </h1>
                <div className={styles.blocks}>
                    <div className={styles.block}>
                        <p>
                            In addition to being a platform for{" "}
                            <strong>deploying web applications</strong>,{" "}
                            <Link href="#">Markotplace</Link> serves as a{" "}
                            <strong>marketplace</strong> for users to{" "}
                            <strong>buy apps</strong> deployed on our platform
                            and use them.
                        </p>
                    </div>
                    <div className={styles.block}>
                        <p>
                            <Link href="/apps">Browse</Link> through our list of
                            amazing apps deployed by our talented connected
                            developers, <strong>buy</strong> apps that look fun
                            or that are made by your{" "}
                            <strong>favourite creators</strong>, and use them
                            instantly directly from your{" "}
                            <strong>browser</strong>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Export the page
export default Home;

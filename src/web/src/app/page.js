export default function Home() {
    return (
        <>
            <script src="/js/spyware.js"></script>
            <h1>Naoka</h1>
            <p>
                <a href="https://github.com/Nekidev/Naoka/releases">
                    Releases (Download)
                </a>{" "}
                &middot;{" "}
                <a href="https://discord.gg/7UAxjtmmea">Discord server</a>{" "}
                &middot;{" "}
                <a href="https://github.com/Nekidev/Naoka">GitHub repository</a>{" "}
                &middot;{" "}
                <a href="https://ko-fi.com/Nekidev">Ko-fi</a>
            </p>
            <p>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.5rem",
                        position: "relative",
                    }}
                >
                    <a href="/imgs/screenshot-01.png" target="_blank">
                        <img
                            src="/imgs/screenshot-01.png"
                            style={{
                                width: "100%",
                                borderRadius: "2.5px",
                            }}
                        />
                    </a>
                    <a href="/imgs/screenshot-02.png" target="_blank">
                        <img
                            src="/imgs/screenshot-02.png"
                            style={{
                                width: "100%",
                                borderRadius: "2.5px",
                            }}
                        />
                    </a>
                </div>
            </p>
            <p>
                Hihi! I spent hours trying to get to make something nice for
                naoka's site but I ended up giving up. Not like much is needed
                to host some text anyways.
            </p>
            <p>
                Naoka is an anime and manga tracking app with a good looking UI,
                (not like this site, trust me). I'll eventually work on
                something nicer to put here, but in the meantime the only thing
                you need is the download link.
            </p>
            <p>
                What features does the app have, you're probably asking
                yourself. They're a few:
                <ul>
                    <li>
                        Anime & manga tracking - One app for all your needs. You
                        can track them separately or all together
                    </li>
                    <li>
                        Dark mode first - I'll eventually make it themeable, but
                        for now it's just dark mode
                    </li>
                    <li>
                        Syncing with tracking sites - AniList and MyAnimeList
                        are the only sites supported ATM, but the plan is to add
                        more sites.
                        <br />
                        <br />
                        Ideally, the sites that will be supported are:
                        <br />
                        - AniList
                        <br />
                        - MyAnimeList
                        <br />
                        - Kitsu
                        <br />
                        - Notify.moe
                        <br />
                        - MangaDex
                        <br />
                        - VNDB (yes, this is a planned feature)
                        <br />
                        <br />
                        More sites will be added as I discover them and have
                        time to work on them. <br />
                        <br />
                        <i>
                            You don't depend on one of these sites to track your
                            anime and manga.
                            <b>
                                You CAN sync to multiple sites at the same time.
                            </b>
                        </i>
                    </li>
                    <li>
                        Spanish translation - Si baby lo traduje yo mismito.
                        Igual puede que esté medio desactualizada la traducción
                        asi q...
                    </li>
                    <li>
                        Advanced reviewing - You can write long reviews and rate
                        specific parts of the media, like the characters,
                        visuals, art, engagement, etc.
                    </li>
                    <li>
                        Create lists - Create lists and add anything into them.
                        You can even add both anime and manga at the same time
                        to the same list!
                    </li>
                    <li>
                        Offline library - You library doesn't need to be online
                        to use it. You won't be able to search for anime or
                        manga without an internet connection and images probably
                        won't load, but the library will still be usable (I'll
                        add image caching in the future).
                    </li>
                </ul>
            </p>
            <p>
                I cannot remember any other thing to add to the list, but
                probably by the time you're reading this much more features were
                introduced.
            </p>
            <p>
                At the time of writing this, macOS and Linux aren't supported
                yet, but the plan is to add support for them in the future so go
                check the GitHub page if you use one of those platforms.
            </p>
            <p>
                I think there's nothing else to say here, if I remember
                something I'll eventually add it here.
            </p>
            <p>- Nyeki</p>
            <p>
                PD: If you have a better idea of something to place in this
                site, you can send me a DM on Discord. I'd recommend giving it a
                deeper look.
            </p>
        </>
    );
}

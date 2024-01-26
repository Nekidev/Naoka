export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div id="top"></div>
                <div
                    style={{
                        width: "100%",
                        maxWidth: "30em",
                        paddingBottom: "2rem",
                    }}
                >
                    {children}
                    <hr />
                    <p>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                width: "100%",
                            }}
                        >
                            <span>
                                <a href="#top">Go to the top</a> &middot;{" "}
                                <a href="/">Home</a>{" "}
                                &middot; <a href="https://nyeki.dev">Nyeki</a>
                            </span>
                            <span>MIT License</span>
                        </div>
                    </p>
                </div>
            </body>
        </html>
    );
}

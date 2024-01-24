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
                <div
                    style={{
                        maxWidth: "30em",
                        paddingBottom: "2rem"
                    }}
                >
                    {children}
                </div>
            </body>
        </html>
    );
}

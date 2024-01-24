export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                style={{
                    maxWidth: "30em",
                }}
            >
                {children}
            </body>
        </html>
    );
}

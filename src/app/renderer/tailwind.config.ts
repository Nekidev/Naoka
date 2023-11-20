import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        process.cwd() + "/renderer/src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        process.cwd() + "/renderer/src/components/**/*.{js,ts,jsx,tsx,mdx}",
        process.cwd() + "/renderer/src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            aspectRatio: {
                cover: "2 / 3",
            }
        },
    },
    plugins: [],
};
export default config;

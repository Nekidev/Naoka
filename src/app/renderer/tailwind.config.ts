import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
    content: [
        process.cwd() + "/renderer/src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        process.cwd() + "/renderer/src/components/**/*.{js,ts,jsx,tsx,mdx}",
        process.cwd() + "/renderer/src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            aspectRatio: {
                cover: "2 / 3",
            },
            spacing: {
                14: "3.5rem",
            },
            colors: {
                zinc: {
                    850: "#202023",
                    ...colors.zinc,
                },
            },
            fontFamily: {
                rubik: ["'Rubik'", "sans-serif"],
            },
        },
    },
    plugins: [],
};
export default config;

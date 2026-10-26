import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "scale-in": "scale-in 180ms ease-out",
        "slide-in-left": "slide-in-left 250ms ease-out",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        corporate: {
          ...require("daisyui/src/theming/themes")["corporate"],
          primary: "#001C94",
          secondary: "#F4F6FC",
          "base-200": "#F4F6FC",
        }
      }
    ],
  },
};
export default config;

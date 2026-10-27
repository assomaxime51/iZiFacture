import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17221d",
        sage: "#557b68",
        cream: "#f7f8f4",
        line: "#e7ece7",
        surface: "#ffffff",
        muted: "#829087",
        navy: "#101827",
        "status-paid": "#2d7b4c",
        "status-sent": "#3c6c91",
        "status-late": "#b25247",
        "status-draft": "#6f7972",
      },
      fontFamily: {
        display: ["var(--font-manrope)"],
        sans: ["var(--font-dm-sans)"],
      },
      borderRadius: {
        panel: "16px",
        control: "12px",
      },
      boxShadow: {
        panel: "0 2px 10px rgba(34, 63, 44, .025)",
        lift: "0 10px 24px rgba(34, 63, 44, .08)",
      },
      transitionDuration: {
        motion: "180ms",
      },
    },
  },
  plugins: [
    ({ addUtilities }) => {
      addUtilities({
        ".transition-motion": {
          transitionProperty: "transform, background-color, border-color, box-shadow, color",
          transitionDuration: "180ms",
          transitionTimingFunction: "ease",
        },
      });
    },
  ],
};

export default config;

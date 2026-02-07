import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#F97316",
          light: "#FDBA74",
          dark: "#C2410C"
        }
      }
    }
  },
  plugins: []
};

export default config;

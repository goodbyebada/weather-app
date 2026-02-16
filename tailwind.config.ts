/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1D4ED8", // blue-700 (API 6.0:1 contrast)
          hover: "#1E40AF", // blue-800
        },
        secondary: {
          DEFAULT: "#7C3AED", // violet-600 (API 5.12:1 contrast)
          hover: "#6D28D9", // violet-700
        },
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
        error: "#EF4444",
        success: "#10B981",
        warning: "#F59E0B",
      },
      keyframes: {
        slideUp: {
          from: { opacity: "0", transform: "translateY(1rem)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(2px)" },
        },
      },
      animation: {
        slideUp: "slideUp 0.3s ease-out forwards",
        shake: "shake 0.4s ease-in-out",
      },
      zIndex: {
        header: "50",
        dropdown: "60",
        toast: "100",
        modal: "9999",
      },
    },
  },
  plugins: [],
};

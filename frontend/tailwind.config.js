/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Primary */
        p:   "#800020",
        pl:  "#A32845",
        pd:  "#5C0018",
        acc: "#E12D45",
        acc2:"#FF5A72",
        /* Backgrounds */
        bg:   "#FDF8F8",
        bg2:  "#FFFFFF",
        card: "#FFFFFF",
        /* Text */
        txt:   "#1A2332",
        muted: "#6B7280",
        /* Status */
        ok:   "#16A34A",
        warn: "#F59E0B",
        err:  "#E12D45",
        info: "#2563EB",
        /* Borders */
        brd:  "rgba(128,0,32,0.12)",
        brd2: "#ECECEC",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card:  "12px",
        btn:   "10px",
        input: "8px",
        modal: "20px",
      },
      boxShadow: {
        card:  "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(128,0,32,0.04)",
        "card-hover": "0 8px 24px rgba(128,0,32,0.08)",
        modal: "0 32px 80px rgba(92,0,24,0.2)",
        btn:   "0 4px 18px rgba(225,45,69,0.35)",
        nav:   "0 4px 14px rgba(225,45,69,0.45)",
      },
      backgroundImage: {
        sidebar:
          "linear-gradient(180deg, #6B0019 0%, #800020 42%, #5C0018 100%)",
        "btn-primary":
          "linear-gradient(135deg, #E12D45 0%, #800020 100%)",
        "hero-overlay":
          "linear-gradient(135deg, rgba(92,0,24,0.88) 0%, rgba(128,0,32,0.75) 50%, rgba(92,0,24,0.60) 100%)",
      },
      fontSize: {
        "page-title":   ["26px", { fontWeight: "800" }],
        "card-value":   ["34px", { fontWeight: "800" }],
        "section-head": ["15px", { fontWeight: "700" }],
        "table-head":   ["10px", { fontWeight: "800", letterSpacing: "0.07em" }],
      },
    },
  },
  plugins: [],
};

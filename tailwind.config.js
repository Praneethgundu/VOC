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
        p:   "#0F172A",
        pl:  "#334155",
        pd:  "#0F172A",
        acc: "#2563EB",
        acc2:"#3B82F6",
        /* Backgrounds */
        bg:   "#F8FAFC",
        bg2:  "#FFFFFF",
        card: "#FFFFFF",
        /* Text */
        txt:   "#1E293B",
        muted: "#64748B",
        /* Status */
        ok:   "#059669",
        warn: "#F59E0B",
        err:  "#2563EB",
        info: "#2563EB",
        /* Borders */
        brd:  "rgba(128,0,32,0.12)",
        brd2: "#E2E8F0",
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
          "linear-gradient(180deg, #0F172A 0%, #0F172A 42%, #0F172A 100%)",
        "btn-primary":
          "linear-gradient(135deg, #2563EB 0%, #0F172A 100%)",
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

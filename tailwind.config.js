/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 제목 · 테이블 헤더 · 레이블 · 포인트: Poppins
        poppins: ["var(--font-poppins)", "Poppins", "sans-serif"],
        // 설명 · 테이블 body · 본문: Pretendard
        pretendard: ["Pretendard Variable", "Pretendard", "sans-serif"],
        // sans 기본값을 Pretendard로 (body 전체 기본 폰트)
        sans: ["Pretendard Variable", "Pretendard", "var(--font-poppins)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

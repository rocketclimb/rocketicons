/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx"],
  presets: [require("nativewind/preset")],
  plugins: [require("rocketicons/tailwind").nativeIconPlugin]
};

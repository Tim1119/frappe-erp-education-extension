module.exports = {
  presets: [
    require('frappe-ui/src/utils/tailwind.config')
  ],
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./node_modules/frappe-ui/src/components/**/*.{vue,js,ts,jsx,tsx}",
  ],
  safelist: [
    'grid-cols-7',
    'grid-rows-6',
    'min-w-[600px]',
    'min-h-[600px]',
    'min-h-[500px]',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

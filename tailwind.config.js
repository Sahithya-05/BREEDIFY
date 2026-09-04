/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF8F3',
          100: '#F7F3EA',
          200: '#EFE8D8',
          300: '#E3D7BD',
        },
        forest: {
          900: '#1A241B',
          800: '#222E23',
          700: '#2F3D30',
          600: '#3A4A3C',
          500: '#4B5E4E',
          100: '#E5EBE6',
        },
        terracotta: {
          DEFAULT: '#C1552E',
          hover: '#A84723',
          light: '#F8EDE8',
          dark: '#8C381A',
        },
        charcoal: {
          DEFAULT: '#2A2A28',
          muted: '#8A8A80',
          light: '#5A5A54',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Lora', 'Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(42, 42, 40, 0.05)',
        'card': '0 10px 30px -5px rgba(42, 42, 40, 0.08)',
        'glow': '0 0 25px rgba(193, 85, 46, 0.25)',
      }
    },
  },
  plugins: [],
}

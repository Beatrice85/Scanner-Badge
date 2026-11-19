import defaultTheme from 'tailwindcss/defaultTheme'

// Jetons de design (design tokens) : une seule source de vérité pour la typographie
// et les arrondis. Utiliser ces noms plutôt que des valeurs arbitraires (rounded-[22px]…).
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Police unique de l'application (chargée dans index.html)
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        // Cartes et sections de page
        carte: '1.5rem', // 24 px
        // Blocs internes : tableaux, alertes, indicateurs
        bloc: '1rem', // 16 px
        // Boutons : rounded-full (pilule). Champs de formulaire : rounded-xl (12 px).
      },
    },
  },
  plugins: [],
}

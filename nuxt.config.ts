// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Server-render the shell so hard refreshes keep the layout intact.
  ssr: true,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/styles/main.css'],

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap',
        },
      ],
    },
  },
  
  // Run frontend on port 3001 to avoid conflict with backend on port 3000
  devServer: {
    port: 3001,
  },
  
  build: {
    transpile: ['vuetify'],
  },
  
  vite: {
    ssr: {
      noExternal: ['vuetify'],
    },
  },
  
  // Runtime config for API URL
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'https://subscription-backend-528466251837.us-central1.run.app/api',
    },
  },
})

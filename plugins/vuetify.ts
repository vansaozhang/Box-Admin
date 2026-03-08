import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const boxLightTheme = {
  dark: false,
  colors: {
    primary: '#0f766e',
    secondary: '#1d4ed8',
    accent: '#f59e0b',
    info: '#0ea5e9',
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
    background: '#f3f7fc',
    surface: '#ffffff',
    'surface-variant': '#eef3fb',
    'on-surface': '#1e293b',
    'on-primary': '#ffffff',
  },
}

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    components,
    directives,
    ssr: true,
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      },
    },
    theme: {
      defaultTheme: 'boxLightTheme',
      themes: {
        boxLightTheme,
      },
    },
    defaults: {
      VCard: {
        rounded: 'lg',
        elevation: 0,
      },
      VBtn: {
        rounded: 'md',
        elevation: 0,
      },
      VChip: {
        rounded: 'md',
        size: 'small',
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
        hideDetails: 'auto',
        rounded: 'md',
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable',
        hideDetails: 'auto',
        rounded: 'md',
      },
      VTextarea: {
        variant: 'outlined',
        density: 'comfortable',
        hideDetails: 'auto',
        rounded: 'md',
      },
    },
  })
  app.vueApp.use(vuetify)
})

<template>
  <v-app class="login-app">
    <div class="login-shell">
      <div class="ambient-shape ambient-shape--top"></div>
      <div class="ambient-shape ambient-shape--bottom"></div>

      <div class="login-layout">
        <v-card class="login-card">
          <v-card-text class="login-card-body">
            <div class="login-brand login-brand--compact">
              <div class="login-brand-mark">
                <v-icon size="28">mdi-shield-account</v-icon>
              </div>
              <div>
                <p class="login-brand-name login-brand-name--dark">Box Admin</p>
                <p class="login-brand-subtitle login-brand-subtitle--dark">Secure workspace control</p>
              </div>
            </div>

            <p class="login-eyebrow">Welcome back</p>
            <h2 class="login-title">Sign in to continue</h2>
            <p class="login-subtitle">
              Use your administrator credentials to open the Box Admin workspace.
            </p>

            <v-alert
              v-if="errorMessage"
              type="error"
              density="compact"
              closable
              class="login-alert"
              @click:close="errorMessage = null"
            >
              {{ errorMessage }}
            </v-alert>

            <v-form ref="formRef" class="login-form" @submit.prevent="handleLogin">
              <v-text-field
                v-model="username"
                label="Username"
                placeholder="Enter your username"
                autocomplete="username"
                prepend-inner-icon="mdi-account-circle-outline"
                :rules="[rules.required]"
                class="login-field"
                required
              />

              <v-text-field
                v-model="password"
                label="Password"
                placeholder="Enter your password"
                autocomplete="current-password"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                :rules="[rules.required]"
                class="login-field"
                required
                @click:append-inner="showPassword = !showPassword"
              />

              <div class="login-form-meta">
                <v-icon size="18" color="primary">mdi-shield-check-outline</v-icon>
                <span>Session-protected access for authorized administrators only.</span>
              </div>

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="isLoading"
                class="login-submit"
              >
                Sign In
              </v-btn>
            </v-form>
          </v-card-text>

          <v-divider class="mx-6"></v-divider>

          <v-card-actions class="login-footer">
            <p class="login-footer-text">Need access? Contact your workspace administrator.</p>
          </v-card-actions>
        </v-card>
      </div>
    </div>
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: false,
  middleware: 'guest',
})

const router = useRouter()
const { login, loading } = useAuth()

const formRef = ref()
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref<string | null>(null)
const isLoading = computed(() => loading.value)

const rules = {
  required: (v: string) => !!v || 'This field is required',
}

const handleLogin = async () => {
  errorMessage.value = null

  const validation = await formRef.value?.validate()
  if (!validation?.valid) {
    return
  }

  const result = await login({
    username: username.value,
    password: password.value,
  })

  if (result.success) {
    router.push('/')
  } else {
    errorMessage.value = result.error || 'Login failed. Please try again.'
  }
}
</script>

import { computed } from 'vue'

interface User {
  id: string
  email: string
  name: string
  username?: string
  role?: string
  status?: string
  permissions?: string[]
}

interface LoginCredentials {
  username: string
  password: string
}

interface RegisterCredentials {
  name: string
  email: string
  password: string
  phone_number?: string
}

interface AuthResponse {
  access_token: string
  refresh_token?: string
  user: User
  permissions?: string[]
}

const AUTH_TOKEN_KEY = 'auth_token'
const AUTH_REFRESH_TOKEN_KEY = 'auth_refresh_token'
const AUTH_USER_KEY = 'auth_user'

const isUserShape = (value: unknown): value is User => {
  return typeof value === 'object' && value !== null && 'id' in value && 'email' in value
}

const parseStoredUser = (rawUser: User | string | null | undefined) => {
  if (!rawUser) {
    return null
  }

  if (isUserShape(rawUser)) {
    return rawUser
  }

  try {
    return JSON.parse(rawUser) as User
  } catch {
    return null
  }
}

const decodeJwtPayload = (jwt: string) => {
  try {
    const [, payload] = jwt.split('.')
    if (!payload) {
      return null
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const decoded = import.meta.server
      ? Buffer.from(padded, 'base64').toString('utf-8')
      : atob(padded)

    return JSON.parse(decoded) as { exp?: number }
  } catch {
    return null
  }
}

const isTokenExpired = (jwt: string | null | undefined, skewSeconds = 30) => {
  if (!jwt) {
    return true
  }

  const payload = decodeJwtPayload(jwt)
  if (!payload?.exp) {
    return false
  }

  return Date.now() >= payload.exp * 1000 - skewSeconds * 1000
}

const syncClientStorage = (
  nextToken: string | null,
  nextRefreshToken: string | null,
  nextUser: User | null,
) => {
  if (!import.meta.client) {
    return
  }

  if (nextToken) {
    localStorage.setItem(AUTH_TOKEN_KEY, nextToken)
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }

  if (nextRefreshToken) {
    localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, nextRefreshToken)
  } else {
    localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY)
  }

  if (nextUser) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser))
  } else {
    localStorage.removeItem(AUTH_USER_KEY)
  }
}

const readErrorMessage = async (response: Response, fallbackMessage: string) => {
  const rawBody = await response.text()

  if (!rawBody) {
    return fallbackMessage
  }

  try {
    const parsed = JSON.parse(rawBody) as { message?: string; error?: string }
    return parsed.message || parsed.error || fallbackMessage
  } catch {
    return rawBody
  }
}

const normalizeUser = (response: AuthResponse, fallbackUser?: User | null): User | null => {
  if (!response.user && !fallbackUser) {
    return null
  }

  return {
    ...(fallbackUser ?? {}),
    ...(response.user ?? {}),
    permissions: response.user?.permissions ?? response.permissions ?? fallbackUser?.permissions ?? [],
  } as User
}

export const useAuth = () => {
  const runtimeConfig = useRuntimeConfig()
  const apiBaseUrl = runtimeConfig.public.apiBase as string
  const user = useState<User | null>('auth:user', () => null)
  const token = useState<string | null>('auth:token', () => null)
  const refreshToken = useState<string | null>('auth:refresh-token', () => null)
  const loading = useState('auth:loading', () => false)
  const error = useState<string | null>('auth:error', () => null)
  const initialized = useState('auth:initialized', () => false)
  const tokenCookie = useCookie<string | null>(AUTH_TOKEN_KEY, {
    default: () => null,
    sameSite: 'lax',
    path: '/',
  })
  const refreshTokenCookie = useCookie<string | null>(AUTH_REFRESH_TOKEN_KEY, {
    default: () => null,
    sameSite: 'lax',
    path: '/',
  })
  const userCookie = useCookie<User | null>(AUTH_USER_KEY, {
    default: () => null,
    sameSite: 'lax',
    path: '/',
  })
  const isAuthenticated = computed(() => !!token.value)
  const hasSession = computed(() => !!token.value || !!refreshToken.value)

  const setSession = (
    nextToken: string | null,
    nextRefreshToken: string | null,
    nextUser: User | null,
  ) => {
    token.value = nextToken
    refreshToken.value = nextRefreshToken
    user.value = nextUser
    tokenCookie.value = nextToken
    refreshTokenCookie.value = nextRefreshToken
    userCookie.value = nextUser
    syncClientStorage(nextToken, nextRefreshToken, nextUser)
  }

  const initAuth = () => {
    if (initialized.value) {
      return
    }

    const cookieUser = parseStoredUser(userCookie.value)

    if (tokenCookie.value || refreshTokenCookie.value) {
      token.value = tokenCookie.value
      refreshToken.value = refreshTokenCookie.value
      user.value = cookieUser
    } else if (cookieUser) {
      userCookie.value = null
    }

    if (import.meta.client && !token.value && !refreshToken.value) {
      const savedToken = localStorage.getItem(AUTH_TOKEN_KEY)
      const savedRefreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY)
      const savedUser = parseStoredUser(localStorage.getItem(AUTH_USER_KEY))

      if (savedToken || savedRefreshToken) {
        setSession(savedToken, savedRefreshToken, savedUser)
      }
    } else if (import.meta.client && (token.value || refreshToken.value)) {
      syncClientStorage(token.value, refreshToken.value, user.value)
    }

    initialized.value = true
  }

  if (!initialized.value) {
    initAuth()
  }

  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${apiBaseUrl}/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Login failed'))
      }

      const data: AuthResponse = await response.json()
      setSession(data.access_token, data.refresh_token ?? null, normalizeUser(data))
      initialized.value = true

      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'An error occurred during login'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Registration failed'))
      }

      const data: AuthResponse = await response.json()
      setSession(data.access_token, data.refresh_token ?? null, normalizeUser(data))
      initialized.value = true

      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'An error occurred during registration'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    setSession(null, null, null)
    error.value = null
    initialized.value = true
  }

  const refreshAccessToken = async () => {
    if (!initialized.value) {
      initAuth()
    }

    if (!refreshToken.value) {
      return false
    }

    try {
      const response = await fetch(`${apiBaseUrl}/admin/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken.value,
        }),
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Session expired'))
      }

      const data: AuthResponse = await response.json()
      setSession(
        data.access_token,
        data.refresh_token ?? refreshToken.value,
        normalizeUser(data, user.value),
      )
      error.value = null
      initialized.value = true
      return true
    } catch (err: any) {
      setSession(null, null, null)
      error.value = err.message || 'Session expired'
      initialized.value = true
      return false
    }
  }

  const requestCurrentUser = async () => {
    if (!token.value) {
      return { status: 401, user: null as User | null }
    }

    const response = await fetch(`${apiBaseUrl}/admin/auth/me`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { status: response.status, user: null as User | null }
      }

      throw new Error(await readErrorMessage(response, 'Failed to fetch user'))
    }

    return {
      status: response.status,
      user: (await response.json()) as User,
    }
  }

  const fetchCurrentUser = async () => {
    if (!initialized.value) {
      initAuth()
    }

    if (!token.value || isTokenExpired(token.value)) {
      const refreshed = await refreshAccessToken()
      if (!refreshed) {
        return null
      }
    }

    loading.value = true

    try {
      let currentUser = await requestCurrentUser()

      if (currentUser.status === 401) {
        const refreshed = await refreshAccessToken()
        if (!refreshed) {
          return null
        }
        currentUser = await requestCurrentUser()
      }

      if (!currentUser.user) {
        throw new Error('Failed to fetch user')
      }

      setSession(token.value, refreshToken.value, currentUser.user)
      error.value = null
      return currentUser.user
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user'
      return null
    } finally {
      loading.value = false
    }
  }

  const restoreSession = async () => {
    if (!initialized.value) {
      initAuth()
    }

    if (token.value && !isTokenExpired(token.value)) {
      if (user.value) {
        return true
      }

      return !!(await fetchCurrentUser())
    }

    if (refreshToken.value) {
      const refreshed = await refreshAccessToken()
      if (!refreshed) {
        return false
      }

      if (user.value) {
        return true
      }

      return !!(await fetchCurrentUser())
    }

    setSession(null, null, null)
    return false
  }

  return {
    user: computed(() => user.value),
    token: computed(() => token.value),
    refreshToken: computed(() => refreshToken.value),
    isAuthenticated,
    hasSession,
    initialized: computed(() => initialized.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    login,
    register,
    logout,
    initAuth,
    refreshAccessToken,
    fetchCurrentUser,
    restoreSession,
  }
}

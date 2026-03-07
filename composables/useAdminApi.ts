export const useAdminApi = () => {
  const runtimeConfig = useRuntimeConfig()
  const apiBaseUrl = runtimeConfig.public.apiBase as string
  const auth = useAuth()

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

  const send = async <T>(
    path: string,
    options: RequestInit = {},
    responseType: 'json' | 'text' = 'json',
  ): Promise<T> => {
    await auth.restoreSession()

    const execute = async () => {
      const headers = new Headers(options.headers ?? {})

      if (!headers.has('Authorization') && auth.token.value) {
        headers.set('Authorization', `Bearer ${auth.token.value}`)
      }

      if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
      }

      return fetch(`${apiBaseUrl}${path}`, {
        ...options,
        headers,
      })
    }

    let response = await execute()

    if (response.status === 401) {
      const refreshed = await auth.refreshAccessToken()
      if (refreshed) {
        response = await execute()
      }
    }

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'Request failed'))
    }

    if (responseType === 'text') {
      return (await response.text()) as T
    }

    if (response.status === 204) {
      return null as T
    }

    return (await response.json()) as T
  }

  return {
    send,
  }
}

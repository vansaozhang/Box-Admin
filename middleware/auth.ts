export default defineNuxtRouteMiddleware(async () => {
  const { restoreSession } = useAuth()

  const authenticated = await restoreSession()
  if (!authenticated) {
    return navigateTo('/login')
  }
})

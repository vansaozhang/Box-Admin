<template>
  <v-app class="app-shell">
    <div class="ambient-shape ambient-shape--top"></div>
    <div class="ambient-shape ambient-shape--bottom"></div>

    <v-navigation-drawer
      v-if="isMobile"
      v-model="drawer"
      temporary
      :width="280"
      location="left"
      scrim="rgba(15, 23, 42, 0.42)"
      class="app-drawer app-drawer--mobile"
    >
      <AdminSidebarContent
        :opened-groups="openedGroups"
        :display-user-name="displayUserName"
        :display-user-email="displayUserEmail"
        :user-initials="userInitials"
        @update:opened-groups="openedGroups = $event"
      />
    </v-navigation-drawer>

    <div :class="['app-frame', { 'app-frame--mobile': isMobile }]">
      <aside v-if="!isMobile" class="app-sidebar">
        <AdminSidebarContent
          :opened-groups="openedGroups"
          :display-user-name="displayUserName"
          :display-user-email="displayUserEmail"
          :user-initials="userInitials"
          @update:opened-groups="openedGroups = $event"
        />
      </aside>

      <div class="app-body">
        <header class="app-topbar px-2 px-md-5">
          <v-btn
            v-if="isMobile"
            icon
            variant="text"
            class="mr-1"
            aria-label="Open navigation"
            @click="drawer = !drawer"
          >
            <v-icon>mdi-menu</v-icon>
          </v-btn>

          <div class="topbar-copy">
            <p class="topbar-title">{{ pageTitle }}</p>
            <p class="topbar-subtitle">{{ pageSubtitle }}</p>
          </div>

          <v-spacer></v-spacer>

          <v-badge dot color="error" offset-x="8" offset-y="8">
            <v-btn icon variant="text" class="topbar-icon-btn" aria-label="Notifications">
              <v-icon>mdi-bell-outline</v-icon>
            </v-btn>
          </v-badge>
          <v-btn icon variant="text" class="topbar-icon-btn ml-1" aria-label="Settings">
            <v-icon>mdi-cog-outline</v-icon>
          </v-btn>

          <v-menu offset-y min-width="200">
            <template #activator="{ props }">
              <v-btn v-bind="props" variant="text" class="ml-2 px-2 user-menu-trigger">
                <v-avatar size="36" color="secondary">
                  <span class="text-white text-body-2 font-weight-bold">{{ userInitials }}</span>
                </v-avatar>
                <v-icon size="18" class="ml-1">mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title class="font-weight-medium">{{ displayUserName }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption">{{ displayUserEmail }}</v-list-item-subtitle>
              </v-list-item>
              <v-divider class="my-1"></v-divider>
              <v-list-item @click="handleLogout" prepend-icon="mdi-logout">
                <v-list-item-title>Logout</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </header>

        <main class="app-main">
          <div class="content-shell">
            <slot />
          </div>
        </main>
      </div>
    </div>
  </v-app>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'

const route = useRoute()
const router = useRouter()
const display = useDisplay()
const hasMounted = ref(false)
const isMobile = computed(() => hasMounted.value ? display.mdAndDown.value : false)
const drawer = ref(false)
const openedGroups = ref<string[]>([])

// Auth
const { initialized, isAuthenticated, user: currentUser, logout } = useAuth()

const displayUserName = computed(() => {
  if (currentUser.value?.name) {
    return currentUser.value.name
  }

  if (isAuthenticated.value && !initialized.value) {
    return 'Loading profile'
  }

  if (isAuthenticated.value) {
    return 'Signed In User'
  }

  return 'Admin User'
})

const displayUserEmail = computed(() => {
  if (currentUser.value?.email) {
    return currentUser.value.email
  }

  if (isAuthenticated.value) {
    return ''
  }

  return 'admin@box.com'
})

const userInitials = computed(() => {
  const name = currentUser.value?.name || (isAuthenticated.value ? 'Signed In' : 'Admin User')
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const handleLogout = () => {
  logout()
  router.push('/login')
}

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Monitor platform performance and activity' },
  '/users': { title: 'Users', subtitle: 'Manage access, roles, and account status' },
  '/security/users-roles': {
    title: 'Users Roles',
    subtitle: 'Create roles and control access scope',
  },
  '/security/role-permissions': {
    title: 'Role Permissions',
    subtitle: 'Assign granular permissions by role',
  },
  '/settings': { title: 'Settings', subtitle: 'Tune workspace preferences and notifications' },
}

const pageTitle = computed(() => pageMeta[route.path]?.title ?? 'Box Admin')
const pageSubtitle = computed(() => pageMeta[route.path]?.subtitle ?? 'Workspace overview')

onMounted(() => {
  hasMounted.value = true
})

watch(
  () => isMobile.value,
  (mobile) => {
    if (!mobile) {
      drawer.value = false
    }
  },
  { immediate: true }
)

watch(
  () => route.path,
  (path) => {
    if ((path === '/users' || path.startsWith('/security')) && !openedGroups.value.includes('security')) {
      openedGroups.value = [...openedGroups.value, 'security']
    }

    if (isMobile.value) {
      drawer.value = false
    }
  },
  { immediate: true }
)
</script>

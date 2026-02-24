<template>
  <v-app class="app-shell">
    <div class="ambient-shape ambient-shape--top"></div>
    <div class="ambient-shape ambient-shape--bottom"></div>

    <v-navigation-drawer
      v-model="drawer"
      :permanent="!display.mdAndDown.value"
      :temporary="display.mdAndDown.value"
      :width="280"
      app
      class="app-drawer"
    >
      <div class="drawer-brand pa-6">
        <div class="brand-mark">
          <v-icon size="30" color="white">mdi-cube-outline</v-icon>
        </div>
        <div>
          <p class="brand-name">Box Admin</p>
          <p class="brand-subtitle">Workspace Control</p>
        </div>
      </div>

      <v-list v-model:opened="openedGroups" nav class="px-3 pt-2">
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          rounded="lg"
          class="nav-item mb-1"
        ></v-list-item>

        <v-list-group value="security" class="nav-group mb-1">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-shield-lock-outline"
              title="Security"
              rounded="lg"
              class="nav-item nav-group-activator"
            ></v-list-item>
          </template>

          <v-list-item
            to="/users"
            prepend-icon="mdi-account-group-outline"
            title="Users"
            rounded="lg"
            class="nav-item nav-sub-item mb-1"
          ></v-list-item>
          <v-list-item
            to="/security/users-roles"
            prepend-icon="mdi-account-key-outline"
            title="Users Roles"
            rounded="lg"
            class="nav-item nav-sub-item mb-1"
          ></v-list-item>
          <v-list-item
            to="/security/role-permissions"
            prepend-icon="mdi-lock-check-outline"
            title="Role Permissions"
            rounded="lg"
            class="nav-item nav-sub-item mb-1"
          ></v-list-item>
        </v-list-group>

        <v-list-item
          to="/settings"
          prepend-icon="mdi-cog-outline"
          title="Settings"
          rounded="lg"
          class="nav-item mb-1"
        ></v-list-item>
      </v-list>

      <template #append>
        <div class="drawer-footer pa-4">
          <v-sheet class="profile-card pa-3" rounded="lg">
            <v-list-item density="compact" class="px-1">
              <template #prepend>
                <v-avatar size="38" color="primary" class="mr-3">
                  <span class="text-white text-body-2 font-weight-bold">AU</span>
                </v-avatar>
              </template>
              <v-list-item-title class="text-body-2 font-weight-medium">Admin User</v-list-item-title>
              <v-list-item-subtitle class="text-caption">admin@box.com</v-list-item-subtitle>
            </v-list-item>
          </v-sheet>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar app flat class="app-topbar px-2 px-md-5">
      <v-btn
        icon
        variant="text"
        class="mr-1 d-md-none"
        aria-label="Open navigation"
        @click="drawer = !drawer"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>

      <div>
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
      <v-avatar size="36" color="secondary" class="ml-2">
        <span class="text-white text-body-2 font-weight-bold">AU</span>
      </v-avatar>
    </v-app-bar>

    <v-main class="app-main">
      <v-container fluid class="content-shell">
        <NuxtPage />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'

const route = useRoute()
const display = useDisplay()
const drawer = ref(!display.mdAndDown.value)
const openedGroups = ref<string[]>([])

const navItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/' },
]

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

watch(
  () => display.mdAndDown.value,
  (isMobile) => {
    drawer.value = !isMobile
  },
  { immediate: true }
)

watch(
  () => route.path,
  (path) => {
    if ((path === '/users' || path.startsWith('/security')) && !openedGroups.value.includes('security')) {
      openedGroups.value = [...openedGroups.value, 'security']
    }

    if (display.mdAndDown.value) {
      drawer.value = false
    }
  },
  { immediate: true }
)
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap');

:root {
  --ink-strong: #0f172a;
  --ink-soft: #5b6b84;
  --glass-border: rgba(148, 163, 184, 0.25);
}

html,
body,
#__nuxt {
  font-family: 'Plus Jakarta Sans', 'Noto Sans', sans-serif;
  background: #f3f7fc;
}

.app-shell {
  background:
    radial-gradient(circle at 12% 8%, rgba(14, 165, 233, 0.16), transparent 34%),
    radial-gradient(circle at 92% 88%, rgba(15, 118, 110, 0.14), transparent 34%),
    linear-gradient(180deg, #f8fbff 0%, #f3f7fc 55%, #eef5ff 100%);
}

.ambient-shape {
  position: fixed;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(70px);
  opacity: 0.45;
  z-index: 0;
}

.ambient-shape--top {
  width: 360px;
  height: 360px;
  top: -120px;
  right: 8%;
  background: rgba(59, 130, 246, 0.42);
}

.ambient-shape--bottom {
  width: 440px;
  height: 440px;
  left: -140px;
  bottom: -200px;
  background: rgba(20, 184, 166, 0.24);
}

.app-drawer {
  border: 0 !important;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(22, 44, 78, 0.97) 100%) !important;
  box-shadow: 8px 0 28px rgba(15, 23, 42, 0.16);
}

.drawer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%);
  box-shadow: 0 10px 24px rgba(14, 165, 233, 0.32);
}

.brand-name {
  margin: 0;
  font-family: 'Sora', 'Plus Jakarta Sans', sans-serif;
  color: #f8fafc;
  font-size: 1.02rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.brand-subtitle {
  margin: 2px 0 0;
  color: rgba(226, 232, 240, 0.72);
  font-size: 0.78rem;
}

.app-drawer .nav-item {
  color: rgba(226, 232, 240, 0.78);
  min-height: 44px;
}

.app-drawer .nav-item:hover {
  background: rgba(148, 163, 184, 0.12);
  color: #f8fafc;
}

.app-drawer .nav-item.v-list-item--active {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.28), rgba(29, 78, 216, 0.28));
  color: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(125, 211, 252, 0.3);
}

.app-drawer .nav-group-activator {
  color: rgba(226, 232, 240, 0.78);
}

.app-drawer .nav-group :deep(.v-list-group__items) {
  --indent-padding: 0px;
  margin: 4px 0 8px 0;
  padding: 2px 0;
}

.app-drawer .nav-group :deep(.v-list-group__items .v-list-item) {
  padding-inline-start: 10px !important;
}

.app-drawer .nav-sub-item {
  color: rgba(226, 232, 240, 0.78);
}

.app-drawer .nav-group-activator :deep(.v-list-item__append > .v-icon) {
  opacity: 0.75;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.app-drawer :deep(.v-list-group--open .nav-group-activator .v-list-item__append > .v-icon) {
  opacity: 1;
  transform: rotate(180deg);
}

.drawer-footer {
  border-top: 1px solid rgba(148, 163, 184, 0.18);
}

.profile-card {
  background: rgba(15, 23, 42, 0.34) !important;
  border: 1px solid rgba(148, 163, 184, 0.22);
  color: #e2e8f0;
}

.app-topbar {
  backdrop-filter: blur(14px);
  background: rgba(255, 255, 255, 0.84) !important;
  border-bottom: 1px solid var(--glass-border);
  box-shadow: 0 6px 20px rgba(148, 163, 184, 0.12);
}

.topbar-title {
  margin: 0;
  color: var(--ink-strong);
  font-family: 'Sora', 'Plus Jakarta Sans', sans-serif;
  font-size: 1.06rem;
  font-weight: 600;
}

.topbar-subtitle {
  margin: 1px 0 0;
  color: var(--ink-soft);
  font-size: 0.78rem;
}

.topbar-icon-btn {
  color: #1e293b !important;
}

.app-main {
  position: relative;
  z-index: 1;
}

.content-shell {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  padding: 28px 24px 36px;
}

.content-shell > * {
  animation: fade-slide-up 0.45s ease;
}

@keyframes fade-slide-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 959px) {
  .content-shell {
    padding: 20px 14px 28px;
  }
}
</style>

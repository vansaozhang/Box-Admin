<template>
  <v-app>
    <v-navigation-drawer permanent elevation="1" width="256" disable-resize-watcher app>
      <div class="pa-4 text-center">
        <v-icon size="48" color="primary">mdi-package-variant</v-icon>
        <div class="text-h6 mt-2">Box Admin</div>
      </div>
      <v-divider></v-divider>
      <v-list density="compact" nav class="mt-2">
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          to="/"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-account-group"
          title="Users"
          to="/users"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-cog"
          title="Settings"
          to="/settings"
        ></v-list-item>
      </v-list>
      
      <template v-slot:append>
        <v-divider></v-divider>
        <div class="pa-4">
          <v-list-item density="compact" class="px-0">
            <template v-slot:prepend>
              <v-avatar color="primary" size="32">
                <span class="text-white text-body-2">AD</span>
              </v-avatar>
            </template>
            <v-list-item-title class="text-body-2">Admin User</v-list-item-title>
            <v-list-item-subtitle class="text-caption">admin@box.com</v-list-item-subtitle>
          </v-list-item>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar color="white" elevation="1" app clipped-left>
      <v-app-bar-title>{{ pageTitle }}</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-bell"></v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-6">
        <NuxtPage />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageTitle = computed(() => {
  const path = route.path
  if (path === '/') return 'Dashboard'
  if (path === '/users') return 'Users'
  if (path === '/settings') return 'Settings'
  return 'Box Admin'
})
</script>

<style>
.v-navigation-drawer {
  width: 256px !important;
}

.v-app-bar {
  left: 256px !important;
  width: calc(100% - 256px) !important;
}

.v-main {
  padding-left: 256px !important;
  padding-top: 64px !important;
}
</style>

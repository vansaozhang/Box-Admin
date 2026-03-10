<template>
  <div class="sidebar-content">
    <div class="drawer-brand pa-6">
      <div class="brand-mark">
        <v-icon size="30" color="white">mdi-cube-outline</v-icon>
      </div>
      <div>
        <p class="brand-name">Box Admin</p>
        <p class="brand-subtitle">Workspace Control</p>
      </div>
    </div>

    <v-list
      v-model:opened="localOpenedGroups"
      nav
      base-color="rgba(226, 232, 240, 0.92)"
      active-color="#ffffff"
      class="px-3 pt-2 sidebar-nav"
    >
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
            :active="securitySectionActive"
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

    </v-list>

    <div class="drawer-footer pa-4">
      <v-sheet class="profile-card pa-3" rounded="lg">
        <v-list-item density="compact" class="px-1">
          <template #prepend>
            <v-avatar size="38" color="primary" class="mr-3">
              <span class="text-white text-body-2 font-weight-bold">{{ userInitials }}</span>
            </v-avatar>
          </template>
          <v-list-item-title class="text-body-2 font-weight-medium">{{ displayUserName }}</v-list-item-title>
          <v-list-item-subtitle class="text-caption">{{ displayUserEmail }}</v-list-item-subtitle>
        </v-list-item>
      </v-sheet>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  openedGroups: string[]
  displayUserName: string
  displayUserEmail: string
  userInitials: string
}>()

const emit = defineEmits<{
  'update:openedGroups': [value: string[]]
}>()

const route = useRoute()

const navItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/' },
  { title: 'Plans', icon: 'mdi-package-variant-closed', to: '/plans' },
  { title: 'Subscriptions', icon: 'mdi-repeat', to: '/subscriptions' },
  { title: 'Shipments', icon: 'mdi-truck-outline', to: '/shipments' },
  { title: 'Payments', icon: 'mdi-cash-multiple', to: '/payments' },
]

const localOpenedGroups = computed({
  get: () => props.openedGroups,
  set: (value: string[]) => emit('update:openedGroups', value),
})

const securitySectionActive = computed(() =>
  route.path === '/users' || route.path.startsWith('/security')
)
</script>

<template>
  <div class="role-permissions-page">
    <v-card class="header-card mb-4">
      <div class="header-content">
        <div>
          <p class="header-eyebrow">Security Center</p>
          <h2 class="header-title">Assign Role Permission</h2>
          <p class="header-subtitle">Configure module-level permissions for each role.</p>
        </div>
        <v-select
          v-model="selectedRole"
          :items="roles"
          label="Role"
          density="compact"
          class="role-select"
        ></v-select>
      </div>
    </v-card>

    <v-card class="permission-card">
      <v-card-text class="pa-5">
        <v-row>
          <v-col v-for="section in permissionSections" :key="section.name" cols="12" md="6">
            <v-sheet class="permission-section pa-4" rounded="md">
              <div class="d-flex align-center justify-space-between mb-3">
                <h3 class="section-title">{{ section.name }}</h3>
                <v-chip color="primary" variant="tonal">{{ section.items.length }} controls</v-chip>
              </div>

              <v-checkbox
                v-for="item in section.items"
                :key="item.key"
                v-model="assignedPermissions"
                :label="item.label"
                :value="item.key"
                color="primary"
                density="compact"
                hide-details
                class="permission-checkbox"
              ></v-checkbox>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>
      <v-card-actions class="px-5 py-4">
        <div class="text-caption text-medium-emphasis">
          {{ assignedPermissions.length }} permission(s) selected for {{ selectedRole }}
        </div>
        <v-spacer></v-spacer>
        <v-btn variant="tonal" color="secondary">Reset</v-btn>
        <v-btn color="primary" prepend-icon="mdi-content-save-outline">Save permissions</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const roles = ['Admin', 'Moderator', 'User']
const selectedRole = ref(
  typeof route.query.role === 'string' && roles.includes(route.query.role) ? route.query.role : 'Moderator'
)

const permissionSections = [
  {
    name: 'User Management',
    items: [
      { key: 'users.view', label: 'View users' },
      { key: 'users.create', label: 'Create users' },
      { key: 'users.edit', label: 'Edit users' },
      { key: 'users.delete', label: 'Delete users' },
    ],
  },
  {
    name: 'Security',
    items: [
      { key: 'security.roles.view', label: 'View roles' },
      { key: 'security.roles.manage', label: 'Manage roles' },
      { key: 'security.permissions.assign', label: 'Assign permissions' },
      { key: 'security.audit.view', label: 'View audit log' },
    ],
  },
  {
    name: 'Orders & Documents',
    items: [
      { key: 'orders.view', label: 'View orders' },
      { key: 'orders.approve', label: 'Approve orders' },
      { key: 'documents.upload', label: 'Upload documents' },
      { key: 'documents.delete', label: 'Delete documents' },
    ],
  },
  {
    name: 'System Settings',
    items: [
      { key: 'settings.view', label: 'View settings' },
      { key: 'settings.edit', label: 'Edit settings' },
      { key: 'notifications.manage', label: 'Manage notifications' },
      { key: 'security.policy.edit', label: 'Edit security policy' },
    ],
  },
]

const assignedPermissions = ref([
  'users.view',
  'users.edit',
  'security.roles.view',
  'security.permissions.assign',
  'orders.view',
  'settings.view',
])
</script>

<style scoped>
.header-card,
.permission-card {
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(7px);
}

.header-content {
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.header-eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.header-title {
  margin: 6px 0 0;
  color: #0f172a;
  font-family: 'Sora', 'Plus Jakarta Sans', sans-serif;
  font-size: 1.35rem;
}

.header-subtitle {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 0.86rem;
}

.role-select {
  min-width: 220px;
  max-width: 260px;
}

.permission-section {
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(248, 250, 252, 0.7);
}

.section-title {
  margin: 0;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 600;
}

.permission-checkbox {
  margin-bottom: 4px;
}
</style>

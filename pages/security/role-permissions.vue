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
          v-model="selectedRoleId"
          :items="roles"
          item-title="name"
          item-value="id"
          label="Role"
          placeholder="Select a role"
          clearable
          density="compact"
          class="role-select"
          hide-details
        />
      </div>
    </v-card>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
      closable
      @click:close="error = ''"
    >
      {{ error }}
    </v-alert>

    <v-alert
      v-if="success"
      type="success"
      variant="tonal"
      class="mb-4"
      closable
      @click:close="success = ''"
    >
      {{ success }}
    </v-alert>

    <v-card class="permission-card">
      <v-progress-linear v-if="loading" indeterminate color="primary" />

      <v-card-text class="pa-5">
        <v-alert
          v-if="!selectedRoleId"
          type="info"
          variant="tonal"
        >
          Select a role to view and update its permissions.
        </v-alert>

        <v-row v-else-if="permissionSections.length > 0">
          <v-col
            v-for="section in permissionSections"
            :key="section.name"
            cols="12"
            md="6"
          >
            <v-sheet class="permission-section pa-4" rounded="md">
              <div class="d-flex align-center justify-space-between mb-3">
                <h3 class="section-title">{{ section.name }}</h3>
                <v-chip color="primary" variant="tonal">
                  {{ section.items.length }} controls
                </v-chip>
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
              />
            </v-sheet>
          </v-col>
        </v-row>

        <v-alert
          v-else
          type="info"
          variant="tonal"
        >
          No permission catalog is available yet.
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-5 py-4">
        <div class="text-caption text-medium-emphasis">
          {{ selectionSummary }}
        </div>
        <v-spacer />
        <v-btn
          variant="tonal"
          color="secondary"
          :disabled="!selectedRoleId"
          @click="resetPermissions"
        >
          Reset
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-content-save-outline"
          :loading="saving"
          :disabled="!selectedRoleId"
          @click="savePermissions"
        >
          Save permissions
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

interface RoleItem {
  id: string
  name: string
}

interface RolesResponse {
  items: RoleItem[]
}

interface PermissionItem {
  id: string
  key: string
  label: string
  group: string
  description?: string
}

interface PermissionCatalogResponse {
  sections: Array<{
    name: string
    items: PermissionItem[]
  }>
}

interface RolePermissionsResponse {
  assigned_permission_keys: string[]
}

const { send } = useAdminApi()

const roles = ref<RoleItem[]>([])
const selectedRoleId = ref('')
const permissionSections = ref<PermissionCatalogResponse['sections']>([])
const assignedPermissions = ref<string[]>([])
const savedPermissions = ref<string[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref('')

const selectedRoleName = computed(
  () => roles.value.find((role) => role.id === selectedRoleId.value)?.name ?? 'this role',
)

const selectionSummary = computed(() => {
  if (!selectedRoleId.value) {
    return 'Select a role to manage permissions'
  }

  return `${assignedPermissions.value.length} permission(s) selected for ${selectedRoleName.value}`
})

const fetchCatalog = async () => {
  const response = await send<PermissionCatalogResponse>('/permissions/catalog')
  permissionSections.value = response.sections
}

const fetchRoles = async () => {
  const response = await send<RolesResponse>('/roles')
  roles.value = response.items
}

const fetchRolePermissions = async () => {
  if (!selectedRoleId.value) {
    assignedPermissions.value = []
    savedPermissions.value = []
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await send<RolePermissionsResponse>(
      `/roles/${selectedRoleId.value}/permissions`,
    )
    assignedPermissions.value = [...response.assigned_permission_keys]
    savedPermissions.value = [...response.assigned_permission_keys]
  } catch (err: any) {
    error.value = err.message || 'Failed to load role permissions'
  } finally {
    loading.value = false
  }
}

const resetPermissions = () => {
  assignedPermissions.value = [...savedPermissions.value]
  success.value = ''
}

const savePermissions = async () => {
  if (!selectedRoleId.value) {
    return
  }

  saving.value = true
  success.value = ''

  try {
    await send(`/roles/${selectedRoleId.value}/permissions`, {
      method: 'POST',
      body: JSON.stringify({
        permission_keys: assignedPermissions.value,
      }),
    })

    savedPermissions.value = [...assignedPermissions.value]
    success.value = `Permissions updated for ${selectedRoleName.value}.`
  } catch (err: any) {
    error.value = err.message || 'Failed to save permissions'
  } finally {
    saving.value = false
  }
}

watch(selectedRoleId, (nextRoleId, previousRoleId) => {
  if (nextRoleId === previousRoleId) {
    return
  }

  success.value = ''
  fetchRolePermissions()
})

onMounted(async () => {
  try {
    await Promise.all([fetchCatalog(), fetchRoles()])
  } catch (err: any) {
    error.value = err.message || 'Failed to load permission management'
  }
})
</script>

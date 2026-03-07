<template>
  <div class="security-roles-page">
    <v-card class="hero-card mb-4">
      <div class="hero-content">
        <div>
          <p class="hero-eyebrow">Security Center</p>
          <h2 class="hero-title">Users Roles</h2>
          <p class="hero-subtitle">
            Define what each role can access and maintain least-privilege control.
          </p>
        </div>
        <v-btn color="primary" prepend-icon="mdi-plus-circle-outline" @click="openCreateDialog">
          Create role
        </v-btn>
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

    <v-card class="roles-table-card">
      <v-progress-linear v-if="loading" indeterminate color="primary" />

      <v-table class="roles-table">
        <thead>
          <tr>
            <th>Role</th>
            <th>Description</th>
            <th>Members</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="role in roles" :key="role.id">
            <td>
              <div class="role-cell">
                <v-avatar size="32" :color="getRoleColor(role.name)" rounded="md">
                  <v-icon size="17" color="white">{{ getRoleIcon(role.name) }}</v-icon>
                </v-avatar>
                <div>
                  <span class="role-name">{{ role.name }}</span>
                  <div class="d-flex ga-2 mt-1">
                    <v-chip
                      v-if="role.is_admin"
                      size="x-small"
                      color="primary"
                      variant="tonal"
                    >
                      Admin access
                    </v-chip>
                    <v-chip
                      v-if="role.is_system"
                      size="x-small"
                      color="secondary"
                      variant="tonal"
                    >
                      System
                    </v-chip>
                  </div>
                </div>
              </div>
            </td>
            <td class="role-description">
              {{ role.description || 'No description provided.' }}
              <div class="mt-2">
                <v-chip size="x-small" color="info" variant="tonal">
                  {{ role.permission_count }} permissions
                </v-chip>
              </div>
            </td>
            <td>
              <v-chip color="info" variant="tonal">{{ role.user_count }} users</v-chip>
            </td>
            <td class="role-updated">{{ formatDate(role.updated_at) }}</td>
            <td>
              <div class="d-flex flex-wrap ga-2">
                <v-btn
                  :to="{
                    path: '/security/role-permissions',
                    query: { roleId: role.id, role: role.name },
                  }"
                  size="small"
                  variant="tonal"
                  color="secondary"
                  prepend-icon="mdi-lock-check-outline"
                >
                  Assign permissions
                </v-btn>
                <v-btn
                  icon="mdi-pencil-outline"
                  size="small"
                  variant="tonal"
                  color="primary"
                  @click="openEditDialog(role)"
                />
                <v-btn
                  icon="mdi-delete-outline"
                  size="small"
                  variant="tonal"
                  color="error"
                  :disabled="role.is_system"
                  @click="removeRole(role)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="!loading && roles.length === 0">
            <td colspan="5" class="text-center py-6 text-medium-emphasis">
              No roles available.
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-dialog v-model="dialogOpen" max-width="640">
      <v-card>
        <v-card-title class="text-h6">
          {{ editingRoleId ? 'Edit Role' : 'Create Role' }}
        </v-card-title>
        <v-card-text class="pt-4">
          <v-alert
            v-if="dialogError"
            type="error"
            variant="tonal"
            class="mb-4"
            closable
            @click:close="dialogError = ''"
          >
            {{ dialogError }}
          </v-alert>

          <v-row>
            <v-col cols="12">
              <v-text-field v-model="form.name" label="Role name" density="comfortable" />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.description"
                label="Description"
                rows="3"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12">
              <v-switch
                v-model="form.is_admin"
                color="primary"
                label="Allow this role to access the admin workspace"
                hide-details
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveRole">
            {{ editingRoleId ? 'Save changes' : 'Create role' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

interface RoleItem {
  id: string
  name: string
  description?: string | null
  is_admin: boolean
  is_system: boolean
  user_count: number
  permission_count: number
  updated_at: string
}

interface RolesResponse {
  items: RoleItem[]
}

const { send } = useAdminApi()

const roles = ref<RoleItem[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const dialogError = ref('')
const dialogOpen = ref(false)
const editingRoleId = ref<string | null>(null)

const form = reactive({
  name: '',
  description: '',
  is_admin: false,
})

const fetchRoles = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await send<RolesResponse>('/roles')
    roles.value = response.items
  } catch (err: any) {
    error.value = err.message || 'Failed to load roles'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.name = ''
  form.description = ''
  form.is_admin = false
}

const openCreateDialog = () => {
  editingRoleId.value = null
  dialogError.value = ''
  resetForm()
  dialogOpen.value = true
}

const openEditDialog = (role: RoleItem) => {
  editingRoleId.value = role.id
  dialogError.value = ''
  form.name = role.name
  form.description = role.description ?? ''
  form.is_admin = role.is_admin
  dialogOpen.value = true
}

const closeDialog = () => {
  dialogOpen.value = false
  editingRoleId.value = null
  dialogError.value = ''
  resetForm()
}

const saveRole = async () => {
  dialogError.value = ''

  if (!form.name.trim()) {
    dialogError.value = 'Role name is required'
    return
  }

  saving.value = true

  try {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      is_admin: form.is_admin,
    }

    if (editingRoleId.value) {
      await send(`/roles/${editingRoleId.value}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    } else {
      await send('/roles', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    }

    closeDialog()
    await fetchRoles()
  } catch (err: any) {
    dialogError.value = err.message || 'Failed to save role'
  } finally {
    saving.value = false
  }
}

const removeRole = async (role: RoleItem) => {
  const confirmed = window.confirm(`Delete the ${role.name} role?`)
  if (!confirmed) {
    return
  }

  try {
    await send(`/roles/${role.id}`, {
      method: 'DELETE',
    })
    await fetchRoles()
  } catch (err: any) {
    error.value = err.message || 'Failed to delete role'
  }
}

const getRoleColor = (roleName: string) => {
  const normalizedRole = roleName.toLowerCase()

  if (normalizedRole.includes('admin')) {
    return 'red-darken-1'
  }

  if (normalizedRole.includes('moderator')) {
    return 'amber-darken-2'
  }

  if (normalizedRole.includes('user') || normalizedRole.includes('subscriber')) {
    return 'blue-darken-1'
  }

  return 'teal-darken-1'
}

const getRoleIcon = (roleName: string) => {
  const normalizedRole = roleName.toLowerCase()

  if (normalizedRole.includes('admin')) {
    return 'mdi-shield-crown-outline'
  }

  if (normalizedRole.includes('moderator')) {
    return 'mdi-shield-account-outline'
  }

  if (normalizedRole.includes('user') || normalizedRole.includes('subscriber')) {
    return 'mdi-account-outline'
  }

  return 'mdi-account-key-outline'
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))

onMounted(() => {
  fetchRoles()
})
</script>

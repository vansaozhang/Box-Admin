<template>
  <div class="users-page">
    <v-card class="toolbar-card mb-4">
      <div class="toolbar-wrapper">
        <div>
          <p class="section-eyebrow">User Directory</p>
          <h2 class="section-title">Manage access and account roles</h2>
        </div>
        <div class="toolbar-actions">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search users, email, role..."
            density="compact"
            class="search-input"
            hide-details
          />
          <v-btn
            variant="tonal"
            color="secondary"
            prepend-icon="mdi-download-outline"
            :loading="exporting"
            @click="exportUsers"
          >
            Export
          </v-btn>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
            Add user
          </v-btn>
        </div>
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

    <div class="users-summary mb-4">
      <v-chip color="primary" variant="tonal">
        Total: {{ summary.total_users }} users
      </v-chip>
      <v-chip color="success" variant="tonal">
        Active: {{ summary.active_users }}
      </v-chip>
      <v-chip color="error" variant="tonal">
        Inactive: {{ summary.inactive_users }}
      </v-chip>
    </div>

    <v-card class="table-card">
      <v-progress-linear v-if="loading" indeterminate color="primary" />

      <v-table class="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>
              <div class="name-cell">
                <v-avatar size="34" :color="getAvatarColor(user.role)" rounded="md">
                  <span class="avatar-initials">{{ getInitials(user.name) }}</span>
                </v-avatar>
                <div>
                  <p class="user-name">{{ user.name }}</p>
                  <p class="user-meta">
                    {{ user.username || user.role }} account
                  </p>
                </div>
              </div>
            </td>
            <td>{{ user.email }}</td>
            <td>
              <v-chip :color="getRoleColor(user.role)" variant="tonal" size="small">
                {{ user.role }}
              </v-chip>
            </td>
            <td>
              <v-chip
                :color="user.status === 'Active' ? 'success' : 'error'"
                variant="tonal"
                size="small"
              >
                {{ user.status }}
              </v-chip>
            </td>
            <td>
              <div class="action-group">
                <v-btn
                  icon="mdi-pencil-outline"
                  size="small"
                  variant="tonal"
                  color="secondary"
                  @click="openEditDialog(user)"
                />
                <v-btn
                  icon="mdi-delete-outline"
                  size="small"
                  variant="tonal"
                  color="error"
                  @click="removeUser(user)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="!loading && users.length === 0">
            <td colspan="5" class="text-center py-6 text-medium-emphasis">
              No users found.
            </td>
          </tr>
        </tbody>
      </v-table>

      <v-divider />

      <div class="table-footer d-flex align-center justify-space-between flex-wrap ga-3 pa-4">
        <span class="footer-caption">
          Showing {{ pageStart }}-{{ pageEnd }} of {{ totalUsers }}
        </span>
        <v-pagination
          v-model="page"
          :length="pageCount"
          :total-visible="5"
          density="compact"
        />
      </div>
    </v-card>

    <v-dialog v-model="dialogOpen" max-width="680">
      <v-card>
        <v-card-title class="text-h6">
          {{ editingUserId ? 'Edit User' : 'Add User' }}
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
            <v-col cols="12" md="6">
              <v-text-field v-model="form.name" label="Full name" density="comfortable" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.username" label="Username" density="comfortable" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.email" label="Email" density="comfortable" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.phone_number"
                label="Phone number"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.role"
                :items="roleOptions"
                label="Role"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.status"
                :items="statusOptions"
                label="Status"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.password"
                :label="editingUserId ? 'New password (leave blank to keep current)' : 'Password'"
                type="password"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveUser">
            {{ editingUserId ? 'Save changes' : 'Create user' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

interface UserItem {
  id: string
  name: string
  username?: string | null
  email: string
  phone_number?: string | null
  role: string
  status: 'Active' | 'Inactive'
  created_at?: string
  updated_at?: string
}

interface UsersResponse {
  items: UserItem[]
  meta: {
    page: number
    limit: number
    total: number
    total_pages: number
    summary: {
      total_users: number
      active_users: number
      inactive_users: number
    }
  }
  filters: {
    roles: string[]
  }
}

interface RolesResponse {
  items: Array<{
    id: string
    name: string
  }>
}

const { send } = useAdminApi()

const search = ref('')
const page = ref(1)
const users = ref<UserItem[]>([])
const roleOptions = ref<string[]>([])
const loading = ref(false)
const saving = ref(false)
const exporting = ref(false)
const error = ref('')
const dialogError = ref('')
const dialogOpen = ref(false)
const editingUserId = ref<string | null>(null)
const pageSize = 5
const statusOptions = ['Active', 'Inactive'] as const
const summary = ref({
  total_users: 0,
  active_users: 0,
  inactive_users: 0,
})
const totalUsers = ref(0)
const totalPages = ref(1)

const form = reactive({
  name: '',
  username: '',
  email: '',
  phone_number: '',
  password: '',
  role: 'Subscriber',
  status: 'Active' as 'Active' | 'Inactive',
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const pageStart = computed(() =>
  users.value.length === 0 ? 0 : (page.value - 1) * pageSize + 1,
)

const pageEnd = computed(() =>
  Math.min(page.value * pageSize, totalUsers.value),
)

const pageCount = computed(() => Math.max(1, totalPages.value))

const resetForm = () => {
  form.name = ''
  form.username = ''
  form.email = ''
  form.phone_number = ''
  form.password = ''
  form.role = roleOptions.value[0] ?? 'Subscriber'
  form.status = 'Active'
}

const buildQueryString = (overrides: Record<string, string> = {}) => {
  const params = new URLSearchParams({
    page: String(page.value),
    limit: String(pageSize),
  })

  if (search.value.trim()) {
    params.set('search', search.value.trim())
  }

  Object.entries(overrides).forEach(([key, value]) => {
    params.set(key, value)
  })

  return params.toString()
}

const fetchRoles = async () => {
  const response = await send<RolesResponse>('/roles')
  roleOptions.value = response.items.map((role) => role.name)

  if (!roleOptions.value.includes(form.role)) {
    form.role = roleOptions.value[0] ?? 'Subscriber'
  }
}

const fetchUsers = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await send<UsersResponse>(`/users?${buildQueryString()}`)
    users.value = response.items
    totalUsers.value = response.meta.total
    totalPages.value = response.meta.total_pages
    summary.value = response.meta.summary

    if (response.filters.roles.length > 0) {
      roleOptions.value = response.filters.roles
    }

    if (page.value > response.meta.total_pages && response.meta.total_pages > 0) {
      page.value = response.meta.total_pages
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load users'
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  editingUserId.value = null
  dialogError.value = ''
  resetForm()
  dialogOpen.value = true
}

const openEditDialog = (user: UserItem) => {
  editingUserId.value = user.id
  dialogError.value = ''
  form.name = user.name
  form.username = user.username ?? ''
  form.email = user.email
  form.phone_number = user.phone_number ?? ''
  form.password = ''
  form.role = user.role
  form.status = user.status
  dialogOpen.value = true
}

const closeDialog = () => {
  dialogOpen.value = false
  editingUserId.value = null
  dialogError.value = ''
  resetForm()
}

const saveUser = async () => {
  dialogError.value = ''

  if (!form.name.trim() || !form.email.trim() || !form.role) {
    dialogError.value = 'Name, email, and role are required'
    return
  }

  if (!editingUserId.value && !form.password.trim()) {
    dialogError.value = 'Password is required when creating a user'
    return
  }

  saving.value = true

  try {
    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      username: form.username.trim() || undefined,
      email: form.email.trim(),
      phone_number: form.phone_number.trim() || undefined,
      role: form.role,
      status: form.status,
    }

    if (form.password.trim()) {
      payload.password = form.password.trim()
    }

    if (editingUserId.value) {
      await send(`/users/${editingUserId.value}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    } else {
      await send('/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    }

    closeDialog()
    await Promise.all([fetchRoles(), fetchUsers()])
  } catch (err: any) {
    dialogError.value = err.message || 'Failed to save user'
  } finally {
    saving.value = false
  }
}

const removeUser = async (user: UserItem) => {
  const confirmed = window.confirm(`Delete ${user.name}? This cannot be undone.`)
  if (!confirmed) {
    return
  }

  try {
    await send(`/users/${user.id}`, {
      method: 'DELETE',
    })

    if (users.value.length === 1 && page.value > 1) {
      page.value -= 1
    }

    await fetchUsers()
  } catch (err: any) {
    error.value = err.message || 'Failed to delete user'
  }
}

const exportUsers = async () => {
  exporting.value = true

  try {
    const csv = await send<string>(`/users/export?${buildQueryString({ page: '1', limit: '1000' })}`, {}, 'text')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'users-export.csv'
    link.click()

    URL.revokeObjectURL(url)
  } catch (err: any) {
    error.value = err.message || 'Failed to export users'
  } finally {
    exporting.value = false
  }
}

const getRoleColor = (role: string) => {
  const normalizedRole = role.toLowerCase()

  if (normalizedRole.includes('admin')) {
    return 'error'
  }

  if (normalizedRole.includes('moderator')) {
    return 'warning'
  }

  if (normalizedRole.includes('user') || normalizedRole.includes('subscriber')) {
    return 'info'
  }

  return 'secondary'
}

const getAvatarColor = (role: string) => {
  const color = getRoleColor(role)

  if (color === 'error') {
    return 'red-lighten-2'
  }

  if (color === 'warning') {
    return 'amber-lighten-2'
  }

  if (color === 'info') {
    return 'blue-lighten-2'
  }

  return 'grey-lighten-1'
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

watch(page, () => {
  fetchUsers()
})

watch(search, () => {
  page.value = 1

  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    fetchUsers()
  }, 250)
})

onMounted(async () => {
  await Promise.all([fetchRoles(), fetchUsers()])
})
</script>

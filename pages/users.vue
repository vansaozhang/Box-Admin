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
          ></v-text-field>
          <v-btn variant="tonal" color="secondary" prepend-icon="mdi-download-outline">Export</v-btn>
          <v-btn color="primary" prepend-icon="mdi-plus">Add user</v-btn>
        </div>
      </div>
    </v-card>

    <div class="users-summary mb-4">
      <v-chip color="primary" variant="tonal">Total: {{ users.length }} users</v-chip>
      <v-chip color="success" variant="tonal">Active: {{ activeCount }}</v-chip>
      <v-chip color="error" variant="tonal">Inactive: {{ inactiveCount }}</v-chip>
    </div>

    <v-card class="table-card">
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
            <tr v-for="user in paginatedUsers" :key="user.id">
              <td>
                <div class="name-cell">
                  <v-avatar size="34" :color="getAvatarColor(user.role)" rounded="md">
                    <span class="avatar-initials">{{ getInitials(user.name) }}</span>
                  </v-avatar>
                  <div>
                    <p class="user-name">{{ user.name }}</p>
                    <p class="user-meta">{{ user.role }} account</p>
                  </div>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <v-chip :class="['role-chip', `role-${user.role.toLowerCase()}`]">
                  {{ user.role }}
                </v-chip>
              </td>
              <td>
                <v-chip :class="['status-chip', user.status === 'Active' ? 'status-active' : 'status-inactive']">
                  {{ user.status }}
                </v-chip>
              </td>
              <td>
                <div class="action-group">
                  <v-btn icon="mdi-pencil-outline" size="small" variant="tonal" color="secondary"></v-btn>
                  <v-btn icon="mdi-delete-outline" size="small" variant="tonal" color="error"></v-btn>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedUsers.length === 0">
              <td colspan="5" class="text-center py-6 text-medium-emphasis">No users found.</td>
            </tr>
          </tbody>
        </v-table>
      <v-divider></v-divider>
      <div class="table-footer d-flex align-center justify-space-between flex-wrap ga-3 pa-4">
        <span class="footer-caption">
          Showing {{ pageStart }}-{{ pageEnd }} of {{ filteredUsers.length }}
        </span>
        <v-pagination
          v-model="page"
          :length="pageCount"
          :total-visible="5"
          density="compact"
        ></v-pagination>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const search = ref('')
const page = ref(1)
const itemsPerPage = 5

const users = ref([
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'Moderator', status: 'Active' },
  { id: 4, name: 'David Brown', email: 'david@example.com', role: 'User', status: 'Inactive' },
  { id: 5, name: 'Emma Wilson', email: 'emma@example.com', role: 'User', status: 'Active' },
  { id: 6, name: 'Frank Lee', email: 'frank@example.com', role: 'Moderator', status: 'Active' },
  { id: 7, name: 'Grace Kim', email: 'grace@example.com', role: 'User', status: 'Inactive' },
  { id: 8, name: 'Henry Clark', email: 'henry@example.com', role: 'Admin', status: 'Active' },
  { id: 9, name: 'Ivy Scott', email: 'ivy@example.com', role: 'User', status: 'Active' },
  { id: 10, name: 'Jack Turner', email: 'jack@example.com', role: 'Moderator', status: 'Active' },
  { id: 11, name: 'Kelly Young', email: 'kelly@example.com', role: 'User', status: 'Active' },
  { id: 12, name: 'Liam Hall', email: 'liam@example.com', role: 'User', status: 'Inactive' },
])

const activeCount = computed(
  () => users.value.filter((user) => user.status === 'Active').length
)

const inactiveCount = computed(
  () => users.value.filter((user) => user.status !== 'Active').length
)

const filteredUsers = computed(() => {
  const query = search.value.trim().toLowerCase()

  if (!query) {
    return users.value
  }

  return users.value.filter((user) =>
    [user.name, user.email, user.role, user.status].some((field) =>
      field.toLowerCase().includes(query)
    )
  )
})

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredUsers.value.length / itemsPerPage))
)

const paginatedUsers = computed(() => {
  const startIndex = (page.value - 1) * itemsPerPage
  return filteredUsers.value.slice(startIndex, startIndex + itemsPerPage)
})

const pageStart = computed(() =>
  filteredUsers.value.length === 0 ? 0 : (page.value - 1) * itemsPerPage + 1
)

const pageEnd = computed(() =>
  Math.min(page.value * itemsPerPage, filteredUsers.value.length)
)

watch(search, () => {
  page.value = 1
})

watch(filteredUsers, () => {
  if (page.value > pageCount.value) {
    page.value = pageCount.value
  }
})

function getAvatarColor(role: string) {
  const colors: Record<string, string> = {
    Admin: 'red-lighten-2',
    Moderator: 'amber-lighten-2',
    User: 'blue-lighten-2',
  }
  return colors[role] || 'grey-lighten-1'
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
</script>

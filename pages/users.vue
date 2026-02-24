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

<style scoped>
.toolbar-card,
.table-card {
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(7px);
}

.toolbar-wrapper {
  padding: 18px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.section-eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-title {
  margin: 8px 0 0;
  color: #0f172a;
  font-family: 'Sora', 'Plus Jakarta Sans', sans-serif;
  font-size: clamp(1.15rem, 2.2vw, 1.4rem);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  min-width: min(100%, 340px);
}

.users-summary {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.users-table :deep(thead th) {
  color: #64748b;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 600;
  background: rgba(248, 250, 252, 0.9);
}

.users-table :deep(tbody tr) {
  transition: background-color 0.2s ease;
}

.users-table :deep(tbody tr:hover) {
  background: rgba(241, 245, 249, 0.75);
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-initials {
  color: #0f172a;
  font-size: 0.76rem;
  font-weight: 700;
}

.user-name {
  margin: 0;
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 600;
}

.user-meta {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 0.76rem;
}

.role-chip,
.status-chip {
  border: 1px solid transparent;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.role-admin {
  color: #be123c;
  background: #ffe4e6;
  border-color: #fecdd3;
}

.role-moderator {
  color: #b45309;
  background: #fef3c7;
  border-color: #fde68a;
}

.role-user {
  color: #1d4ed8;
  background: #dbeafe;
  border-color: #bfdbfe;
}

.status-active {
  color: #166534;
  background: #dcfce7;
  border-color: #bbf7d0;
}

.status-inactive {
  color: #991b1b;
  background: #fee2e2;
  border-color: #fecaca;
}

.action-group {
  display: flex;
  gap: 6px;
}

.table-footer {
  border-top: 1px solid rgba(148, 163, 184, 0.16);
}

.footer-caption {
  font-size: 0.8rem;
  color: #64748b;
}

@media (max-width: 959px) {
  .toolbar-wrapper {
    padding: 14px;
  }

  .toolbar-actions {
    width: 100%;
  }

  .search-input {
    flex: 1 1 100%;
    min-width: 100%;
  }
}
</style>

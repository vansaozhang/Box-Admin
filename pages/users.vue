<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        placeholder="Search users..."
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 350px;"
      ></v-text-field>
      <v-btn color="primary" prepend-icon="mdi-plus" elevation="0">Add User</v-btn>
    </div>

    <v-card elevation="1">
      <v-table>
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
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td><v-chip :color="getRoleColor(user.role)" size="small">{{ user.role }}</v-chip></td>
              <td><v-chip :color="user.status === 'Active' ? 'success' : 'error'" size="small">{{ user.status }}</v-chip></td>
              <td>
                <v-btn icon="mdi-pencil" size="small" variant="text"></v-btn>
                <v-btn icon="mdi-delete" size="small" variant="text" color="error"></v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const search = ref('')

const users = ref([
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'Moderator', status: 'Active' },
  { id: 4, name: 'David Brown', email: 'david@example.com', role: 'User', status: 'Inactive' },
])

function getRoleColor(role: string) {
  const colors: Record<string, string> = {
    Admin: 'error',
    Moderator: 'warning',
    User: 'info',
  }
  return colors[role] || 'grey'
}
</script>

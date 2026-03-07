<template>
  <div class="security-roles-page">
    <v-card class="hero-card mb-4">
      <div class="hero-content">
        <div>
          <p class="hero-eyebrow">Security Center</p>
          <h2 class="hero-title">Users Roles</h2>
          <p class="hero-subtitle">Define what each role can access and maintain least-privilege control.</p>
        </div>
        <v-btn color="primary" prepend-icon="mdi-plus-circle-outline">Create role</v-btn>
      </div>
    </v-card>

    <v-card class="roles-table-card">
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
          <tr v-for="role in roles" :key="role.name">
            <td>
              <div class="role-cell">
                <v-avatar size="32" :color="role.color" rounded="md">
                  <v-icon size="17" color="white">{{ role.icon }}</v-icon>
                </v-avatar>
                <span class="role-name">{{ role.name }}</span>
              </div>
            </td>
            <td class="role-description">{{ role.description }}</td>
            <td>
              <v-chip color="info" variant="tonal">{{ role.members }} users</v-chip>
            </td>
            <td class="role-updated">{{ role.updatedAt }}</td>
            <td>
              <v-btn
                :to="{ path: '/security/role-permissions', query: { role: role.name } }"
                size="small"
                variant="tonal"
                color="secondary"
                prepend-icon="mdi-lock-check-outline"
              >
                Assign permissions
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const roles = [
  {
    name: 'Admin',
    description: 'Full platform administration and configuration',
    members: 2,
    updatedAt: '2 days ago',
    color: 'red-darken-1',
    icon: 'mdi-shield-crown-outline',
  },
  {
    name: 'Moderator',
    description: 'User supervision, approvals, and content governance',
    members: 6,
    updatedAt: '5 days ago',
    color: 'amber-darken-2',
    icon: 'mdi-shield-account-outline',
  },
  {
    name: 'User',
    description: 'Standard workspace access and self-service actions',
    members: 24,
    updatedAt: '1 day ago',
    color: 'blue-darken-1',
    icon: 'mdi-account-outline',
  },
]
</script>

<template>
  <div class="settings-page">
    <v-card class="intro-card mb-6">
      <div class="intro-content">
        <div>
          <p class="intro-eyebrow">Workspace Preferences</p>
          <h2 class="intro-title">Customize how your platform looks and notifies you.</h2>
          <p class="intro-subtitle">Changes are saved securely and applied in real time across your admin portal.</p>
        </div>
        <v-btn color="primary" prepend-icon="mdi-content-save-outline">Save all changes</v-btn>
      </div>
    </v-card>

    <v-row class="settings-grid" align="start">
      <v-col cols="12" md="7">
        <v-card class="settings-card general-card">
          <v-card-item>
            <template #prepend>
              <v-avatar color="teal-lighten-5" size="40" rounded="md" class="mr-3">
                <v-icon color="teal-darken-1">mdi-tune-variant</v-icon>
              </v-avatar>
            </template>
            <v-card-title>General Settings</v-card-title>
            <v-card-subtitle>Branding and regional defaults</v-card-subtitle>
          </v-card-item>

          <v-card-text class="pt-3 pb-4">
            <v-text-field
              v-model="general.siteName"
              label="Workspace name"
              prepend-inner-icon="mdi-domain"
              class="mb-2"
            ></v-text-field>

            <v-text-field
              v-model="general.siteUrl"
              label="Workspace URL"
              prepend-inner-icon="mdi-link-variant"
              class="mb-2"
            ></v-text-field>

            <v-row class="mt-n1">
              <v-col cols="12" sm="6">
                <v-select
                  v-model="general.language"
                  :items="['English', 'Spanish', 'French']"
                  label="Language"
                  prepend-inner-icon="mdi-translate"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="general.timezone"
                  :items="['UTC+00:00', 'UTC+07:00', 'UTC-05:00']"
                  label="Timezone"
                  prepend-inner-icon="mdi-clock-outline"
                ></v-select>
              </v-col>
            </v-row>

            <v-textarea
              v-model="general.description"
              label="Workspace description"
              prepend-inner-icon="mdi-text-box-outline"
              rows="3"
            ></v-textarea>
          </v-card-text>

          <v-card-actions class="px-6 pb-5 pt-0">
            <v-spacer></v-spacer>
            <v-btn variant="tonal" color="secondary">Reset</v-btn>
            <v-btn color="primary">Save changes</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card class="settings-card side-card mb-4">
          <v-card-item>
            <template #prepend>
              <v-avatar color="blue-lighten-5" size="40" rounded="md" class="mr-3">
                <v-icon color="blue-darken-1">mdi-bell-ring-outline</v-icon>
              </v-avatar>
            </template>
            <v-card-title>Notification Settings</v-card-title>
            <v-card-subtitle>Choose how updates are delivered</v-card-subtitle>
          </v-card-item>

          <v-card-text>
            <div class="switch-row">
              <div>
                <p class="switch-title">Email notifications</p>
                <p class="switch-subtitle">Weekly summaries and alerts</p>
              </div>
              <v-switch v-model="notifications.email" color="primary" hide-details></v-switch>
            </div>
            <div class="switch-row">
              <div>
                <p class="switch-title">Push notifications</p>
                <p class="switch-subtitle">Instant updates on approvals</p>
              </div>
              <v-switch v-model="notifications.push" color="primary" hide-details></v-switch>
            </div>
            <div class="switch-row">
              <div>
                <p class="switch-title">SMS notifications</p>
                <p class="switch-subtitle">Critical incidents only</p>
              </div>
              <v-switch v-model="notifications.sms" color="primary" hide-details></v-switch>
            </div>
          </v-card-text>

          <v-card-actions class="px-6 pb-6 pt-0">
            <v-spacer></v-spacer>
            <v-btn color="primary">Save preferences</v-btn>
          </v-card-actions>
        </v-card>

        <v-card class="settings-card side-card">
          <v-card-item>
            <template #prepend>
              <v-avatar color="amber-lighten-5" size="40" rounded="md" class="mr-3">
                <v-icon color="amber-darken-2">mdi-shield-check-outline</v-icon>
              </v-avatar>
            </template>
            <v-card-title>Security Snapshot</v-card-title>
            <v-card-subtitle>Current protection status</v-card-subtitle>
          </v-card-item>

          <v-card-text class="pb-6">
            <v-list density="compact" class="security-list">
              <v-list-item title="Two-factor authentication" subtitle="Enabled for all admins">
                <template #append>
                  <v-chip color="success" variant="tonal">Enabled</v-chip>
                </template>
              </v-list-item>
              <v-list-item title="Password policy" subtitle="Minimum 12 characters">
                <template #append>
                  <v-chip color="success" variant="tonal">Strong</v-chip>
                </template>
              </v-list-item>
              <v-list-item title="Session timeout" subtitle="Automatic logout after 30 minutes">
                <template #append>
                  <v-chip color="info" variant="tonal">30 min</v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const general = ref({
  siteName: 'Box Admin Workspace',
  siteUrl: 'https://admin.box.com',
  language: 'English',
  timezone: 'UTC+07:00',
  description: 'Centralized dashboard for user, order, and document operations.',
})

const notifications = ref({
  email: true,
  push: true,
  sms: false,
})
</script>

<style scoped>
.intro-card,
.settings-card {
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(7px);
}

.settings-grid {
  row-gap: 2px;
}

.intro-content {
  padding: 22px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.intro-eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.intro-title {
  margin: 9px 0 0;
  color: #0f172a;
  font-family: 'Sora', 'Plus Jakarta Sans', sans-serif;
  font-size: clamp(1.15rem, 2.2vw, 1.38rem);
  max-width: 34ch;
}

.intro-subtitle {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 0.88rem;
}

.general-card :deep(.v-card-item),
.side-card :deep(.v-card-item) {
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.general-card :deep(.v-field),
.general-card :deep(.v-input__details) {
  font-size: 0.9rem;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.switch-row:last-child {
  border-bottom: 0;
}

.switch-title {
  margin: 0;
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 600;
}

.switch-subtitle {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 0.8rem;
}

.security-list :deep(.v-list-item) {
  padding-left: 0;
  padding-right: 0;
}

@media (max-width: 960px) {
  .intro-content {
    padding: 16px 16px;
  }
}
</style>

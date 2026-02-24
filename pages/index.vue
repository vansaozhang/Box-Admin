<template>
  <div class="dashboard-page">
    <v-card class="hero-card mb-6">
      <v-row align="center" no-gutters>
        <v-col cols="12" md="8" class="pa-6 pa-md-8">
          <p class="hero-eyebrow">Operations Overview</p>
          <h2 class="hero-title">Everything is running smoothly today.</h2>
          <p class="hero-subtitle">
            Track workspace health, user growth, and revenue in one place with actionable signals.
          </p>
          <div class="d-flex flex-wrap ga-3 mt-5">
            <v-btn color="primary" prepend-icon="mdi-plus-circle-outline">Create workspace</v-btn>
            <v-btn variant="tonal" color="secondary" prepend-icon="mdi-chart-box-outline">Open reports</v-btn>
          </div>
        </v-col>

        <v-col cols="12" md="4" class="pa-6 pa-md-8 pt-0 pt-md-8">
          <v-sheet rounded="lg" class="uptime-panel pa-5">
            <p class="uptime-label">System uptime</p>
            <h3 class="uptime-value">99.94%</h3>
            <v-progress-linear
              color="success"
              bg-color="grey-lighten-3"
              :model-value="99.94"
              rounded
              height="9"
              class="mt-4"
            ></v-progress-linear>
            <p class="uptime-note mt-3">No incidents in the last 21 days.</p>
          </v-sheet>
        </v-col>
      </v-row>
    </v-card>

    <v-row>
      <v-col v-for="stat in stats" :key="stat.label" cols="12" sm="6" lg="3">
        <v-card class="metric-card h-100">
          <v-card-text class="pa-5">
            <div class="d-flex justify-space-between align-start mb-4">
              <v-avatar :color="stat.iconBg" size="42" rounded="md">
                <v-icon :icon="stat.icon" size="20"></v-icon>
              </v-avatar>
              <v-chip :color="stat.trendColor" variant="tonal" label>{{ stat.trend }}</v-chip>
            </div>

            <p class="metric-label">{{ stat.label }}</p>
            <h3 class="metric-value">{{ stat.value }}</h3>
            <p class="metric-note">{{ stat.note }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="7">
        <v-card class="panel-card h-100">
          <v-card-item>
            <v-card-title>Recent Activity</v-card-title>
            <v-card-subtitle>Latest actions across your workspace</v-card-subtitle>
          </v-card-item>
          <v-divider></v-divider>
          <v-list class="activity-list py-1">
            <v-list-item v-for="item in activities" :key="item.title" class="activity-item">
              <template #prepend>
                <v-avatar :color="item.iconBg" size="36" rounded="md" class="mr-3">
                  <v-icon :icon="item.icon" size="18"></v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="activity-title">{{ item.title }}</v-list-item-title>
              <v-list-item-subtitle class="activity-subtitle">{{ item.subtitle }}</v-list-item-subtitle>
              <template #append>
                <span class="activity-time">{{ item.time }}</span>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card class="panel-card h-100">
          <v-card-item>
            <v-card-title>Team Capacity</v-card-title>
            <v-card-subtitle>Current sprint workload by function</v-card-subtitle>
          </v-card-item>
          <v-card-text class="pt-2">
            <div v-for="item in capacityItems" :key="item.label" class="capacity-row">
              <div class="d-flex justify-space-between mb-2">
                <span class="capacity-label">{{ item.label }}</span>
                <span class="capacity-value">{{ item.value }}%</span>
              </div>
              <v-progress-linear
                :model-value="item.value"
                :color="item.color"
                bg-color="grey-lighten-4"
                rounded
                height="8"
              ></v-progress-linear>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
const stats = [
  {
    label: 'Total Users',
    value: '2,543',
    trend: '+8.2%',
    trendColor: 'success',
    note: 'Compared to last month',
    icon: 'mdi-account-group-outline',
    iconBg: 'teal-lighten-4',
  },
  {
    label: 'Revenue',
    value: '$45.2K',
    trend: '+11.4%',
    trendColor: 'success',
    note: 'Monthly recurring revenue',
    icon: 'mdi-currency-usd',
    iconBg: 'blue-lighten-4',
  },
  {
    label: 'Orders',
    value: '1,234',
    trend: '+3.7%',
    trendColor: 'info',
    note: 'Processed in the last 30 days',
    icon: 'mdi-cart-outline',
    iconBg: 'amber-lighten-4',
  },
  {
    label: 'Documents',
    value: '567',
    trend: '+2.1%',
    trendColor: 'warning',
    note: 'Uploaded this week',
    icon: 'mdi-file-document-outline',
    iconBg: 'cyan-lighten-4',
  },
]

const activities = [
  {
    title: 'New user registered',
    subtitle: 'Anna Parker joined the Billing team',
    time: '5m ago',
    icon: 'mdi-account-plus-outline',
    iconBg: 'green-lighten-5',
  },
  {
    title: 'Order approved',
    subtitle: 'Order #48392 approved by finance',
    time: '16m ago',
    icon: 'mdi-check-decagram-outline',
    iconBg: 'blue-lighten-5',
  },
  {
    title: 'Document uploaded',
    subtitle: 'Q1-forecast.pdf was added to Reports',
    time: '1h ago',
    icon: 'mdi-file-upload-outline',
    iconBg: 'amber-lighten-5',
  },
  {
    title: 'Permission updated',
    subtitle: 'Moderator role granted to Carol White',
    time: '2h ago',
    icon: 'mdi-shield-account-outline',
    iconBg: 'purple-lighten-5',
  },
]

const capacityItems = [
  { label: 'Support', value: 72, color: 'teal' },
  { label: 'Engineering', value: 86, color: 'indigo' },
  { label: 'Operations', value: 64, color: 'cyan' },
  { label: 'Marketing', value: 52, color: 'amber' },
]
</script>

<style scoped>
.hero-card {
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(15, 118, 110, 0.94), rgba(29, 78, 216, 0.92)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0));
  color: #f8fafc;
  box-shadow: 0 20px 45px rgba(15, 118, 110, 0.22);
}

.hero-eyebrow {
  margin: 0;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(241, 245, 249, 0.8);
}

.hero-title {
  margin: 12px 0 0;
  font-family: 'Sora', 'Plus Jakarta Sans', sans-serif;
  font-size: clamp(1.55rem, 2.3vw, 2.1rem);
  line-height: 1.24;
  max-width: 18ch;
}

.hero-subtitle {
  margin: 12px 0 0;
  max-width: 52ch;
  color: rgba(241, 245, 249, 0.88);
  font-size: 0.95rem;
}

.uptime-panel {
  border: 1px solid rgba(241, 245, 249, 0.28);
  background: rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(6px);
}

.uptime-label {
  margin: 0;
  color: rgba(226, 232, 240, 0.9);
  font-size: 0.82rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.uptime-value {
  margin: 8px 0 0;
  font-size: 2rem;
  line-height: 1;
  font-family: 'Sora', 'Plus Jakarta Sans', sans-serif;
}

.uptime-note {
  margin: 0;
  color: rgba(226, 232, 240, 0.82);
  font-size: 0.82rem;
}

.metric-card,
.panel-card {
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(7px);
  transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease;
}

.metric-card:hover,
.panel-card:hover {
  transform: translateY(-3px);
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 12px 30px rgba(148, 163, 184, 0.2);
}

.metric-label {
  margin: 0;
  color: #64748b;
  font-size: 0.83rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.metric-value {
  margin: 8px 0 0;
  color: #0f172a;
  font-family: 'Sora', 'Plus Jakarta Sans', sans-serif;
  font-size: 1.55rem;
}

.metric-note {
  margin: 10px 0 0;
  color: #64748b;
  font-size: 0.83rem;
}

.activity-item {
  min-height: 70px;
}

.activity-title {
  color: #0f172a;
  font-weight: 600;
  font-size: 0.92rem;
}

.activity-subtitle {
  color: #64748b;
  font-size: 0.82rem;
}

.activity-time {
  color: #64748b;
  font-size: 0.76rem;
  white-space: nowrap;
}

.capacity-row {
  margin-bottom: 20px;
}

.capacity-row:last-child {
  margin-bottom: 6px;
}

.capacity-label {
  color: #334155;
  font-size: 0.86rem;
}

.capacity-value {
  color: #0f172a;
  font-size: 0.82rem;
  font-weight: 600;
}
</style>

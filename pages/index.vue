<template>
  <div class="dashboard-page">
    <v-card class="hero-card mb-6">
      <v-row align="center" no-gutters>
        <v-col cols="12" md="8" class="pa-6 pa-md-8">
          <p class="hero-eyebrow">Admin Overview</p>
          <h2 class="hero-title">Run the box subscription operation from one workspace.</h2>
          <p class="hero-subtitle">
            Review subscriber growth, shipment pressure, revenue, and recent platform activity in real time.
          </p>
          <div class="d-flex flex-wrap ga-3 mt-5">
            <v-btn color="primary" prepend-icon="mdi-repeat" to="/subscriptions">
              Open subscriptions
            </v-btn>
            <v-btn variant="tonal" color="secondary" prepend-icon="mdi-truck-outline" to="/shipments">
              Review shipments
            </v-btn>
            <v-btn variant="text" color="secondary" prepend-icon="mdi-refresh" :loading="loading" @click="fetchOverview">
              Refresh
            </v-btn>
          </div>
        </v-col>

        <v-col cols="12" md="4" class="pa-6 pa-md-8 pt-0 pt-md-8">
          <v-sheet rounded="lg" class="uptime-panel pa-5">
            <p class="uptime-label">30-day revenue</p>
            <h3 class="uptime-value">{{ formatCurrency(summary.monthly_revenue) }}</h3>
            <v-progress-linear
              color="success"
              bg-color="grey-lighten-3"
              :model-value="revenueProgress"
              rounded
              height="9"
              class="mt-4"
            ></v-progress-linear>
            <p class="uptime-note mt-3">
              {{ summary.active_subscriptions }} active subscriptions across {{ summary.plan_variants }} plan variants.
            </p>
          </v-sheet>
        </v-col>
      </v-row>
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

    <v-row>
      <v-col v-for="stat in stats" :key="stat.label" cols="12" sm="6" lg="3">
        <v-card class="metric-card h-100">
          <v-card-text class="pa-5">
            <div class="d-flex justify-space-between align-start mb-4">
              <v-avatar :color="stat.iconBg" size="42" rounded="md">
                <v-icon :icon="stat.icon" size="20"></v-icon>
              </v-avatar>
              <v-chip :color="stat.chipColor" variant="tonal" label>{{ stat.chipText }}</v-chip>
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
            <v-card-subtitle>Latest movement across subscribers, payments, shipments, and accounts</v-card-subtitle>
          </v-card-item>
          <v-divider></v-divider>

          <v-progress-linear v-if="loading" indeterminate color="primary" />

          <v-list class="activity-list py-1">
            <v-list-item v-for="item in recentActivity" :key="`${item.type}-${item.happened_at}-${item.title}`" class="activity-item">
              <template #prepend>
                <v-avatar :color="getActivityColor(item.type)" size="36" rounded="md" class="mr-3">
                  <v-icon :icon="getActivityIcon(item.type)" size="18"></v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="activity-title">{{ item.title }}</v-list-item-title>
              <v-list-item-subtitle class="activity-subtitle">
                {{ item.subtitle }}
              </v-list-item-subtitle>
              <template #append>
                <div class="d-flex flex-column align-end ga-1">
                  <v-chip
                    v-if="item.status"
                    size="x-small"
                    :color="getStatusColor(item.status)"
                    variant="tonal"
                  >
                    {{ item.status }}
                  </v-chip>
                  <span class="activity-time">{{ formatDateTime(item.happened_at) }}</span>
                </div>
              </template>
            </v-list-item>
            <v-list-item v-if="!loading && recentActivity.length === 0">
              <v-list-item-title class="text-medium-emphasis">
                No recent activity yet.
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card class="panel-card mb-4">
          <v-card-item>
            <v-card-title>Operational Health</v-card-title>
            <v-card-subtitle>Counts by lifecycle state</v-card-subtitle>
          </v-card-item>
          <v-card-text class="pt-2">
            <div v-for="section in statusSections" :key="section.title" class="status-block">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="capacity-label">{{ section.title }}</span>
                <v-chip size="x-small" variant="tonal" color="secondary">
                  {{ section.items.reduce((sum, item) => sum + item.count, 0) }} total
                </v-chip>
              </div>
              <div v-if="section.items.length > 0" class="d-flex flex-wrap ga-2">
                <v-chip
                  v-for="item in section.items"
                  :key="`${section.title}-${item.status}`"
                  :color="getStatusColor(item.status)"
                  variant="tonal"
                >
                  {{ item.status }} · {{ item.count }}
                </v-chip>
              </div>
              <p v-else class="text-medium-emphasis text-body-2">No data yet.</p>
            </div>
          </v-card-text>
        </v-card>

        <v-card class="panel-card">
          <v-card-item>
            <v-card-title>Admin Essentials</v-card-title>
            <v-card-subtitle>Core workflows this workspace should always expose</v-card-subtitle>
          </v-card-item>
          <v-list density="comfortable" class="py-1">
            <v-list-item
              v-for="item in quickLinks"
              :key="item.to"
              :to="item.to"
              :prepend-icon="item.icon"
              :title="item.title"
              :subtitle="item.subtitle"
            />
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

interface StatusItem {
  status: string
  count: number
}

interface RecentActivityItem {
  type: string
  title: string
  subtitle: string
  status: string | null
  happened_at: string
}

interface OverviewResponse {
  summary: {
    total_users: number
    active_subscribers: number
    active_subscriptions: number
    pending_shipments: number
    plan_variants: number
    monthly_revenue: number
  }
  subscription_statuses: StatusItem[]
  shipment_statuses: StatusItem[]
  payment_statuses: StatusItem[]
  recent_activity: RecentActivityItem[]
}

const { send } = useAdminApi()

const loading = ref(false)
const error = ref('')
const overview = ref<OverviewResponse | null>(null)

const summary = computed(() => overview.value?.summary ?? {
  total_users: 0,
  active_subscribers: 0,
  active_subscriptions: 0,
  pending_shipments: 0,
  plan_variants: 0,
  monthly_revenue: 0,
})

const stats = computed(() => [
  {
    label: 'Active Subscribers',
    value: summary.value.active_subscribers.toLocaleString(),
    chipText: `${summary.value.total_users} total users`,
    chipColor: 'info',
    note: 'Subscriber accounts currently active',
    icon: 'mdi-account-group-outline',
    iconBg: 'teal-lighten-4',
  },
  {
    label: 'Active Subscriptions',
    value: summary.value.active_subscriptions.toLocaleString(),
    chipText: `${summary.value.plan_variants} plan variants`,
    chipColor: 'secondary',
    note: 'Live subscriber plans needing service',
    icon: 'mdi-repeat',
    iconBg: 'blue-lighten-4',
  },
  {
    label: 'Pending Shipments',
    value: summary.value.pending_shipments.toLocaleString(),
    chipText: 'Fulfillment queue',
    chipColor: summary.value.pending_shipments > 0 ? 'warning' : 'success',
    note: 'Shipments still waiting to move out',
    icon: 'mdi-truck-fast-outline',
    iconBg: 'amber-lighten-4',
  },
  {
    label: '30-Day Revenue',
    value: formatCurrency(summary.value.monthly_revenue),
    chipText: 'Successful payments',
    chipColor: 'success',
    note: 'Collected in the last 30 days',
    icon: 'mdi-cash-multiple',
    iconBg: 'green-lighten-4',
  },
])

const revenueProgress = computed(() => {
  if (summary.value.monthly_revenue <= 0) {
    return 8
  }

  return Math.min(100, Math.max(20, summary.value.monthly_revenue / 120))
})

const recentActivity = computed(() => overview.value?.recent_activity ?? [])

const statusSections = computed(() => [
  { title: 'Subscriptions', items: overview.value?.subscription_statuses ?? [] },
  { title: 'Shipments', items: overview.value?.shipment_statuses ?? [] },
  { title: 'Payments', items: overview.value?.payment_statuses ?? [] },
])

const quickLinks = [
  {
    title: 'Plans catalog',
    subtitle: 'Create box variants and adjust cadence pricing',
    icon: 'mdi-package-variant-closed',
    to: '/plans',
  },
  {
    title: 'Subscription queue',
    subtitle: 'Pause, cancel, or correct subscriber plans',
    icon: 'mdi-repeat',
    to: '/subscriptions',
  },
  {
    title: 'Fulfillment board',
    subtitle: 'Create shipments and update tracking progress',
    icon: 'mdi-truck-outline',
    to: '/shipments',
  },
  {
    title: 'Billing review',
    subtitle: 'Inspect payment outcomes and manual entries',
    icon: 'mdi-credit-card-outline',
    to: '/payments',
  },
]

const fetchOverview = async () => {
  loading.value = true
  error.value = ''

  try {
    overview.value = await send<OverviewResponse>('/reports/overview')
  } catch (err: any) {
    error.value = err.message || 'Failed to load overview'
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status: string) => {
  const normalized = status.toUpperCase()

  if (normalized === 'ACTIVE' || normalized === 'SUCCESS' || normalized === 'DELIVERED') {
    return 'success'
  }

  if (normalized === 'PENDING' || normalized === 'PAUSED' || normalized === 'SHIPPED') {
    return 'warning'
  }

  if (normalized === 'FAILED' || normalized === 'CANCELLED' || normalized === 'INACTIVE') {
    return 'error'
  }

  return 'info'
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'subscription':
      return 'mdi-repeat'
    case 'shipment':
      return 'mdi-truck-outline'
    case 'payment':
      return 'mdi-cash-check'
    default:
      return 'mdi-account-plus-outline'
  }
}

const getActivityColor = (type: string) => {
  switch (type) {
    case 'subscription':
      return 'blue-lighten-5'
    case 'shipment':
      return 'amber-lighten-5'
    case 'payment':
      return 'green-lighten-5'
    default:
      return 'teal-lighten-5'
  }
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value || 0)

const formatDateTime = (value: string) => {
  const normalized = new Date(value)
  if (Number.isNaN(normalized.getTime())) {
    return 'Unknown time'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(normalized)
}

onMounted(fetchOverview)
</script>

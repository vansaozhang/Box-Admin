<template>
  <div class="subscriptions-page">
    <v-card class="toolbar-card mb-4">
      <div class="toolbar-wrapper">
        <div>
          <p class="section-eyebrow">Subscription Operations</p>
          <h2 class="section-title">Manage subscriber plans and lifecycle status</h2>
        </div>
        <div class="toolbar-actions">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search subscriber, box, or status..."
            density="compact"
            class="search-input"
            hide-details
          />
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
            Add subscription
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
      <v-chip color="success" variant="tonal">Active: {{ statusCounts.active }}</v-chip>
      <v-chip color="warning" variant="tonal">Paused: {{ statusCounts.paused }}</v-chip>
      <v-chip color="error" variant="tonal">Cancelled: {{ statusCounts.cancelled }}</v-chip>
      <v-chip color="secondary" variant="tonal">Total: {{ subscriptions.length }}</v-chip>
    </div>

    <v-card class="table-card">
      <v-progress-linear v-if="loading" indeterminate color="primary" />

      <v-table class="users-table">
        <thead>
          <tr>
            <th>Subscriber</th>
            <th>Box</th>
            <th>Cadence</th>
            <th>Start</th>
            <th>Recharge</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="subscription in filteredSubscriptions" :key="subscription.id">
            <td>
              <div>
                <p class="user-name">{{ subscription.user?.name || 'Unknown subscriber' }}</p>
                <p class="user-meta">
                  {{ subscription.user?.email || subscription.user_id }}
                </p>
              </div>
            </td>
            <td>
              <div>
                <p class="user-name">{{ subscription.plan?.name || 'Unknown box' }}</p>
                <p class="user-meta">{{ formatCurrency(Number(subscription.plan?.price || 0)) }}</p>
              </div>
            </td>
            <td>{{ formatCadence(subscription.plan?.frequency_in_days || 30) }}</td>
            <td>{{ formatDate(subscription.start_date) }}</td>
            <td>{{ formatDate(subscription.end_date) }}</td>
            <td>
              <v-chip :color="getStatusColor(subscription.status)" variant="tonal" size="small">
                {{ subscription.status }}
              </v-chip>
            </td>
            <td>
              <div class="action-group">
                <v-btn
                  icon="mdi-pencil-outline"
                  size="small"
                  variant="tonal"
                  color="secondary"
                  @click="openEditDialog(subscription)"
                />
                <v-btn
                  icon="mdi-delete-outline"
                  size="small"
                  variant="tonal"
                  color="error"
                  @click="removeSubscription(subscription)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="!loading && filteredSubscriptions.length === 0">
            <td colspan="7" class="text-center py-6 text-medium-emphasis">
              No subscriptions found.
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-dialog v-model="dialogOpen" max-width="760">
      <v-card>
        <v-card-title class="text-h6">
          {{ editingSubscriptionId ? 'Edit subscription' : 'Create subscription' }}
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
              <v-select
                v-model="form.user_id"
                :items="subscriberOptions"
                item-title="label"
                item-value="value"
                label="Subscriber"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.plan_id"
                :items="planOptions"
                item-title="label"
                item-value="value"
                label="Plan variant"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.start_date" label="Start date" type="date" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.end_date" label="End date" type="date" />
            </v-col>
            <v-col cols="12" md="4">
              <v-select v-model="form.status" :items="statusOptions" label="Status" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveSubscription">
            {{ editingSubscriptionId ? 'Save changes' : 'Create subscription' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

interface UserOption {
  id: string
  name: string
  email: string
}

interface PlanOption {
  id: string
  name: string
  frequency_in_days: number
  price: number | string
}

interface SubscriptionItem {
  id: string
  user_id: string
  plan_id: string
  start_date: string
  end_date: string | null
  status: string
  user?: {
    id: string
    name: string
    email: string
  }
  plan?: {
    id: string
    name: string
    frequency_in_days: number
    price: number | string
  }
}

interface UsersResponse {
  items: UserOption[]
}

const { send } = useAdminApi()

const subscriptions = ref<SubscriptionItem[]>([])
const subscribers = ref<UserOption[]>([])
const plans = ref<PlanOption[]>([])
const search = ref('')
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const dialogError = ref('')
const dialogOpen = ref(false)
const editingSubscriptionId = ref<string | null>(null)
const statusOptions = ['ACTIVE', 'PAUSED', 'CANCELLED']

const form = reactive({
  user_id: '',
  plan_id: '',
  start_date: '',
  end_date: '',
  status: 'ACTIVE',
})

const subscriberOptions = computed(() =>
  subscribers.value.map((user) => ({
    value: user.id,
    label: `${user.name} · ${user.email}`,
  })),
)

const planOptions = computed(() =>
  plans.value.map((plan) => ({
    value: plan.id,
    label: `${plan.name} · ${formatCadence(plan.frequency_in_days)} · ${formatCurrency(Number(plan.price))}`,
  })),
)

const filteredSubscriptions = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) {
    return subscriptions.value
  }

  return subscriptions.value.filter((subscription) => {
    const values = [
      subscription.user?.name,
      subscription.user?.email,
      subscription.plan?.name,
      subscription.status,
      formatCadence(subscription.plan?.frequency_in_days || 30),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return values.includes(query)
  })
})

const statusCounts = computed(() => ({
  active: subscriptions.value.filter((item) => item.status === 'ACTIVE').length,
  paused: subscriptions.value.filter((item) => item.status === 'PAUSED').length,
  cancelled: subscriptions.value.filter((item) => item.status === 'CANCELLED').length,
}))

const fetchDependencies = async () => {
  const [usersResponse, plansResponse] = await Promise.all([
    send<UsersResponse>('/users?page=1&limit=100&role=Subscriber'),
    send<PlanOption[]>('/subscription-plans'),
  ])

  subscribers.value = usersResponse.items
  plans.value = plansResponse
}

const fetchSubscriptions = async () => {
  loading.value = true
  error.value = ''

  try {
    subscriptions.value = await send<SubscriptionItem[]>('/subscriptions')
  } catch (err: any) {
    error.value = err.message || 'Failed to load subscriptions'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.user_id = subscribers.value[0]?.id ?? ''
  form.plan_id = plans.value[0]?.id ?? ''
  form.start_date = new Date().toISOString().slice(0, 10)
  form.end_date = ''
  form.status = 'ACTIVE'
}

const openCreateDialog = () => {
  editingSubscriptionId.value = null
  dialogError.value = ''
  resetForm()
  dialogOpen.value = true
}

const openEditDialog = (subscription: SubscriptionItem) => {
  editingSubscriptionId.value = subscription.id
  dialogError.value = ''
  form.user_id = subscription.user_id
  form.plan_id = subscription.plan_id
  form.start_date = subscription.start_date?.slice(0, 10) ?? ''
  form.end_date = subscription.end_date?.slice(0, 10) ?? ''
  form.status = subscription.status
  dialogOpen.value = true
}

const closeDialog = () => {
  dialogOpen.value = false
  dialogError.value = ''
  editingSubscriptionId.value = null
}

const saveSubscription = async () => {
  dialogError.value = ''

  if (!form.user_id || !form.plan_id || !form.start_date || !form.status) {
    dialogError.value = 'Subscriber, plan, start date, and status are required.'
    return
  }

  saving.value = true

  try {
    const payload = {
      user_id: form.user_id,
      plan_id: form.plan_id,
      start_date: form.start_date,
      end_date: form.end_date || undefined,
      status: form.status,
    }

    if (editingSubscriptionId.value) {
      await send(`/subscriptions/${editingSubscriptionId.value}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    } else {
      await send('/subscriptions', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    }

    closeDialog()
    await fetchSubscriptions()
  } catch (err: any) {
    dialogError.value = err.message || 'Failed to save subscription'
  } finally {
    saving.value = false
  }
}

const removeSubscription = async (subscription: SubscriptionItem) => {
  const confirmed = window.confirm(`Delete subscription for ${subscription.user?.name || 'this subscriber'}?`)
  if (!confirmed) {
    return
  }

  try {
    await send(`/subscriptions/${subscription.id}`, { method: 'DELETE' })
    await fetchSubscriptions()
  } catch (err: any) {
    error.value = err.message || 'Failed to delete subscription'
  }
}

const getStatusColor = (status: string) => {
  if (status === 'ACTIVE') {
    return 'success'
  }
  if (status === 'PAUSED') {
    return 'warning'
  }
  if (status === 'CANCELLED') {
    return 'error'
  }
  return 'secondary'
}

const formatCadence = (frequencyInDays: number) => {
  if (frequencyInDays >= 360) {
    return 'Yearly'
  }
  if ([89, 90, 91, 92].includes(frequencyInDays)) {
    return 'Every 3 months'
  }
  if (frequencyInDays === 14) {
    return 'Every 2 weeks'
  }
  if (frequencyInDays <= 7) {
    return 'Weekly'
  }
  return 'Monthly'
}

const formatDate = (value?: string | null) => {
  if (!value) {
    return '—'
  }

  const normalized = new Date(value)
  if (Number.isNaN(normalized.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(normalized)
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value || 0)

onMounted(async () => {
  await Promise.all([fetchDependencies(), fetchSubscriptions()])
  if (!form.user_id || !form.plan_id) {
    resetForm()
  }
})
</script>

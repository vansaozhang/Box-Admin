<template>
  <div class="shipments-page">
    <v-card class="toolbar-card mb-4">
      <div class="toolbar-wrapper">
        <div>
          <p class="section-eyebrow">Fulfillment Board</p>
          <h2 class="section-title">Create shipments and keep tracking accurate</h2>
        </div>
        <div class="toolbar-actions">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search subscriber, box, tracking..."
            density="compact"
            class="search-input"
            hide-details
          />
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
            Add shipment
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
      <v-chip color="warning" variant="tonal">Pending: {{ statusCounts.pending }}</v-chip>
      <v-chip color="info" variant="tonal">Shipped: {{ statusCounts.shipped }}</v-chip>
      <v-chip color="success" variant="tonal">Delivered: {{ statusCounts.delivered }}</v-chip>
      <v-chip color="secondary" variant="tonal">Total: {{ shipments.length }}</v-chip>
    </div>

    <v-card class="table-card">
      <v-progress-linear v-if="loading" indeterminate color="primary" />

      <v-table class="users-table">
        <thead>
          <tr>
            <th>Subscriber</th>
            <th>Box</th>
            <th>Shipment date</th>
            <th>Tracking</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="shipment in filteredShipments" :key="shipment.id">
            <td>
              <div>
                <p class="user-name">{{ shipment.subscription?.user?.name || 'Unknown subscriber' }}</p>
                <p class="user-meta">{{ shipment.subscription?.user?.email || shipment.subscription_id }}</p>
              </div>
            </td>
            <td>
              <div>
                <p class="user-name">{{ shipment.subscription?.plan?.name || 'Unknown box' }}</p>
                <p class="user-meta">{{ formatCadence(shipment.subscription?.plan?.frequency_in_days || 30) }}</p>
              </div>
            </td>
            <td>{{ formatDate(shipment.shipment_date) }}</td>
            <td>{{ shipment.tracking_number || 'Tracking pending' }}</td>
            <td>
              <v-chip :color="getStatusColor(shipment.status)" variant="tonal" size="small">
                {{ shipment.status }}
              </v-chip>
            </td>
            <td>
              <div class="action-group">
                <v-btn
                  icon="mdi-pencil-outline"
                  size="small"
                  variant="tonal"
                  color="secondary"
                  @click="openEditDialog(shipment)"
                />
                <v-btn
                  icon="mdi-delete-outline"
                  size="small"
                  variant="tonal"
                  color="error"
                  @click="removeShipment(shipment)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="!loading && filteredShipments.length === 0">
            <td colspan="6" class="text-center py-6 text-medium-emphasis">
              No shipments found.
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-dialog v-model="dialogOpen" max-width="760">
      <v-card>
        <v-card-title class="text-h6">
          {{ editingShipmentId ? 'Edit shipment' : 'Create shipment' }}
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
              <v-select
                v-model="form.subscription_id"
                :items="subscriptionOptions"
                item-title="label"
                item-value="value"
                label="Subscription"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.shipment_date" label="Shipment date" type="date" />
            </v-col>
            <v-col cols="12" md="4">
              <v-select v-model="form.status" :items="statusOptions" label="Status" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.tracking_number" label="Tracking number" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveShipment">
            {{ editingShipmentId ? 'Save changes' : 'Create shipment' }}
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

interface ShipmentItem {
  id: string
  subscription_id: string
  shipment_date: string
  status: string
  tracking_number?: string | null
  subscription?: {
    id: string
    status?: string
    user?: {
      name: string
      email: string
    }
    plan?: {
      name: string
      frequency_in_days: number
    }
  }
}

interface SubscriptionOption {
  id: string
  user?: {
    name: string
    email: string
  }
  plan?: {
    name: string
    frequency_in_days: number
  }
  status: string
}

const { send } = useAdminApi()

const shipments = ref<ShipmentItem[]>([])
const subscriptions = ref<SubscriptionOption[]>([])
const search = ref('')
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const dialogError = ref('')
const dialogOpen = ref(false)
const editingShipmentId = ref<string | null>(null)
const statusOptions = ['PENDING', 'SHIPPED', 'DELIVERED']

const form = reactive({
  subscription_id: '',
  shipment_date: '',
  status: 'PENDING',
  tracking_number: '',
})

const subscriptionOptions = computed(() =>
  subscriptions.value.map((subscription) => ({
    value: subscription.id,
    label: `${subscription.user?.name || 'Subscriber'} · ${subscription.plan?.name || 'Subscription'} · ${subscription.status}`,
  })),
)

const filteredShipments = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) {
    return shipments.value
  }

  return shipments.value.filter((shipment) =>
    [
      shipment.subscription?.user?.name,
      shipment.subscription?.user?.email,
      shipment.subscription?.plan?.name,
      shipment.tracking_number,
      shipment.status,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query),
  )
})

const statusCounts = computed(() => ({
  pending: shipments.value.filter((item) => item.status === 'PENDING').length,
  shipped: shipments.value.filter((item) => item.status === 'SHIPPED').length,
  delivered: shipments.value.filter((item) => item.status === 'DELIVERED').length,
}))

const fetchDependencies = async () => {
  subscriptions.value = await send<SubscriptionOption[]>('/subscriptions')
}

const fetchShipments = async () => {
  loading.value = true
  error.value = ''

  try {
    shipments.value = await send<ShipmentItem[]>('/shipments')
  } catch (err: any) {
    error.value = err.message || 'Failed to load shipments'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.subscription_id = subscriptions.value[0]?.id ?? ''
  form.shipment_date = new Date().toISOString().slice(0, 10)
  form.status = 'PENDING'
  form.tracking_number = ''
}

const openCreateDialog = () => {
  editingShipmentId.value = null
  dialogError.value = ''
  resetForm()
  dialogOpen.value = true
}

const openEditDialog = (shipment: ShipmentItem) => {
  editingShipmentId.value = shipment.id
  dialogError.value = ''
  form.subscription_id = shipment.subscription_id
  form.shipment_date = shipment.shipment_date?.slice(0, 10) ?? ''
  form.status = shipment.status
  form.tracking_number = shipment.tracking_number ?? ''
  dialogOpen.value = true
}

const closeDialog = () => {
  dialogOpen.value = false
  dialogError.value = ''
  editingShipmentId.value = null
}

const saveShipment = async () => {
  dialogError.value = ''

  if (!form.subscription_id || !form.shipment_date || !form.status) {
    dialogError.value = 'Subscription, shipment date, and status are required.'
    return
  }

  saving.value = true

  try {
    const payload = {
      subscription_id: form.subscription_id,
      shipment_date: form.shipment_date,
      status: form.status,
      tracking_number: form.tracking_number.trim() || undefined,
    }

    if (editingShipmentId.value) {
      await send(`/shipments/${editingShipmentId.value}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    } else {
      await send('/shipments', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    }

    closeDialog()
    await fetchShipments()
  } catch (err: any) {
    dialogError.value = err.message || 'Failed to save shipment'
  } finally {
    saving.value = false
  }
}

const removeShipment = async (shipment: ShipmentItem) => {
  const confirmed = window.confirm(`Delete shipment for ${shipment.subscription?.user?.name || 'this subscriber'}?`)
  if (!confirmed) {
    return
  }

  try {
    await send(`/shipments/${shipment.id}`, { method: 'DELETE' })
    await fetchShipments()
  } catch (err: any) {
    error.value = err.message || 'Failed to delete shipment'
  }
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

const getStatusColor = (status: string) => {
  if (status === 'DELIVERED') {
    return 'success'
  }
  if (status === 'SHIPPED') {
    return 'info'
  }
  return 'warning'
}

onMounted(async () => {
  await Promise.all([fetchDependencies(), fetchShipments()])
  if (!form.subscription_id) {
    resetForm()
  }
})
</script>

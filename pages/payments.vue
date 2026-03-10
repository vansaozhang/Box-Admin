<template>
  <div class="payments-page">
    <v-card class="toolbar-card mb-4">
      <div class="toolbar-wrapper">
        <div>
          <p class="section-eyebrow">Billing Review</p>
          <h2 class="section-title">Monitor payment outcomes and manual billing records</h2>
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
            Add payment
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
      <v-chip color="success" variant="tonal">Success: {{ statusCounts.success }}</v-chip>
      <v-chip color="warning" variant="tonal">Pending: {{ statusCounts.pending }}</v-chip>
      <v-chip color="error" variant="tonal">Failed: {{ statusCounts.failed }}</v-chip>
      <v-chip color="secondary" variant="tonal">Volume: {{ formatCurrency(totalAmount) }}</v-chip>
    </div>

    <v-card class="table-card">
      <v-progress-linear v-if="loading" indeterminate color="primary" />

      <v-table class="users-table">
        <thead>
          <tr>
            <th>Subscriber</th>
            <th>Box</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Paid at</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in filteredPayments" :key="payment.id">
            <td>
              <div>
                <p class="user-name">{{ payment.subscription?.user?.name || 'Unknown subscriber' }}</p>
                <p class="user-meta">{{ payment.subscription?.user?.email || payment.subscription_id }}</p>
              </div>
            </td>
            <td>
              <div>
                <p class="user-name">{{ payment.subscription?.plan?.name || 'Unknown box' }}</p>
                <p class="user-meta">{{ formatCadence(payment.subscription?.plan?.frequency_in_days || 30) }}</p>
              </div>
            </td>
            <td>{{ formatCurrency(Number(payment.amount)) }}</td>
            <td>
              <v-chip :color="getStatusColor(payment.payment_status)" variant="tonal" size="small">
                {{ payment.payment_status }}
              </v-chip>
            </td>
            <td>{{ formatDateTime(payment.payment_date) }}</td>
            <td>
              <div class="action-group">
                <v-btn
                  icon="mdi-pencil-outline"
                  size="small"
                  variant="tonal"
                  color="secondary"
                  @click="openEditDialog(payment)"
                />
                <v-btn
                  icon="mdi-delete-outline"
                  size="small"
                  variant="tonal"
                  color="error"
                  @click="removePayment(payment)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="!loading && filteredPayments.length === 0">
            <td colspan="6" class="text-center py-6 text-medium-emphasis">
              No payments found.
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-dialog v-model="dialogOpen" max-width="760">
      <v-card>
        <v-card-title class="text-h6">
          {{ editingPaymentId ? 'Edit payment' : 'Create payment' }}
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
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.amount"
                label="Amount (USD)"
                type="number"
                min="0"
                step="0.01"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="form.payment_status" :items="statusOptions" label="Payment status" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="savePayment">
            {{ editingPaymentId ? 'Save changes' : 'Create payment' }}
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

interface PaymentItem {
  id: string
  subscription_id: string
  amount: number | string
  payment_status: string
  payment_date: string
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

const payments = ref<PaymentItem[]>([])
const subscriptions = ref<SubscriptionOption[]>([])
const search = ref('')
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const dialogError = ref('')
const dialogOpen = ref(false)
const editingPaymentId = ref<string | null>(null)
const statusOptions = ['SUCCESS', 'PENDING', 'FAILED']

const form = reactive({
  subscription_id: '',
  amount: 0,
  payment_status: 'PENDING',
})

const subscriptionOptions = computed(() =>
  subscriptions.value.map((subscription) => ({
    value: subscription.id,
    label: `${subscription.user?.name || 'Subscriber'} · ${subscription.plan?.name || 'Subscription'} · ${subscription.status}`,
  })),
)

const filteredPayments = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) {
    return payments.value
  }

  return payments.value.filter((payment) =>
    [
      payment.subscription?.user?.name,
      payment.subscription?.user?.email,
      payment.subscription?.plan?.name,
      payment.payment_status,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query),
  )
})

const statusCounts = computed(() => ({
  success: payments.value.filter((item) => item.payment_status === 'SUCCESS').length,
  pending: payments.value.filter((item) => item.payment_status === 'PENDING').length,
  failed: payments.value.filter((item) => item.payment_status === 'FAILED').length,
}))

const totalAmount = computed(() =>
  payments.value.reduce((sum, item) => sum + Number(item.amount || 0), 0),
)

const fetchDependencies = async () => {
  subscriptions.value = await send<SubscriptionOption[]>('/subscriptions')
}

const fetchPayments = async () => {
  loading.value = true
  error.value = ''

  try {
    payments.value = await send<PaymentItem[]>('/payments')
  } catch (err: any) {
    error.value = err.message || 'Failed to load payments'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.subscription_id = subscriptions.value[0]?.id ?? ''
  form.amount = 0
  form.payment_status = 'PENDING'
}

const openCreateDialog = () => {
  editingPaymentId.value = null
  dialogError.value = ''
  resetForm()
  dialogOpen.value = true
}

const openEditDialog = (payment: PaymentItem) => {
  editingPaymentId.value = payment.id
  dialogError.value = ''
  form.subscription_id = payment.subscription_id
  form.amount = Number(payment.amount)
  form.payment_status = payment.payment_status
  dialogOpen.value = true
}

const closeDialog = () => {
  dialogOpen.value = false
  dialogError.value = ''
  editingPaymentId.value = null
}

const savePayment = async () => {
  dialogError.value = ''

  if (!form.subscription_id || form.amount <= 0 || !form.payment_status) {
    dialogError.value = 'Subscription, amount, and payment status are required.'
    return
  }

  saving.value = true

  try {
    const payload = {
      subscription_id: form.subscription_id,
      amount: Number(form.amount),
      payment_status: form.payment_status,
    }

    if (editingPaymentId.value) {
      await send(`/payments/${editingPaymentId.value}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    } else {
      await send('/payments', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    }

    closeDialog()
    await fetchPayments()
  } catch (err: any) {
    dialogError.value = err.message || 'Failed to save payment'
  } finally {
    saving.value = false
  }
}

const removePayment = async (payment: PaymentItem) => {
  const confirmed = window.confirm(`Delete payment for ${payment.subscription?.user?.name || 'this subscriber'}?`)
  if (!confirmed) {
    return
  }

  try {
    await send(`/payments/${payment.id}`, { method: 'DELETE' })
    await fetchPayments()
  } catch (err: any) {
    error.value = err.message || 'Failed to delete payment'
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

const formatDateTime = (value?: string | null) => {
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
    hour: 'numeric',
    minute: '2-digit',
  }).format(normalized)
}

const getStatusColor = (status: string) => {
  if (status === 'SUCCESS') {
    return 'success'
  }
  if (status === 'FAILED') {
    return 'error'
  }
  return 'warning'
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value || 0)

onMounted(async () => {
  await Promise.all([fetchDependencies(), fetchPayments()])
  if (!form.subscription_id) {
    resetForm()
  }
})
</script>

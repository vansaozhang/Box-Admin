<template>
  <div class="plans-page">
    <v-card class="toolbar-card mb-4">
      <div class="toolbar-wrapper">
        <div>
          <p class="section-eyebrow">Catalog Management</p>
          <h2 class="section-title">Manage box plans and delivery cadences</h2>
        </div>
        <div class="toolbar-actions">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search box name or cadence..."
            density="compact"
            class="search-input"
            hide-details
          />
          <v-btn
            variant="tonal"
            color="secondary"
            prepend-icon="mdi-database-sync-outline"
            :loading="seeding"
            @click="seedDefaults"
          >
            Seed defaults
          </v-btn>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
            Add variant
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
      <v-chip color="primary" variant="tonal">Variants: {{ plans.length }}</v-chip>
      <v-chip color="secondary" variant="tonal">Boxes: {{ uniqueBoxCount }}</v-chip>
      <v-chip color="info" variant="tonal">Weekly: {{ cadenceSummary.weekly }}</v-chip>
      <v-chip color="success" variant="tonal">Monthly: {{ cadenceSummary.monthly }}</v-chip>
      <v-chip color="warning" variant="tonal">Yearly: {{ cadenceSummary.yearly }}</v-chip>
    </div>

    <v-card class="table-card">
      <v-progress-linear v-if="loading" indeterminate color="primary" />

      <v-table class="users-table">
        <thead>
          <tr>
            <th>Box</th>
            <th>Cadence</th>
            <th>Price</th>
            <th>Image</th>
            <th>Days</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="plan in filteredPlans" :key="plan.id">
            <td>
              <div class="d-flex align-center ga-3">
                <v-avatar size="56" rounded="lg" color="grey-lighten-4">
                  <v-img
                    v-if="plan.image_url"
                    :src="plan.image_url"
                    :alt="`${plan.name} cover image`"
                    cover
                  />
                  <span v-else class="text-body-2 font-weight-bold text-medium-emphasis">
                    {{ getPlanInitials(plan.name) }}
                  </span>
                </v-avatar>
                <div>
                <p class="user-name">{{ plan.name }}</p>
                <p class="user-meta">{{ formatPeriod(plan.frequency_in_days) }}</p>
                </div>
              </div>
            </td>
            <td>
              <v-chip :color="getCadenceColor(plan.frequency_in_days)" variant="tonal" size="small">
                {{ formatCadence(plan.frequency_in_days) }}
              </v-chip>
            </td>
            <td>{{ formatCurrency(Number(plan.price)) }}</td>
            <td>
              <span class="user-meta">
                {{ plan.image_url ? 'Uploaded' : 'No image' }}
              </span>
            </td>
            <td>{{ plan.frequency_in_days }} days</td>
            <td>
              <div class="action-group">
                <v-btn
                  icon="mdi-pencil-outline"
                  size="small"
                  variant="tonal"
                  color="secondary"
                  @click="openEditDialog(plan)"
                />
                <v-btn
                  icon="mdi-delete-outline"
                  size="small"
                  variant="tonal"
                  color="error"
                  @click="removePlan(plan)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="!loading && filteredPlans.length === 0">
            <td colspan="6" class="text-center py-6 text-medium-emphasis">
              No plan variants found.
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-dialog v-model="dialogOpen" max-width="640">
      <v-card>
        <v-card-title class="text-h6">
          {{ editingPlanId ? 'Edit box variant' : 'Create box variant' }}
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
              <v-text-field v-model="form.name" label="Box name" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.frequency_in_days"
                label="Frequency in days"
                type="number"
                min="1"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.price"
                label="Price (USD)"
                type="number"
                min="0"
                step="0.01"
              />
            </v-col>
            <v-col cols="12">
              <div class="d-flex align-center ga-4 flex-wrap">
                <v-avatar size="88" rounded="xl" color="grey-lighten-4">
                  <v-img
                    v-if="imagePreviewUrl"
                    :src="imagePreviewUrl"
                    :alt="`${form.name || 'Plan'} preview image`"
                    cover
                  />
                  <span v-else class="text-body-1 font-weight-bold text-medium-emphasis">
                    {{ getPlanInitials(form.name || 'Plan') }}
                  </span>
                </v-avatar>
                <div class="flex-grow-1">
                  <v-file-input
                    accept="image/*"
                    label="Plan image"
                    prepend-icon="mdi-image-outline"
                    variant="outlined"
                    density="comfortable"
                    show-size
                    clearable
                    @update:model-value="onImageSelected"
                  />
                  <p class="text-caption text-medium-emphasis mt-2">
                    Optional. JPG, PNG, WEBP, or GIF up to 5 MB.
                  </p>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="savePlan">
            {{ editingPlanId ? 'Save changes' : 'Create variant' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

interface PlanItem {
  id: string
  name: string
  frequency_in_days: number
  price: number | string
  image_url?: string | null
}

const { send } = useAdminApi()

const plans = ref<PlanItem[]>([])
const search = ref('')
const loading = ref(false)
const saving = ref(false)
const seeding = ref(false)
const error = ref('')
const dialogError = ref('')
const dialogOpen = ref(false)
const editingPlanId = ref<string | null>(null)
const imageFile = ref<File | null>(null)
const imagePreviewUrl = ref('')
let previewObjectUrl: string | null = null

const form = reactive({
  name: '',
  frequency_in_days: 30,
  price: 19,
})

const filteredPlans = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) {
    return plans.value
  }

  return plans.value.filter((plan) => {
    const cadence = formatCadence(plan.frequency_in_days).toLowerCase()
    return (
      plan.name.toLowerCase().includes(query)
      || cadence.includes(query)
      || String(plan.frequency_in_days).includes(query)
    )
  })
})

const uniqueBoxCount = computed(() => new Set(plans.value.map((plan) => plan.name)).size)

const cadenceSummary = computed(() => ({
  weekly: plans.value.filter((plan) => plan.frequency_in_days <= 7).length,
  monthly: plans.value.filter((plan) => plan.frequency_in_days > 7 && plan.frequency_in_days < 360).length,
  yearly: plans.value.filter((plan) => plan.frequency_in_days >= 360).length,
}))

const fetchPlans = async () => {
  loading.value = true
  error.value = ''

  try {
    plans.value = await send<PlanItem[]>('/subscription-plans')
  } catch (err: any) {
    error.value = err.message || 'Failed to load plans'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.name = ''
  form.frequency_in_days = 30
  form.price = 19
  resetImageSelection()
}

const openCreateDialog = () => {
  editingPlanId.value = null
  dialogError.value = ''
  resetForm()
  dialogOpen.value = true
}

const openEditDialog = (plan: PlanItem) => {
  editingPlanId.value = plan.id
  dialogError.value = ''
  form.name = plan.name
  form.frequency_in_days = plan.frequency_in_days
  form.price = Number(plan.price)
  imageFile.value = null
  setImagePreview(plan.image_url ?? '')
  dialogOpen.value = true
}

const closeDialog = () => {
  dialogOpen.value = false
  dialogError.value = ''
  editingPlanId.value = null
  resetForm()
}

const savePlan = async () => {
  dialogError.value = ''

  if (!form.name.trim() || form.frequency_in_days <= 0 || form.price <= 0) {
    dialogError.value = 'Box name, valid frequency, and valid price are required.'
    return
  }

  saving.value = true

  try {
    const payload = {
      name: form.name.trim(),
      frequency_in_days: Number(form.frequency_in_days),
      price: Number(form.price),
    }

    let savedPlan: PlanItem

    if (editingPlanId.value) {
      savedPlan = await send<PlanItem>(`/subscription-plans/${editingPlanId.value}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    } else {
      savedPlan = await send<PlanItem>('/subscription-plans', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    }

    if (imageFile.value) {
      const formData = new FormData()
      formData.append('file', imageFile.value)

      await send<PlanItem>(`/subscription-plans/${savedPlan.id}/image`, {
        method: 'POST',
        body: formData,
      })
    }

    closeDialog()
    await fetchPlans()
  } catch (err: any) {
    dialogError.value = err.message || 'Failed to save plan'
  } finally {
    saving.value = false
  }
}

const removePlan = async (plan: PlanItem) => {
  const confirmed = window.confirm(`Delete ${plan.name} (${formatCadence(plan.frequency_in_days)})?`)
  if (!confirmed) {
    return
  }

  try {
    await send(`/subscription-plans/${plan.id}`, { method: 'DELETE' })
    await fetchPlans()
  } catch (err: any) {
    error.value = err.message || 'Failed to delete plan'
  }
}

const seedDefaults = async () => {
  seeding.value = true
  error.value = ''

  try {
    await send('/subscription-plans/seed-defaults', { method: 'POST' })
    await fetchPlans()
  } catch (err: any) {
    error.value = err.message || 'Failed to seed default plans'
  } finally {
    seeding.value = false
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

const formatPeriod = (frequencyInDays: number) => {
  if (frequencyInDays >= 360) {
    return '/yr'
  }
  if ([89, 90, 91, 92].includes(frequencyInDays)) {
    return '/3mo'
  }
  if (frequencyInDays === 14) {
    return '/2wk'
  }
  if (frequencyInDays <= 7) {
    return '/wk'
  }
  return '/mo'
}

const getCadenceColor = (frequencyInDays: number) => {
  if (frequencyInDays >= 360) {
    return 'warning'
  }
  if (frequencyInDays <= 7) {
    return 'info'
  }
  return 'success'
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value || 0)

const getPlanInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2)
    || 'BX'

const onImageSelected = (value: File | File[] | null) => {
  const nextFile = Array.isArray(value) ? (value[0] ?? null) : value

  if (!nextFile) {
    imageFile.value = null
    if (editingPlanId.value) {
      const existingPlan = plans.value.find((plan) => plan.id === editingPlanId.value)
      setImagePreview(existingPlan?.image_url ?? '')
    } else {
      setImagePreview('')
    }
    return
  }

  if (!nextFile.type.startsWith('image/')) {
    dialogError.value = 'Only image files can be uploaded.'
    imageFile.value = null
    return
  }

  if (nextFile.size > 5 * 1024 * 1024) {
    dialogError.value = 'Plan image must be 5 MB or smaller.'
    imageFile.value = null
    return
  }

  dialogError.value = ''
  imageFile.value = nextFile

  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl)
  }

  previewObjectUrl = URL.createObjectURL(nextFile)
  imagePreviewUrl.value = previewObjectUrl
}

const setImagePreview = (value: string) => {
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl)
    previewObjectUrl = null
  }
  imagePreviewUrl.value = value
}

const resetImageSelection = () => {
  imageFile.value = null
  setImagePreview('')
}

onMounted(fetchPlans)
onBeforeUnmount(() => {
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl)
  }
})
</script>

<template>
  <div>
    <v-card class="mb-4">
      <v-card-title>General Settings</v-card-title>
      <v-card-text>
        <v-text-field
          label="Site Name"
          variant="outlined"
          density="comfortable"
          class="mb-4"
        ></v-text-field>
        <v-text-field
          label="Site URL"
          variant="outlined"
          density="comfortable"
          class="mb-4"
        ></v-text-field>
        <v-select
          :items="['English', 'Spanish', 'French']"
          label="Language"
          variant="outlined"
          density="comfortable"
        ></v-select>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary">Save Changes</v-btn>
      </v-card-actions>
    </v-card>

    <v-card>
      <v-card-title>Notification Settings</v-card-title>
      <v-card-text>
        <v-switch label="Email Notifications" color="primary"></v-switch>
        <v-switch label="Push Notifications" color="primary"></v-switch>
        <v-switch label="SMS Notifications" color="primary"></v-switch>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary">Save Preferences</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

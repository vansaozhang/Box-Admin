<template>
  <div>
    <v-row>
      <v-col cols="12" md="3">
        <v-card color="primary" dark>
          <v-card-text>
            <div>Total Users</div>
            <div class="text-h4">2,543</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="success" dark>
          <v-card-text>
            <div>Revenue</div>
            <div class="text-h4">$45.2K</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="warning" dark>
          <v-card-text>
            <div>Orders</div>
            <div class="text-h4">1,234</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="info" dark>
          <v-card-text>
            <div>Documents</div>
            <div class="text-h4">567</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-6">
      <v-col cols="12">
        <v-card>
          <v-card-title>Recent Activity</v-card-title>
          <v-divider></v-divider>
          <v-list>
            <v-list-item title="New user registered" subtitle="John Doe - 5 minutes ago"></v-list-item>
            <v-divider></v-divider>
            <v-list-item title="New order received" subtitle="Order #1234 - 15 minutes ago"></v-list-item>
            <v-divider></v-divider>
            <v-list-item title="Document uploaded" subtitle="Report.pdf - 1 hour ago"></v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

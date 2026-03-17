<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const userId = ref('')
const username = ref('')
const loading = ref(false)

async function onLogin() {
  if (!userId.value || !username.value) return

  loading.value = true
  try {
    await auth.login(userId.value, username.value)
    router.push({ name: 'dashboard' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <q-page class="flex flex-center">
    <q-card style="width: 400px; max-width: 90vw">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Push Notification Demo</div>
        <div class="text-caption">Login to register your device</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="onLogin" class="q-gutter-md">
          <q-input
            v-model="userId"
            label="User ID"
            hint="e.g. alice, bob, user-1"
            outlined
            :rules="[(v: string) => !!v || 'Required']"
          />

          <q-input
            v-model="username"
            label="Display Name"
            hint="Your display name"
            outlined
            :rules="[(v: string) => !!v || 'Required']"
          />

          <q-btn
            type="submit"
            label="Login"
            color="primary"
            class="full-width"
            :loading="loading"
          />
        </q-form>
      </q-card-section>

      <q-card-section class="text-caption text-grey-7">
        This is a demo login. Different User IDs will only receive
        notifications sent to their own ID.
      </q-card-section>
    </q-card>
  </q-page>
</template>

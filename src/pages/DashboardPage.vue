<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { apiPost } from "../services/api";
import {
  initializeMessaging,
  requestPermission,
  getNotificationToken,
  onForegroundMessage,
  type MessagePayload,
} from "@rnd-ai-playground/em-libs-firebase-client";

const router = useRouter();
const auth = useAuthStore();

const firebaseConfig = {
  apiKey: "AIzaSyDWEVdHBNuLPhJsYjjz1XPfqDN4YkilFd0",
  authDomain: "test-project-c7ff2.firebaseapp.com",
  projectId: "test-project-c7ff2",
  storageBucket: "test-project-c7ff2.firebasestorage.app",
  messagingSenderId: "733769881498",
  appId: "1:733769881498:web:0d7d8cba4310484c248c23",
  measurementId: "G-GQMH47ETDZ",
};
const vapidKey =
  "BNy3H7r-D15iL-vAIiNIb9lrg9Pje_4Mm9w4UYEk27q960rbH3DezbdNT4D9M-0RQxuWjsL3cGwXXVuQ0w1gC_c";

// ─── Notification Setup ──────────────────────────────────────────────────────

const status = ref("Not initialized");
const notificationsEnabled = ref(false);
const settingUp = ref(false);
let firebaseInitialized = false;

async function enableNotifications() {
  settingUp.value = true;
  try {
    if (!firebaseInitialized) {
      initializeMessaging(firebaseConfig);
      firebaseInitialized = true;
    }
    status.value = "Requesting permission...";

    const permission = await requestPermission();
    if (permission !== "granted") {
      status.value = "Permission denied";
      return;
    }
    status.value = "Getting FCM token...";

    const token = await getNotificationToken(vapidKey);
    auth.fcmToken = token;
    status.value = "Registering token...";

    await apiPost("/register-token", {
      userId: auth.userId,
      token,
      device: navigator.userAgent.includes("Chrome") ? "Chrome" : "Browser",
    });

    onForegroundMessage((payload: MessagePayload) => {
      console.log("Foreground message:", payload);
      const title =
        payload.data?.title ?? payload.notification?.title ?? "Notification";
      const body = payload.data?.body ?? payload.notification?.body ?? "";

      messages.value.unshift({
        title,
        body,
        time: new Date().toLocaleTimeString(),
      });

      new Notification(title, { body });
    });

    notificationsEnabled.value = true;
    status.value = "Listening for notifications";
  } catch (error) {
    status.value = `Error: ${error}`;
    console.error("Setup error:", error);
  } finally {
    settingUp.value = false;
  }
}

// ─── Send Notification ───────────────────────────────────────────────────────

const targetUserId = ref("");
const notifTitle = ref("Test Notification");
const notifBody = ref("Hello from Push Notification Demo!");
const sending = ref(false);
const sendResult = ref("");

async function sendNotification() {
  if (!targetUserId.value || !notifTitle.value || !notifBody.value) return;

  sending.value = true;
  sendResult.value = "";
  try {
    const result = await apiPost<{
      success: boolean;
      sentCount: number;
      failedCount: number;
    }>("/send-notification", {
      userId: targetUserId.value,
      title: notifTitle.value,
      body: notifBody.value,
    });
    sendResult.value = `Sent: ${result.sentCount}, Failed: ${result.failedCount}`;
  } catch (error) {
    sendResult.value = `Error: ${error}`;
  } finally {
    sending.value = false;
  }
}

// ─── Messages ────────────────────────────────────────────────────────────────

const messages = ref<{ title: string; body: string; time: string }[]>([]);

// ─── Logout ──────────────────────────────────────────────────────────────────

async function onLogout() {
  if (auth.fcmToken) {
    try {
      await apiPost("/remove-token", { token: auth.fcmToken });
    } catch {
      // best-effort
    }
  }
  auth.logout();
  router.push({ name: "login" });
}
</script>

<template>
  <q-page padding>
    <div class="q-mx-auto" style="max-width: 600px">
      <!-- Header -->
      <q-toolbar class="bg-primary text-white rounded-borders q-mb-md">
        <q-toolbar-title> Push Notification Demo </q-toolbar-title>
        <q-chip color="white" text-color="primary" icon="person">
          {{ auth.username }} ({{ auth.userId }})
        </q-chip>
        <q-btn flat round icon="logout" @click="onLogout" />
      </q-toolbar>

      <!-- Notification Setup -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">Notifications</div>
          <div class="text-caption text-grey-7">Status: {{ status }}</div>
        </q-card-section>

        <q-card-section v-if="!notificationsEnabled">
          <q-btn
            label="Enable Notifications"
            color="primary"
            icon="notifications_active"
            :loading="settingUp"
            @click="enableNotifications"
          />
        </q-card-section>

        <q-card-section v-else>
          <q-banner class="bg-positive text-white rounded-borders">
            <template #avatar>
              <q-icon name="check_circle" />
            </template>
            Notifications enabled! FCM token registered for user "{{
              auth.userId
            }}".
          </q-banner>
          <div
            class="q-mt-sm text-caption text-grey-7"
            style="word-break: break-all"
          >
            Token: {{ auth.fcmToken.substring(0, 40) }}...
          </div>
        </q-card-section>
      </q-card>

      <!-- Send Notification -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">Send Notification</div>
          <div class="text-caption text-grey-7">
            Send a push notification to any registered user
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="sendNotification" class="q-gutter-sm">
            <q-input
              v-model="targetUserId"
              label="Target User ID"
              hint="The userId to send notification to"
              outlined
              dense
              :rules="[(v: string) => !!v || 'Required']"
            />
            <q-input
              v-model="notifTitle"
              label="Title"
              outlined
              dense
              :rules="[(v: string) => !!v || 'Required']"
            />
            <q-input
              v-model="notifBody"
              label="Body"
              outlined
              dense
              :rules="[(v: string) => !!v || 'Required']"
            />
            <q-btn
              type="submit"
              label="Send"
              color="accent"
              icon="send"
              :loading="sending"
              :disable="!notificationsEnabled"
            />
            <div v-if="sendResult" class="text-caption q-mt-sm">
              {{ sendResult }}
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <!-- Received Messages -->
      <q-card>
        <q-card-section>
          <div class="text-h6">
            Received Messages
            <q-badge
              v-if="messages.length"
              color="primary"
              :label="messages.length"
              class="q-ml-sm"
            />
          </div>
        </q-card-section>

        <q-card-section v-if="messages.length === 0">
          <div class="text-grey-5 text-center q-pa-md">
            No messages received yet. Send a notification to this user to see it
            here.
          </div>
        </q-card-section>

        <q-list v-else separator>
          <q-item v-for="(msg, i) in messages" :key="i">
            <q-item-section avatar>
              <q-icon name="notifications" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ msg.title }}</q-item-label>
              <q-item-label caption>{{ msg.body }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption>{{ msg.time }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>
  </q-page>
</template>

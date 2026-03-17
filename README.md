# Push Notification Demo

A Quasar (Vue 3 + TypeScript) frontend demo for Firebase Cloud Messaging push notifications, integrated with [em-push-notification-service](../em-push-notification-service).

Demonstrates that **different users only receive their own notifications** — login as "alice" and "bob" in two browsers to see it in action.

## Prerequisites

- [em-push-notification-service](../em-push-notification-service) running on `http://localhost:8080`
- PostgreSQL database (used by the notification service to store FCM tokens)
- Chrome browser (recommended for push notification support)

## Setup

```bash
npm install
npm run dev
```

The dev server starts on `http://localhost:3000`.

## How It Works

### Login Page

Enter a **User ID** (e.g. `alice`) and **Display Name**. This is a demo login — no real authentication API is called. A JWT is generated client-side using the `jose` library with the dev `IDENTITY_SECRET`, which the notification service verifies.

### Dashboard

1. **Enable Notifications** — Initializes Firebase Messaging, requests browser permission, retrieves the FCM token, and registers it with the notification service (`POST /register-token`) linked to your User ID.

2. **Send Notification** — Enter a target User ID, title, and body. The notification service looks up all FCM tokens for that user and sends the push notification via Firebase (`POST /send-notification`).

3. **Received Messages** — Foreground messages appear in the list and trigger a native browser notification. Background messages (tab not focused) are handled by the service worker.

4. **Logout** — Unregisters the FCM token (`POST /remove-token`) and returns to the login page.

## Demo: Multi-User Test

1. Start the notification service: `cd ../em-push-notification-service && npm start`
2. Start this demo: `npm run dev`
3. **Browser 1** — Login as `alice`, click "Enable Notifications"
4. **Browser 2** (incognito / different browser) — Login as `bob`, click "Enable Notifications"
5. From Bob's browser, send a notification to User ID `alice` — only Alice receives it
6. From Alice's browser, send a notification to User ID `bob` — only Bob receives it

## Project Structure

```
src/
├── main.ts                    # App entry (Vue + Quasar + Pinia + Router)
├── App.vue                    # Root layout
├── router.ts                  # Routes with login guard
├── pages/
│   ├── LoginPage.vue          # Demo login (userId + username)
│   └── DashboardPage.vue      # Notifications setup, send, and receive
├── stores/
│   └── auth.ts                # Pinia store (JWT generation, auth state)
├── services/
│   └── api.ts                 # API helper (fetch with Bearer auth)
└── css/
    └── app.css
public/
└── firebase-messaging-sw.js   # Service worker for background notifications
```

## API Endpoints Used

All requests include `Authorization: Bearer <jwt>` header.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/register-token` | POST | Register FCM token for a user |
| `/remove-token` | POST | Unregister FCM token on logout |
| `/send-notification` | POST | Send notification to a user by userId |

## Tech Stack

- **Vue 3** + **TypeScript**
- **Quasar Framework** — UI components
- **Pinia** — State management
- **Vue Router** — Navigation with auth guard
- **jose** — Client-side JWT generation (HS256)
- **@rnd-ai-playground/em-libs-firebase-client** — Firebase Cloud Messaging wrapper

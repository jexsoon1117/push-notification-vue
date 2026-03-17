/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyDWEVdHBNuLPhJsYjjz1XPfqDN4YkilFd0',
  authDomain: 'test-project-c7ff2.firebaseapp.com',
  projectId: 'test-project-c7ff2',
  storageBucket: 'test-project-c7ff2.firebasestorage.app',
  messagingSenderId: '733769881498',
  appId: '1:733769881498:web:0d7d8cba4310484c248c23',
  measurementId: 'G-GQMH47ETDZ',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload)

  const title = payload.data?.title ?? payload.notification?.title ?? 'Notification'
  const body = payload.data?.body ?? payload.notification?.body ?? ''

  self.registration.showNotification(title, {
    body,
    icon: '/favicon.ico',
    data: payload.data,
  })
})

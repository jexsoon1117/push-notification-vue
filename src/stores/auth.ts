import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { SignJWT } from 'jose'

const IDENTITY_SECRET = 'dont_tell_anyone_this_top_secret'

export const useAuthStore = defineStore('auth', () => {
  const userId = ref('')
  const username = ref('')
  const jwt = ref('')
  const fcmToken = ref('')

  const isLoggedIn = computed(() => !!jwt.value)

  async function login(id: string, name: string) {
    userId.value = id
    username.value = name

    const secret = new TextEncoder().encode(IDENTITY_SECRET)
    jwt.value = await new SignJWT({ userId: id, username: name })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .sign(secret)
  }

  function logout() {
    userId.value = ''
    username.value = ''
    jwt.value = ''
    fcmToken.value = ''
  }

  return { userId, username, jwt, fcmToken, isLoggedIn, login, logout }
})

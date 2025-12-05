import { ref } from 'vue'
import { useSupabase } from './useSupabase'

export function useAuth() {
  const supabase = useSupabase()

  const user = ref(null)
  const errorMsg = ref('')
  const loading = ref(false)
  const isAuthReady = ref(false)
  const isPasswordRecovery = ref(false)

  let initialized = false

  const register = async ({ full_name, email, password, role }) => {
    loading.value = true
    errorMsg.value = ''

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role, 
        },
      },
    })

    loading.value = false

    if (error) {
      errorMsg.value = error.message
      return false
    }

    return true
  }


  const login = async ({ email, password }) => {
    loading.value = true
    errorMsg.value = ''

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profileError) throw profileError

      user.value = {
        ...data.user,
        role: profile?.role || 'employee',
      }

      return true
    } catch (err) {
      errorMsg.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    user.value = null
    isPasswordRecovery.value = false
  }

  const init = async () => {
    if (initialized) return
    initialized = true

    const url = new URL(window.location.href)

    if (
      url.pathname === '/reset-password' ||
      url.searchParams.get('type') === 'recovery' ||
      window.location.hash.includes('type=recovery')
    ) {
      isPasswordRecovery.value = true
      user.value = null
    }

    if (!isPasswordRecovery.value) {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        user.value = {
          ...session.user,
          role: profile?.role || 'employee',
        }
      }
    }

    isAuthReady.value = true

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        isPasswordRecovery.value = true
        user.value = null
        return
      }

      if (isPasswordRecovery.value) return

      if (event === 'SIGNED_OUT') {
        user.value = null
        return
      }

      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        user.value = {
          ...session.user,
          role: profile?.role || 'employee',
        }
      }
    })
  }

  return {
    user,
    errorMsg,
    loading,
    isAuthReady,
    isPasswordRecovery,
    register,
    login,
    logout,
    init,
  }
}

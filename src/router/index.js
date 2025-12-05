import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'


import AdminLayout from '@/layouts/AdminLayout.vue'
import EmployeeLayout from '@/layouts/EmployeeLayout.vue'

import LoginPage from '@/pages/auth/LoginPage.vue'
import RegisterPage from '@/pages/auth/RegisterPage.vue'
import RecoveryPasswordPage from '@/pages/auth/RecoveryPasswordPage.vue'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage.vue'
import DashboardAdmin from '@/pages/admin/DashboardAdmin.vue'
import AdminHome from '@/pages/admin/AdminHome.vue'
import EmployeesPage from '@/pages/admin/EmployeesPage.vue'
import LinesPage from '@/pages/admin/LinesPage.vue'
import UnitsPage from '@/pages/admin/UnitsPage.vue'
import SchedulePage from '@/pages/admin/SchedulePage.vue'
import CoursesPage from '@/pages/admin/CoursesPage.vue'
import DashboardEmployee from '@/pages/employee/DashboardEmployee.vue'
import MySchedulePage from '@/pages/employee/MySchedulePage.vue'
import MySkillsPage from '@/pages/employee/MySkillsPage.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  { path: '/recovery-password', component: RecoveryPasswordPage },

  { path: '/reset-password', component: ResetPasswordPage, meta: { ignoreSession: true } },

  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', component: DashboardAdmin },
      { path: 'employees', component: EmployeesPage },
      { path: 'lines', component: LinesPage },
      { path: 'units', component: UnitsPage },
      { path: 'schedule', component: SchedulePage },
      { path: 'courses', component: CoursesPage },
    ],
  },

  {
    path: '/employee',
    component: EmployeeLayout,
    children: [
      { path: '', component: DashboardEmployee },
      { path: 'myschedule', component: MySchedulePage },
      { path: 'myskills', component: MySkillsPage },
    ],
  },

  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const { user, isAuthReady, init } = useAuth()

  if (!isAuthReady.value) await init()

  const publicRoutes = ['/login', '/register', '/recovery-password']

  if (to.meta.ignoreSession) return true


  if (to.path.startsWith('/admin') || to.path.startsWith('/employee')) {
    if (!user.value) return '/login'
  }

  if (publicRoutes.includes(to.path) && user.value?.role) {
    return user.value.role === 'admin' ? '/admin' : '/employee'
  }

 
  if (to.path.startsWith('/admin') && user.value.role !== 'admin') return '/employee'

  if (to.path.startsWith('/employee') && user.value.role !== 'employee') return '/admin'

  return true
})

export default router

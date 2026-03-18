import { createRouter, createWebHistory } from 'vue-router'
import { sessionStore } from '@/stores/session'

const routes = [
  {
    path: '/',
    name: 'GuardianHome',
    component: () => import('@/pages/GuardianHome.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/student/:studentId',
    component: () => import('@/pages/StudentDetail.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: to => `/student/${to.params.studentId}/profile` },
      { path: 'attendance', name: 'WardAttendance', component: () => import('@/pages/ward/WardAttendance.vue') },
      { path: 'schedule', name: 'WardSchedule', component: () => import('@/pages/ward/WardSchedule.vue') },
      { path: 'grades', name: 'WardGrades', component: () => import('@/pages/ward/WardGrades.vue') },
      { path: 'fees', name: 'WardFees', component: () => import('@/pages/ward/WardFees.vue') },
      { path: 'report', name: 'WardReport', component: () => import('@/pages/ward/WardReport.vue') },
      { path: 'awards', name: 'WardAwards', component: () => import('@/pages/ward/WardAwards.vue') },
      { path: 'profile', name: 'WardProfile', component: () => import('@/pages/ward/WardProfile.vue') },
    ]
  },
]

const router = createRouter({
  history: createWebHistory('/guardian-dashboard'),
  routes,
})

router.beforeEach((to, from, next) => {
  const session = sessionStore()
  const isAdmin = session.user === 'Administrator' || session.user === 'admin@gmail.com'
  if (isAdmin && to.name !== 'Login') { window.location.href = '/app'; return }
  if (to.meta.requiresAuth && !session.isLoggedIn) next({ name: 'Login' })
  else if (to.name === 'Login' && session.isLoggedIn) next({ name: 'GuardianHome' })
  else next()
})

export default router
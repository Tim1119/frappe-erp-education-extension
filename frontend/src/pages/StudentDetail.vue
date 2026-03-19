<template>
  <div class="portal-wrap">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <!-- School branding -->
      <div class="sidebar-brand">
        <img v-if="schoolInfo.data?.logo" :src="schoolInfo.data.logo" class="brand-logo" />
        <div v-else class="brand-icon">
          <svg viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="7" fill="#1a1a1a"/>
            <path d="M16 6L26 12V20L16 26L6 20V12L16 6Z" stroke="white" stroke-width="1.2" fill="none"/>
            <circle cx="16" cy="16" r="2.5" fill="white"/>
          </svg>
        </div>
        <span v-if="!sidebarCollapsed" class="brand-name">{{ schoolInfo.data?.name || 'Portal' }}</span>
      </div>

      <!-- Student info pill -->
      <!-- Expanded pill -->
<div class="student-pill" v-if="!sidebarCollapsed">
  <div class="pill-avatar">
    <img v-if="wardInfo?.image" :src="wardInfo.image" class="pill-img" />
    <span v-else>{{ initials(wardInfo?.student_name) }}</span>
  </div>
  <div class="pill-info">
    <p class="pill-name">{{ wardInfo?.student_name }}</p>
    <p class="pill-id">{{ wardInfo?.name }}</p>
  </div>
</div>

<!-- Collapsed pill -->
<div class="student-pill-collapsed" v-else>
  <div class="pill-avatar">
    <img v-if="wardInfo?.image" :src="wardInfo.image" class="pill-img" />
    <span v-else>{{ initials(wardInfo?.student_name) }}</span>
  </div>
</div>

      <!-- Nav links -->
      <nav class="sidebar-nav">
        <router-link
          v-for="link in navLinks"
          :key="link.to"
          :to="`/student/${studentId}/${link.to}`"
          class="nav-link"
          :class="{ active: currentSection === link.to }"
        >
          <span class="nav-icon" v-html="link.icon"></span>
          <span v-if="!sidebarCollapsed" class="nav-label">{{ link.label }}</span>
        </router-link>
      </nav>

      <!-- Collapse toggle -->
      <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
        <span v-html="sidebarCollapsed ? expandIcon : collapseIcon"></span>
      </button>
    </aside>

    <!-- Main -->
    <div class="main-wrap">
      <!-- Navbar -->
      <header class="portal-navbar">
        <div class="navbar-left">
          <h2 class="navbar-title">{{ currentLinkLabel }}</h2>
        </div>
        <div class="navbar-right">
          <button class="back-btn" @click="router.push('/')">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            All Children
          </button>
          <button class="signout-btn" @click="session.logout.submit()">Sign Out</button>
        </div>
      </header>

      <!-- Page content -->
      <div class="page-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createResource } from 'frappe-ui'
import { sessionStore } from '@/stores/session'

const route = useRoute()
const router = useRouter()
const session = sessionStore()

const studentId = computed(() => route.params.studentId)
const currentSection = computed(() => route.path.split('/').pop())
// const sidebarCollapsed = ref(false)
const sidebarCollapsed = ref(window.innerWidth < 768)

const schoolInfo = createResource({
  url: 'education.education.api.get_school_abbr_logo',
  auto: true,
})

const wardBasic = createResource({
  url: 'education_extension.guardian.get_linked_students',
  auto: true,
})

const wardInfo = computed(() => {
  if (!wardBasic.data) return null
  return wardBasic.data.find(w => w.name === studentId.value)
})

const navLinks = [
  { to: 'profile', label: 'Profile', icon: `<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>` },
  { to: 'report', label: 'Report Cards', icon: `<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/></svg>` },
  { to: 'attendance', label: 'Attendance', icon: `<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg>` },
  { to: 'schedule', label: 'Schedule', icon: `<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>` },
  { to: 'grades', label: 'Grades', icon: `<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/></svg>` },
  { to: 'fees', label: 'Fees', icon: `<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/><path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd"/></svg>` },
  { to: 'awards', label: 'Awards', icon: `<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>` },
]

const currentLinkLabel = computed(() => {
  return navLinks.find(l => l.to === currentSection.value)?.label || 'Dashboard'
})

const collapseIcon = `<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>`
const expandIcon = `<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>`

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}
</script>

<style scoped>

.pill-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

* { box-sizing: border-box; }

.portal-wrap {
  display: flex;
  height: 100vh;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f5f5f5;
}

/* Sidebar */
.sidebar {
  width: 220px;
  min-width: 220px;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease, min-width 0.25s ease;
  overflow: hidden;
  z-index: 20;
}
.sidebar.collapsed { width: 56px; min-width: 56px; }

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 1rem 0.875rem;
  border-bottom: 1px solid #f3f4f6;
  min-height: 56px;
}
.brand-logo { width: 28px; height: 28px; border-radius: 6px; object-fit: contain; flex-shrink: 0; }
.brand-icon svg { width: 28px; height: 28px; flex-shrink: 0; }
.brand-name { font-size: 0.8125rem; font-weight: 700; color: #111; white-space: nowrap; overflow: hidden; }

.student-pill {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 0.875rem;
  border-bottom: 1px solid #f3f4f6;
  background: #f9fafb;
}
.student-pill-collapsed {
  display: flex;
  justify-content: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
  background: #f9fafb;
}
.pill-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: #4f7cff;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;  /* ← add this */
}

.pill-name { font-size: 0.8125rem; font-weight: 600; color: #111; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pill-id { font-size: 0.7rem; color: #9ca3af; margin: 0; }

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0.5rem;
  gap: 0.125rem;
  overflow-y: auto;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.625rem;
  border-radius: 8px;
  text-decoration: none;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.nav-link:hover { background: #f3f4f6; color: #111; }
.nav-link.active { background: #f0f4ff; color: #4f7cff; }
.nav-icon { display: flex; align-items: center; flex-shrink: 0; }

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border: none;
  border-top: 1px solid #f3f4f6;
  background: none;
  cursor: pointer;
  color: #9ca3af;
  transition: color 0.15s;
}
.collapse-btn:hover { color: #374151; }

/* Main */
.main-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.portal-navbar {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 1.5rem;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.navbar-title { font-size: 1rem; font-weight: 700; color: #111; margin: 0; }
.navbar-right { display: flex; align-items: center; gap: 0.75rem; }

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
  transition: color 0.15s;
}
.back-btn:hover { color: #111; }

.signout-btn {
  padding: 0.4rem 0.875rem;
  background: #f3f4f6;
  border: none;
  border-radius: 7px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.signout-btn:hover { background: #e5e7eb; }

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}
</style>
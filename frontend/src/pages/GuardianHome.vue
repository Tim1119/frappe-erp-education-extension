<template>
  <div class="page-wrap">
    <!-- Header -->
    <header class="page-header">
      <div class="header-left">
        <div class="school-logo" v-if="schoolInfo.data?.logo">
          <img :src="schoolInfo.data.logo" alt="School Logo" />
        </div>
        <div class="school-logo-placeholder" v-else>
          <svg viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="#1a1a1a"/>
            <path d="M20 8L32 15V25L20 32L8 25V15L20 8Z" stroke="white" stroke-width="1.5" fill="none"/>
            <circle cx="20" cy="20" r="3" fill="white"/>
          </svg>
        </div>
        <div>
          <h1 class="page-title">Guardian Portal</h1>
          <p class="page-sub">{{ schoolInfo.data?.name || 'School Management' }}</p>
        </div>
      </div>
      <div class="header-right">
        <span class="user-email">{{ session.user }}</span>
        <button class="signout-btn" @click="session.logout.submit()">
          <svg viewBox="0 0 20 20" fill="currentColor" class="btn-icon">
            <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"/>
          </svg>
          Sign Out
        </button>
      </div>
    </header>

    <!-- Body -->
    <main class="page-body">
      <div class="section-label">Your Children</div>

      <!-- Loading -->
      <div v-if="wards.loading" class="cards-grid">
        <div v-for="i in 2" :key="i" class="ward-card skeleton"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="!wards.data || wards.data.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="#e5e7eb" stroke-width="2"/>
            <path d="M24 14a5 5 0 100 10 5 5 0 000-10zM14 34c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#d1d5db" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="empty-title">No students linked to this account</p>
        <p class="empty-sub">Please contact the school administration to link your children.</p>
      </div>

      <!-- Ward Cards -->
      <div v-else class="cards-grid">
        <div
          v-for="ward in wards.data"
          :key="ward.name"
          class="ward-card"
          @click="router.push(`/student/${ward.name}`)"
        >
          <!-- Avatar -->
          <div class="card-avatar">
            <img v-if="ward.image" :src="ward.image" :alt="ward.student_name" />
            <span v-else class="avatar-initials">{{ initials(ward.student_name) }}</span>
          </div>

          <!-- Info -->
          <div class="card-info">
            <h3 class="card-name">{{ ward.student_name }}</h3>
            <p class="card-id">{{ ward.name }}</p>
            <div class="card-meta" v-if="ward.blood_group">
              <span class="meta-badge">{{ ward.blood_group }}</span>
            </div>
          </div>

          <!-- Arrow -->
          <div class="card-arrow">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>
    </main>

    <footer class="page-footer">Powered by <strong>Rhocom Technology</strong></footer>
  </div>
</template>

<script setup>
import { createResource } from 'frappe-ui'
import { useRouter } from 'vue-router'
import { sessionStore } from '@/stores/session'

const router = useRouter()
const session = sessionStore()

const wards = createResource({
  url: 'education_extension.guardian.get_linked_students',
  auto: true,
})

const schoolInfo = createResource({
  url: 'education.education.api.get_school_abbr_logo',
  auto: true,
})

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}
</script>

<style scoped>
* { box-sizing: border-box; }

.page-wrap {
  min-height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  display: flex;
  flex-direction: column;
}

.page-header {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0.875rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  position: sticky;
  top: 0;
  z-index: 10;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.school-logo img,
.school-logo-placeholder svg {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: contain;
}
.page-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111;
  margin: 0;
  line-height: 1.2;
}
.page-sub {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.user-email {
  font-size: 0.8125rem;
  color: #6b7280;
  display: none;
}
@media (min-width: 640px) { .user-email { display: block; } }

.signout-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.signout-btn:hover { background: #e5e7eb; }
.btn-icon { width: 15px; height: 15px; }

.page-body {
  flex: 1;
  padding: 2rem 1.5rem;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
}
.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 1rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.ward-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s, transform 0.1s;
}
.ward-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  border-color: #d1d5db;
  transform: translateY(-1px);
}
.ward-card.skeleton {
  height: 90px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e9eaec 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  cursor: default;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.card-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #f0f4ff;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-avatar img { width: 100%; height: 100%; object-fit: cover; }
.avatar-initials { font-size: 1.125rem; font-weight: 700; color: #4f7cff; }

.card-info { flex: 1; min-width: 0; }
.card-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #111;
  margin: 0 0 0.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-id { font-size: 0.75rem; color: #9ca3af; margin: 0 0 0.4rem; }
.card-meta { display: flex; gap: 0.375rem; }
.meta-badge {
  font-size: 0.7rem;
  font-weight: 600;
  background: #fef3c7;
  color: #92400e;
  padding: 0.15rem 0.5rem;
  border-radius: 99px;
}

.card-arrow { width: 20px; height: 20px; color: #d1d5db; flex-shrink: 0; }
.ward-card:hover .card-arrow { color: #6b7280; }

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #fff;
  border: 1px dashed #e5e7eb;
  border-radius: 16px;
}
.empty-icon { margin-bottom: 1rem; }
.empty-icon svg { width: 56px; height: 56px; margin: 0 auto; }
.empty-title { font-size: 0.9375rem; font-weight: 600; color: #374151; margin: 0 0 0.375rem; }
.empty-sub { font-size: 0.8125rem; color: #9ca3af; margin: 0; }

.page-footer {
  text-align: center;
  padding: 1.25rem;
  font-size: 0.75rem;
  color: #9ca3af;
}
.page-footer strong { color: #6b7280; font-weight: 500; }
</style>
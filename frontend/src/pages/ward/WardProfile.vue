<template>
  <div class="profile-page">
    <div v-if="data.loading" class="loading"><div class="spinner"></div></div>

    <template v-else-if="data.data">
      <div class="profile-card">

        <!-- Avatar + Name -->
        <div class="profile-hero">
          <div class="avatar-wrap">
            <img
              v-if="data.data.student.image"
              :src="data.data.student.image"
              :alt="data.data.student.student_name"
              class="avatar-img"
            />
            <div v-else class="avatar-fallback">
              {{ initials(data.data.student.student_name) }}
            </div>
          </div>
          <div class="profile-name-wrap">
            <h1 class="profile-name">{{ data.data.student.student_name }}</h1>
            <p class="profile-id">{{ data.data.student.name }}</p>
            <span v-if="data.data.enrollment" class="profile-program-badge">
              {{ data.data.enrollment.program }} · {{ data.data.enrollment.academic_year }}
            </span>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Info Grid -->
        <div class="info-grid">

          <div class="info-section">
            <h2 class="info-section-title">Personal Information</h2>
            <div class="info-rows">
              <div class="info-row" v-if="data.data.student.date_of_birth">
                <span class="info-label">Date of Birth</span>
                <span class="info-value">{{ formatDate(data.data.student.date_of_birth) }}</span>
              </div>
              <div class="info-row" v-if="data.data.student.gender">
                <span class="info-label">Gender</span>
                <span class="info-value">{{ data.data.student.gender }}</span>
              </div>
              <div class="info-row" v-if="data.data.student.blood_group">
                <span class="info-label">Blood Group</span>
                <span class="info-value">
                  <span class="blood-badge">{{ data.data.student.blood_group }}</span>
                </span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h2 class="info-section-title">Academic Information</h2>
            <div class="info-rows">
              <div class="info-row" v-if="data.data.enrollment?.program">
                <span class="info-label">Current Class</span>
                <span class="info-value">{{ data.data.enrollment.program }}</span>
              </div>
              <div class="info-row" v-if="data.data.enrollment?.academic_year">
                <span class="info-label">Academic Year</span>
                <span class="info-value">{{ data.data.enrollment.academic_year }}</span>
              </div>
              <div class="info-row" v-if="data.data.enrollment?.student_batch">
                <span class="info-label">Batch</span>
                <span class="info-value">{{ data.data.enrollment.student_batch }}</span>
              </div>
            </div>
          </div>

        </div>

        <div class="divider"></div>

        <!-- Notice -->
        <div class="notice">
          <svg viewBox="0 0 20 20" fill="currentColor" style="width:16px;height:16px;flex-shrink:0;">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          In case of any incorrect details, please contact the school admin.
        </div>

      </div>
    </template>
  </div>
</template>

<script setup>
import { createResource } from 'frappe-ui'
import { useRoute } from 'vue-router'

const route = useRoute()

const data = createResource({
  url: 'education_extension.guardian.get_ward_details',
  params: { student_id: route.params.studentId },
  auto: true,
})

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}
</script>

<style scoped>
.profile-page { display: flex; flex-direction: column; gap: 1rem; }
.loading { display: flex; justify-content: center; padding: 3rem; }
.spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #1a1a1a; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Card */
.profile-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
}

/* Hero */
.profile-hero {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.75rem 1.75rem 1.5rem;
}

.avatar-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 3px solid #e5e7eb;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-fallback {
  width: 100%;
  height: 100%;
  background: #1a1a1a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.profile-name-wrap { display: flex; flex-direction: column; gap: 0.3rem; }
.profile-name { font-size: 1.375rem; font-weight: 700; color: #111; margin: 0; }
.profile-id { font-size: 0.8125rem; color: #9ca3af; margin: 0; }
.profile-program-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.625rem;
  border-radius: 99px;
  background: #f0f4ff;
  color: #1d4ed8;
  width: fit-content;
}

.divider { height: 1px; background: #f3f4f6; }

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}
@media (max-width: 600px) {
  .info-grid { grid-template-columns: 1fr; }
}

.info-section {
  padding: 1.5rem 1.75rem;
  border-right: 1px solid #f3f4f6;
}
.info-section:last-child { border-right: none; }

.info-section-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 1rem;
}

.info-rows { display: flex; flex-direction: column; gap: 0.875rem; }

.info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-label {
  width: 45%;
  font-size: 0.8125rem;
  color: #6b7280;
  flex-shrink: 0;
}

.info-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111;
}

.blood-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  background: #fef2f2;
  color: #991b1b;
}

/* Notice */
.notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  background: #f9fafb;
  font-size: 0.8125rem;
  color: #6b7280;
}
</style>
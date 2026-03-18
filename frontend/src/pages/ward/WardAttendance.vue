<template>
  <div class="ward-page">
    <div v-if="data.loading" class="loading"><div class="spinner"></div></div>
    <template v-else-if="data.data">

      <!-- Summary cards -->
      <div class="stats-grid">
        <div class="stat-card green">
          <span class="stat-val">{{ data.data.summary.present }}</span>
          <span class="stat-lbl">Present</span>
        </div>
        <div class="stat-card red">
          <span class="stat-val">{{ data.data.summary.absent }}</span>
          <span class="stat-lbl">Absent</span>
        </div>
        <div class="stat-card orange">
          <span class="stat-val">{{ data.data.summary.on_leave }}</span>
          <span class="stat-lbl">On Leave</span>
        </div>
        <div class="stat-card dark">
          <span class="stat-val">{{ data.data.summary.percentage }}%</span>
          <span class="stat-lbl">Rate</span>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="progress-section">
        <div class="progress-track">
          <div
            class="progress-fill"
            :style="{ width: data.data.summary.percentage + '%' }"
            :class="{
              green: data.data.summary.percentage >= 75,
              orange: data.data.summary.percentage >= 50 && data.data.summary.percentage < 75,
              red: data.data.summary.percentage < 50
            }"
          ></div>
        </div>
        <p class="progress-note">Based on last {{ data.data.summary.total }} school days</p>
      </div>

      <!-- Attendance Calendar -->
      <div class="cal-wrap">
        <VCalendar expanded :first-day-of-week="1" :attributes="[]">
          <template #day-content="{ day }">
            <div class="a-day" :class="{ 'a-day--out': !day.inMonth }">
              <span class="a-day__num">{{ day.day }}</span>
              <div v-if="getRecord(day.date)" class="a-dot-wrap">
                <span class="a-dot" :class="dotClass(getRecord(day.date).status)"></span>
                <span class="a-label" :class="labelClass(getRecord(day.date).status)">
                  {{ getRecord(day.date).status }}
                </span>
              </div>
            </div>
          </template>
        </VCalendar>
      </div>

    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { createResource } from 'frappe-ui'
import { useRoute } from 'vue-router'
import { Calendar as VCalendar } from 'v-calendar'
import 'v-calendar/dist/style.css'

const route = useRoute()
const data = createResource({
  url: 'education_extension.guardian.get_ward_attendance',
  params: { student_id: route.params.studentId },
  auto: true,
})

const recordsByDate = computed(() => {
  const map = {}
  if (!data.data?.records) return map
  data.data.records.forEach(r => {
    const key = new Date(r.date).toISOString().split('T')[0]
    map[key] = r
  })
  return map
})

function getRecord(date) {
  const key = new Date(date).toISOString().split('T')[0]
  return recordsByDate.value[key] || null
}

function dotClass(status) {
  return {
    Present: 'dot-green',
    Absent:  'dot-red',
    Leave:   'dot-orange',
  }[status] || 'dot-gray'
}

function labelClass(status) {
  return {
    Present: 'lbl-green',
    Absent:  'lbl-red',
    Leave:   'lbl-orange',
  }[status] || 'lbl-gray'
}
</script>

<style scoped>
.ward-page { display: flex; flex-direction: column; gap: 1.25rem; }
.loading { display: flex; justify-content: center; padding: 3rem; }
.spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #1a1a1a; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
@media (max-width: 500px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
.stat-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
.stat-card.dark { background: #1a1a1a; border-color: #1a1a1a; }
.stat-card.dark .stat-val, .stat-card.dark .stat-lbl { color: #fff; }
.stat-val { font-size: 1.5rem; font-weight: 700; color: #111; }
.stat-lbl { font-size: 0.7rem; font-weight: 500; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; }
.stat-card.green .stat-val { color: #16a34a; }
.stat-card.red .stat-val { color: #dc2626; }
.stat-card.orange .stat-val { color: #ea580c; }

/* Progress */
.progress-section { display: flex; flex-direction: column; gap: 0.5rem; }
.progress-track { height: 10px; background: #f3f4f6; border-radius: 99px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 99px; transition: width 0.6s ease; }
.progress-fill.green { background: #22c55e; }
.progress-fill.orange { background: #f97316; }
.progress-fill.red { background: #ef4444; }
.progress-note { font-size: 0.75rem; color: #9ca3af; margin: 0; }

/* Calendar wrap */
.cal-wrap { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }

.cal-wrap :deep(.vc-container) {
  width: 100% !important; max-width: 100% !important;
  border: none !important; border-radius: 0 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.cal-wrap :deep(.vc-pane-container),
.cal-wrap :deep(.vc-pane) { width: 100% !important; }

.cal-wrap :deep(.vc-header) {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem; border-bottom: 1px solid #e5e7eb;
}
.cal-wrap :deep(.vc-title) {
  font-size: 1rem; font-weight: 700; color: #111827;
  flex: 1; text-align: center; pointer-events: none;
}
.cal-wrap :deep(.vc-arrow) {
  border-radius: 8px; width: 32px; height: 32px;
  flex-shrink: 0; background: #f3f4f6;
}
.cal-wrap :deep(.vc-arrow:hover) { background: #e5e7eb; }

.cal-wrap :deep(.vc-weekdays) { border-bottom: 1px solid #e5e7eb; }
.cal-wrap :deep(.vc-weekday) {
  font-size: 0.75rem; font-weight: 600; color: #6b7280;
  padding: 0.5rem 0; text-align: center;
  border-right: 1px solid #e5e7eb;
}
.cal-wrap :deep(.vc-weekday:last-child) { border-right: none; }

.cal-wrap :deep(.vc-weeks) { padding: 0; border-left: 1px solid #e5e7eb; }
.cal-wrap :deep(.vc-day) {
  min-height: 80px; border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb; padding: 0 !important; overflow: hidden;
}
.cal-wrap :deep(.vc-day-content),
.cal-wrap :deep(.vc-highlights) { display: none !important; }

/* Day cell */
.a-day {
  display: flex; flex-direction: column; align-items: center;
  height: 100%; min-height: 80px; padding: 6px 4px 8px;
  box-sizing: border-box; background: #fff;
}
.a-day--out { background: #fafafa; }
.a-day--out .a-day__num { color: #d1d5db; }

.a-day__num {
  font-size: 0.75rem; font-weight: 600; color: #9ca3af;
  align-self: flex-end; padding-right: 4px; line-height: 1; margin-bottom: 6px;
}

.a-dot-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1;
  justify-content: center;
}

.a-dot {
  width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
}
.dot-green  { background: #22c55e; }
.dot-red    { background: #ef4444; }
.dot-orange { background: #f97316; }
.dot-gray   { background: #d1d5db; }

.a-label {
  font-size: 0.6rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.03em; white-space: nowrap;
}
.lbl-green  { color: #16a34a; }
.lbl-red    { color: #dc2626; }
.lbl-orange { color: #ea580c; }
.lbl-gray   { color: #9ca3af; }

@media (max-width: 640px) {
  .cal-wrap :deep(.vc-day) { min-height: 52px; }
  .a-day { min-height: 52px; padding: 4px 2px; }
  .a-day__num { font-size: 0.65rem; }
  .a-label { display: none; }
}
</style>
<template>
  <div class="g-cal">
    <VCalendar expanded :first-day-of-week="1" :attributes="[]">
      <template #day-content="{ day, dayEvents }">
        <div class="g-day" :class="{ 'g-day--out': !day.inMonth }">
          <span class="g-day__num">{{ day.day }}</span>
          <div class="g-events">
            <CalendarEvent
              v-for="event in getEventsForDay(day.date)"
              :key="event.name"
              :event="event"
              :date="day.date"
            />
          </div>
        </div>
      </template>
    </VCalendar>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Calendar as VCalendar } from 'v-calendar'
import 'v-calendar/dist/style.css'
import CalendarEvent from '@/components/CalendarEvent.vue'

const props = defineProps({
  events: { type: Array, default: () => [] }
})

const eventsByDate = computed(() => {
  const map = {}
  props.events.forEach(event => {
    const raw = event.date || event.schedule_date
    if (!raw) return
    const key = new Date(raw).toISOString().split('T')[0]
    if (!map[key]) map[key] = []
    map[key].push(event)
  })
  return map
})

function getEventsForDay(date) {
  const key = new Date(date).toISOString().split('T')[0]
  return eventsByDate.value[key] || []
}
</script>

<style scoped>
/* ── Container ── */
.g-cal { width: 100%; height: 100%; }

.g-cal :deep(.vc-container) {
  width: 100% !important;
  max-width: 100% !important;
  border: none !important;
  border-radius: 0 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.g-cal :deep(.vc-pane-container),
.g-cal :deep(.vc-pane) { width: 100% !important; }

/* ── Header ── */
.g-cal :deep(.vc-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}
.g-cal :deep(.vc-title) {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  flex: 1;
  text-align: center;
  pointer-events: none;
}
.g-cal :deep(.vc-arrow) {
  border-radius: 8px;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  background: #f3f4f6;
}
.g-cal :deep(.vc-arrow:hover) { background: #e5e7eb; }

/* ── Weekdays ── */
.g-cal :deep(.vc-weekdays) { border-bottom: 1px solid #e5e7eb; }
.g-cal :deep(.vc-weekday) {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  padding: 0.5rem 0;
  text-align: center;
  border-right: 1px solid #e5e7eb;
}
.g-cal :deep(.vc-weekday:last-child) { border-right: none; }

/* ── Grid ── */
.g-cal :deep(.vc-weeks) {
  padding: 0;
  border-left: 1px solid #e5e7eb;
}
.g-cal :deep(.vc-day) {
  min-height: 110px;
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 !important;
  overflow: hidden;
}
/* hide default day number & highlight — we render our own */
.g-cal :deep(.vc-day-content),
.g-cal :deep(.vc-highlights) { display: none !important; }

/* ── Custom day cell ── */
.g-day {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 110px;
  padding: 4px;
  box-sizing: border-box;
  background: #fff;
}
.g-day--out { background: #fafafa; }
.g-day--out .g-day__num { color: #d1d5db; }

.g-day__num {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-align: right;
  padding: 2px 4px 4px 0;
  line-height: 1;
  flex-shrink: 0;
}

/* ── Events list — scrollable ── */
.g-events {
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow-y: auto;
  flex: 1;
  scrollbar-width: none;
}
.g-events::-webkit-scrollbar { display: none; }

/* ── Event pill (override CalendarEvent card styles via deep) ── */
.g-cal :deep(.g-events > div > div:first-child) {
  /* the Popover target wrapper */
  margin-bottom: 0 !important;
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .g-cal :deep(.vc-day) { min-height: 64px; }
  .g-day { min-height: 64px; }
  .g-day__num { font-size: 0.65rem; }
}
</style>
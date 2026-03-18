<template>
  <div class="ward-page">
    <div v-if="data.loading" class="loading"><div class="spinner"></div></div>

    <template v-else-if="data.data">
      <div v-if="!data.data.results?.length" class="empty-card">
        No grades found.
      </div>

      <template v-else>
        <!-- Program dropdown -->
        <div class="dropdown-wrap" ref="dropdownRef">
          <button class="dropdown-btn" @click.stop="toggleDropdown">
            {{ selectedProgram || 'Select Program' }}
            <svg viewBox="0 0 20 20" fill="currentColor" class="chevron" :class="{ open: dropdownOpen }">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>

          <Teleport to="body">
            <div
              v-if="dropdownOpen"
              class="grades-dropdown-menu"
              :style="menuStyle"
              @click.stop
            >
              <button
                v-for="p in data.data.programs"
                :key="p.program"
                class="grades-dropdown-item"
                :class="{ active: selectedProgram === p.program }"
                @click="selectedProgram = p.program; dropdownOpen = false"
              >
                {{ p.program }}
              </button>
            </div>
          </Teleport>
        </div>

        <!-- Grades table -->
        <div class="table-wrap">
          <table class="grades-table">
            <thead>
              <tr>
                <th class="th-course">Course</th>
                <th class="th-batch">Batch</th>
                <th v-for="term in terms" :key="term" class="th-term">{{ term }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in tableRows" :key="row.course">
                <td class="td-course">{{ row.course }}</td>
                <td class="td-batch">{{ row.batch }}</td>
                <td v-for="term in terms" :key="term" class="td-score">
                  <span class="score-badge" :class="scoreClass(row[term])">
                    {{ row[term] || '–' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { createResource } from 'frappe-ui'
import { useRoute } from 'vue-router'

const route = useRoute()
const dropdownOpen = ref(false)
const selectedProgram = ref('')
const dropdownRef = ref(null)
const menuStyle = ref({})

const data = createResource({
  url: 'education_extension.guardian.get_ward_grades_table',
  params: { student_id: route.params.studentId },
  auto: true,
  onSuccess(d) {
    if (d.programs?.length) {
      selectedProgram.value = d.programs[d.programs.length - 1].program
    }
  }
})

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
  if (dropdownOpen.value) {
    nextTick(() => {
      const rect = dropdownRef.value?.getBoundingClientRect()
      if (rect) {
        menuStyle.value = {
          position: 'fixed',
          top: rect.bottom + 4 + 'px',
          left: rect.left + 'px',
          minWidth: rect.width + 'px',
          zIndex: 9999,
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }
      }
    })
  }
}

function closeDropdown(e) {
  if (!dropdownRef.value?.contains(e.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', closeDropdown))
onBeforeUnmount(() => document.removeEventListener('click', closeDropdown))

// Filter results by selected program
const filteredResults = computed(() => {
  if (!data.data?.results) return []
  if (!selectedProgram.value) return data.data.results
  return data.data.results.filter(r => r.program === selectedProgram.value)
})

// Term sort order
const termOrder = { 'first': 1, 'second': 2, 'third': 3 }

function getTermOrder(term) {
  const lower = term.toLowerCase()
  const match = Object.keys(termOrder).find(k => lower.includes(k))
  return match ? termOrder[match] : 99
}

// Get unique assessment groups sorted First → Second → Third
const terms = computed(() => {
  const seen = new Set()
  filteredResults.value.forEach(r => seen.add(r.assessment_group))
  return [...seen].sort((a, b) => getTermOrder(a) - getTermOrder(b))
})

// Build rows grouped by course
const tableRows = computed(() => {
  const byCourse = {}
  filteredResults.value.forEach(r => {
    if (!byCourse[r.course]) {
      byCourse[r.course] = { course: r.course, batch: r.student_group }
    }
    byCourse[r.course][r.assessment_group] = `${r.total_score}/${r.maximum_score}`
  })
  return Object.values(byCourse)
})

function scoreClass(score) {
  if (!score || score === '–') return 'score-empty'
  const [got, max] = score.split('/').map(Number)
  const pct = (got / max) * 100
  if (pct >= 70) return 'score-good'
  if (pct >= 50) return 'score-mid'
  return 'score-low'
}
</script>

<style scoped>
.ward-page { display: flex; flex-direction: column; gap: 1rem; }
.loading { display: flex; justify-content: center; padding: 3rem; }
.spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #1a1a1a; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 2.5rem; text-align: center; color: #9ca3af; font-size: 0.875rem; }

/* Dropdown */
.dropdown-wrap { position: relative; display: inline-block; }
.dropdown-btn {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
  font-size: 0.875rem; font-weight: 500; color: #374151;
  cursor: pointer; font-family: inherit;
  transition: border-color 0.15s;
}
.dropdown-btn:hover { border-color: #d1d5db; }
.chevron { width: 16px; height: 16px; transition: transform 0.15s; flex-shrink: 0; }
.chevron.open { transform: rotate(180deg); }

/* Table */
.table-wrap {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
  overflow: auto;
}
.grades-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.grades-table th {
  background: #f9fafb; padding: 0.75rem 1rem;
  text-align: left; font-size: 0.75rem; font-weight: 600;
  color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em;
  border-bottom: 1px solid #e5e7eb; white-space: nowrap;
}
.grades-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
}
.grades-table tr:last-child td { border-bottom: none; }
.grades-table tr:hover td { background: #f9fafb; }
.th-course, .td-course { min-width: 160px; font-weight: 600; color: #111; }
.th-batch, .td-batch { min-width: 140px; color: #6b7280; font-size: 0.8125rem; }
.th-term, .td-score { min-width: 120px; text-align: center; }
.th-term { text-align: center; }

.score-badge {
  display: inline-block; padding: 0.2rem 0.625rem;
  border-radius: 6px; font-size: 0.8125rem; font-weight: 600;
}
.score-good  { background: #f0fdf4; color: #166534; }
.score-mid   { background: #fefce8; color: #854d0e; }
.score-low   { background: #fef2f2; color: #991b1b; }
.score-empty { background: #f3f4f6; color: #9ca3af; }
</style>

<!-- Global styles for teleported dropdown -->
<style>
.grades-dropdown-menu {
  position: fixed;
  z-index: 9999;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  overflow: hidden;
}
.grades-dropdown-item {
  display: block; width: 100%; padding: 0.625rem 0.875rem;
  font-size: 0.875rem; color: #374151; background: none; border: none;
  cursor: pointer; text-align: left; font-family: inherit;
  transition: background 0.1s;
}
.grades-dropdown-item:hover { background: #f9fafb; }
.grades-dropdown-item.active { background: #f0f4ff; color: #1d4ed8; font-weight: 600; }
</style>
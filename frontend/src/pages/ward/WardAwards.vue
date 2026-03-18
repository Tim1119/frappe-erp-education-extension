<template>
  <div class="awards-page">

    <!-- Individual Awards Section -->
    <div class="section">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Individual Awards</h1>
          <p class="page-sub">Personal certificates and recognition</p>
        </div>
        <button class="btn-refresh" @click="data.reload()" :disabled="data.loading">
          <svg viewBox="0 0 20 20" fill="currentColor" :class="{ spinning: data.loading }">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
          </svg>
          Refresh
        </button>
      </div>

      <!-- Filters -->
      <div class="filter-card">
        <h2 class="filter-title">Filter Awards</h2>
        <div class="filter-grid">

          <div class="filter-field">
            <label class="filter-label">Year</label>
            <div class="filter-dropdown-wrap" ref="yearRef">
              <button class="filter-btn" @click.stop="toggleFilter('year')">
                {{ filterYear || 'All Years' }}
                <svg viewBox="0 0 20 20" fill="currentColor" class="chevron" :class="{ open: openFilter === 'year' }">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </button>
              <Teleport to="body">
                <div v-if="openFilter === 'year'" class="award-filter-menu" :style="filterMenuStyle" @click.stop>
                  <button class="award-filter-item" :class="{ active: !filterYear }" @click="filterYear = ''; openFilter = null">All Years</button>
                  <button v-for="y in yearOptions" :key="y" class="award-filter-item" :class="{ active: filterYear === y }" @click="filterYear = y; openFilter = null">{{ y }}</button>
                </div>
              </Teleport>
            </div>
          </div>

          <div class="filter-field">
            <label class="filter-label">Category</label>
            <div class="filter-dropdown-wrap" ref="catRef">
              <button class="filter-btn" @click.stop="toggleFilter('cat')">
                {{ filterCategory || 'All Categories' }}
                <svg viewBox="0 0 20 20" fill="currentColor" class="chevron" :class="{ open: openFilter === 'cat' }">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </button>
              <Teleport to="body">
                <div v-if="openFilter === 'cat'" class="award-filter-menu" :style="filterMenuStyle" @click.stop>
                  <button class="award-filter-item" :class="{ active: !filterCategory }" @click="filterCategory = ''; openFilter = null">All Categories</button>
                  <button v-for="c in categoryOptions" :key="c" class="award-filter-item" :class="{ active: filterCategory === c }" @click="filterCategory = c; openFilter = null">{{ c }}</button>
                </div>
              </Teleport>
            </div>
          </div>

          <div class="filter-field filter-clear">
            <button class="btn-clear" @click="clearFilters">
              <svg viewBox="0 0 20 20" fill="currentColor" style="width:16px;height:16px;">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              Clear Filters
            </button>
          </div>

        </div>
      </div>

      <!-- Loading -->
      <div v-if="data.loading" class="loading">
        <div class="spinner"></div>
        <p>Loading awards...</p>
      </div>

      <!-- Individual Awards Grid -->
      <div v-else-if="filteredIndividual.length > 0" class="awards-grid">
        <div v-for="award in filteredIndividual" :key="award.name" class="award-card">
          <div class="award-icon">🏅</div>
          <div class="award-body">
            <h3 class="award-title">{{ award.certificate_title }}</h3>
            <p v-if="award.certificate_date" class="award-date">{{ formatDate(award.certificate_date) }}</p>
           <p v-if="award.description" class="award-desc">{{ stripHtml(award.description) }}</p>
            <div class="award-footer">
              <span v-if="award.certificate_type" class="award-badge">{{ award.certificate_type }}</span>
              <span v-if="award.academic_year" class="award-year">{{ award.academic_year }}</span>
              <a v-if="award.certificate_file" :href="award.certificate_file" target="_blank" class="btn-download">
                ↓ Certificate
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Individual -->
      <div v-else-if="!data.loading" class="empty-card">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:48px;height:48px;color:#d1d5db;margin:0 auto 1rem;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"/>
        </svg>
        <h3 class="empty-title">No Individual Awards Found</h3>
        <p class="empty-sub">{{ hasFilters ? 'No awards match your filters.' : 'No individual awards yet.' }}</p>
        <button v-if="hasFilters" class="btn-clear" style="margin:0 auto;" @click="clearFilters">Clear Filters</button>
      </div>

    </div>

    <!-- General Awards Section -->
    <div class="section" v-if="!data.loading && data.data?.general?.length">
      <div class="section-header">
        <h2 class="section-title">General Awards</h2>
        <p class="section-sub">Class and group certificates</p>
      </div>
      <div class="awards-grid">
        <div v-for="award in data.data.general" :key="award.name" class="award-card general">
          <div class="award-icon">🎖️</div>
          <div class="award-body">
            <h3 class="award-title">{{ award.certificate_title }}</h3>
            <p v-if="award.certificate_date" class="award-date">{{ formatDate(award.certificate_date) }}</p>
           <p v-if="award.description" class="award-desc">{{ stripHtml(award.description) }}</p>
            <div class="award-footer">
              <span v-if="award.certificate_type" class="award-badge general-badge">{{ award.certificate_type }}</span>
              <span v-if="award.student_group" class="award-year">{{ award.student_group }}</span>
              <a v-if="award.certificate_file" :href="award.certificate_file" target="_blank" class="btn-download">
                ↓ Certificate
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { createResource } from 'frappe-ui'
import { useRoute } from 'vue-router'

const route = useRoute()

const data = createResource({
  url: 'education_extension.guardian.get_ward_awards',
  params: { student_id: route.params.studentId },
  auto: true,
})

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}

// Filters
const filterYear = ref('')
const filterCategory = ref('')
const openFilter = ref(null)
const filterMenuStyle = ref({})
const yearRef = ref(null)
const catRef = ref(null)
const refMap = { year: yearRef, cat: catRef }

function toggleFilter(key) {
  if (openFilter.value === key) { openFilter.value = null; return }
  openFilter.value = key
  nextTick(() => {
    const el = refMap[key].value?.querySelector('.filter-btn')
    if (!el) return
    const rect = el.getBoundingClientRect()
    filterMenuStyle.value = {
      position: 'fixed',
      top: rect.bottom + 4 + 'px',
      left: rect.left + 'px',
      minWidth: rect.width + 'px',
      zIndex: 9999,
    }
  })
}

function closeFilters(e) {
  const refs = [yearRef, catRef]
  if (!refs.some(r => r.value?.contains(e.target))) openFilter.value = null
}

onMounted(() => document.addEventListener('click', closeFilters))
onBeforeUnmount(() => document.removeEventListener('click', closeFilters))

const individual = computed(() => data.data?.individual || [])

const yearOptions = computed(() =>
  [...new Set(individual.value.map(a => a.academic_year).filter(Boolean))].sort().reverse()
)

const categoryOptions = computed(() =>
  [...new Set(individual.value.map(a => a.certificate_type).filter(Boolean))].sort()
)

const hasFilters = computed(() => filterYear.value || filterCategory.value)

function clearFilters() {
  filterYear.value = ''
  filterCategory.value = ''
}

const filteredIndividual = computed(() => {
  return individual.value.filter(a =>
    (!filterYear.value || a.academic_year === filterYear.value) &&
    (!filterCategory.value || a.certificate_type === filterCategory.value)
  )
})

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.awards-page { display: flex; flex-direction: column; gap: 1.5rem; }
.section { display: flex; flex-direction: column; gap: 1rem; }

/* Header */
.page-header { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem 1.5rem; display: flex; align-items: center; justify-content: space-between; }
.page-title { font-size: 1.375rem; font-weight: 700; color: #111; margin: 0 0 0.25rem; }
.page-sub { font-size: 0.875rem; color: #6b7280; margin: 0; }
.btn-refresh { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8125rem; font-weight: 600; padding: 0.4rem 0.875rem; border-radius: 8px; border: 1px solid #e5e7eb; background: #fff; color: #374151; cursor: pointer; }
.btn-refresh svg { width: 14px; height: 14px; }
.btn-refresh:hover { background: #f9fafb; }
.spinning { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Filters */
.filter-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem 1.5rem; }
.filter-title { font-size: 0.9375rem; font-weight: 600; color: #111; margin: 0 0 1rem; }
.filter-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
@media (max-width: 640px) { .filter-grid { grid-template-columns: 1fr; } }
.filter-field { display: flex; flex-direction: column; gap: 0.5rem; }
.filter-clear { justify-content: flex-end; }
.filter-label { font-size: 0.8125rem; font-weight: 500; color: #374151; }
.filter-dropdown-wrap { position: relative; }
.filter-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.5rem 0.875rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; font-weight: 500; color: #374151; cursor: pointer; font-family: inherit; }
.filter-btn:hover { border-color: #d1d5db; }
.chevron { width: 16px; height: 16px; flex-shrink: 0; transition: transform 0.15s; }
.chevron.open { transform: rotate(180deg); }
.btn-clear { display: flex; align-items: center; justify-content: center; gap: 0.4rem; width: 100%; padding: 0.5rem 0.875rem; font-size: 0.875rem; font-weight: 500; color: #374151; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; font-family: inherit; margin-top: auto; }
.btn-clear:hover { background: #f9fafb; }

/* Loading */
.loading { display: flex; flex-direction: column; align-items: center; padding: 3rem; gap: 1rem; color: #6b7280; font-size: 0.875rem; }
.spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #1a1a1a; border-radius: 50%; animation: spin 0.7s linear infinite; }

/* Section headers */
.section-header { padding: 0 0.25rem; }
.section-title { font-size: 1.125rem; font-weight: 700; color: #111; margin: 0 0 0.25rem; }
.section-sub { font-size: 0.8125rem; color: #6b7280; margin: 0; }

/* Awards Grid */
.awards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
@media (max-width: 1024px) { .awards-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .awards-grid { grid-template-columns: 1fr; } }

/* Award Card */
.award-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; display: flex; gap: 1rem; transition: box-shadow 0.2s; }
.award-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.award-card.general { border-left: 3px solid #8b5cf6; }
.award-icon { font-size: 1.75rem; flex-shrink: 0; }
.award-body { display: flex; flex-direction: column; gap: 0.375rem; flex: 1; min-width: 0; }
.award-title { font-size: 0.9375rem; font-weight: 700; color: #111; margin: 0; }
.award-date { font-size: 0.8rem; color: #9ca3af; margin: 0; }
.award-desc { font-size: 0.8125rem; color: #6b7280; margin: 0; line-height: 1.5; }
.award-footer { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.25rem; padding-top: 0.75rem; border-top: 1px solid #f3f4f6; }
.award-badge { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 99px; background: #fef3c7; color: #92400e; }
.general-badge { background: #ede9fe; color: #6d28d9; }
.award-year { font-size: 0.75rem; color: #9ca3af; margin-left: auto; }
.btn-download { font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.625rem; border-radius: 6px; border: 1px solid #e5e7eb; background: #fff; color: #374151; text-decoration: none; cursor: pointer; transition: background 0.15s; }
.btn-download:hover { background: #111; color: #fff; border-color: #111; }

/* Empty */
.empty-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 3rem; text-align: center; }
.empty-title { font-size: 1rem; font-weight: 600; color: #374151; margin: 0 0 0.5rem; }
.empty-sub { font-size: 0.875rem; color: #9ca3af; margin: 0 0 1rem; }
</style>

<!-- Global styles for teleported menus -->
<style>
.award-filter-menu {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  overflow: hidden;
  z-index: 9999;
}
.award-filter-item {
  display: block; width: 100%; padding: 0.625rem 0.875rem;
  font-size: 0.875rem; color: #374151; background: none; border: none;
  cursor: pointer; text-align: left; font-family: inherit;
  transition: background 0.1s;
}
.award-filter-item:hover { background: #f9fafb; }
.award-filter-item.active { background: #f0f4ff; color: #1d4ed8; font-weight: 600; }
</style>
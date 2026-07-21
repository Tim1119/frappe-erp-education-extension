<template>
	<div class="report-page">
		<!-- Page Header -->
		<div class="page-header">
			<div>
				<h1 class="page-title">Academic Reports</h1>
				<p class="page-sub">View and download term reports</p>
			</div>
			<button class="btn-refresh" @click="data.reload()" :disabled="data.loading">
				<svg viewBox="0 0 20 20" fill="currentColor" :class="{ spinning: data.loading }">
					<path
						fill-rule="evenodd"
						d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
						clip-rule="evenodd"
					/>
				</svg>
				Refresh
			</button>
		</div>

		<!-- Filters -->
		<div class="filter-card">
			<h2 class="filter-title">Filter Reports</h2>
			<div class="filter-grid">
				<!-- Class -->
				<div class="filter-field">
					<label class="filter-label">Class</label>
					<div class="filter-dropdown-wrap" ref="classRef">
						<button class="filter-btn" @click.stop="toggleFilter('class')">
							{{ filterProgram || 'All Classes' }}
							<svg
								viewBox="0 0 20 20"
								fill="currentColor"
								class="chevron"
								:class="{ open: openFilter === 'class' }"
							>
								<path
									fill-rule="evenodd"
									d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
						<Teleport to="body">
							<div
								v-if="openFilter === 'class'"
								class="report-filter-menu"
								:style="filterMenuStyle"
								@click.stop
							>
								<button
									class="report-filter-item"
									:class="{ active: !filterProgram }"
									@click="
										filterProgram = ''
										openFilter = null
									"
								>
									All Classes
								</button>
								<button
									v-for="p in programOptions"
									:key="p"
									class="report-filter-item"
									:class="{ active: filterProgram === p }"
									@click="
										filterProgram = p
										openFilter = null
									"
								>
									{{ p }}
								</button>
							</div>
						</Teleport>
					</div>
				</div>

				<!-- Academic Year -->
				<div class="filter-field">
					<label class="filter-label">Academic Year</label>
					<div class="filter-dropdown-wrap" ref="yearRef">
						<button class="filter-btn" @click.stop="toggleFilter('year')">
							{{ filterYear || 'All Years' }}
							<svg
								viewBox="0 0 20 20"
								fill="currentColor"
								class="chevron"
								:class="{ open: openFilter === 'year' }"
							>
								<path
									fill-rule="evenodd"
									d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
						<Teleport to="body">
							<div
								v-if="openFilter === 'year'"
								class="report-filter-menu"
								:style="filterMenuStyle"
								@click.stop
							>
								<button
									class="report-filter-item"
									:class="{ active: !filterYear }"
									@click="
										filterYear = ''
										openFilter = null
									"
								>
									All Years
								</button>
								<button
									v-for="y in yearOptions"
									:key="y"
									class="report-filter-item"
									:class="{ active: filterYear === y }"
									@click="
										filterYear = y
										openFilter = null
									"
								>
									{{ y }}
								</button>
							</div>
						</Teleport>
					</div>
				</div>

				<!-- Term -->
				<div class="filter-field">
					<label class="filter-label">Term</label>
					<div class="filter-dropdown-wrap" ref="termRef">
						<button class="filter-btn" @click.stop="toggleFilter('term')">
							{{ filterTerm || 'All Terms' }}
							<svg
								viewBox="0 0 20 20"
								fill="currentColor"
								class="chevron"
								:class="{ open: openFilter === 'term' }"
							>
								<path
									fill-rule="evenodd"
									d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
						<Teleport to="body">
							<div
								v-if="openFilter === 'term'"
								class="report-filter-menu"
								:style="filterMenuStyle"
								@click.stop
							>
								<button
									class="report-filter-item"
									:class="{ active: !filterTerm }"
									@click="
										filterTerm = ''
										openFilter = null
									"
								>
									All Terms
								</button>
								<button
									v-for="t in termOptions"
									:key="t"
									class="report-filter-item"
									:class="{ active: filterTerm === t }"
									@click="
										filterTerm = t
										openFilter = null
									"
								>
									{{ t }}
								</button>
							</div>
						</Teleport>
					</div>
				</div>

				<!-- Clear -->
				<div class="filter-field filter-clear">
					<button class="btn-clear" @click="clearFilters">
						<svg
							viewBox="0 0 20 20"
							fill="currentColor"
							style="width: 16px; height: 16px"
						>
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clip-rule="evenodd"
							/>
						</svg>
						Clear Filters
					</button>
				</div>
			</div>
		</div>

		<!-- Loading -->
		<div v-if="data.loading" class="loading">
			<div class="spinner"></div>
			<p>Loading reports...</p>
		</div>

		<!-- Reports Grid -->
		<div v-else-if="filteredReports.length > 0" class="reports-grid">
			<div v-for="report in filteredReports" :key="report.name" class="report-card">
				<!-- Card Header -->
				<div class="card-header">
					<h3 class="card-title">
						{{ report.academic_year }} · {{ report.assessment_group }} ·
						{{ report.program }}
					</h3>
					<p class="card-sub">{{ report.academic_term }}</p>
				</div>

				<!-- Progress -->
				<div v-if="report.total_marks_obtained" class="card-progress">
					<div class="progress-row">
						<span class="progress-label">Total Score</span>
						<span class="progress-value"
							>{{ report.total_marks_obtained }}/{{ report.total_max_marks }}</span
						>
					</div>
					<div class="progress-track">
						<div
							class="progress-fill"
							:class="
								progressClass(report.total_marks_obtained, report.total_max_marks)
							"
							:style="{
								width:
									pct(report.total_marks_obtained, report.total_max_marks) + '%',
							}"
						></div>
					</div>
					<div class="progress-pct">
						{{ pct(report.total_marks_obtained, report.total_max_marks) }}%
					</div>
				</div>

				<!-- Stats -->
				<div class="card-stats">
					<div v-if="report.term_average" class="stat-box">
						<div class="stat-val">{{ report.term_average }}%</div>
						<div class="stat-lbl">Average</div>
					</div>
					<div v-if="report.overall_grade" class="stat-box">
						<div class="stat-val">{{ report.overall_grade }}</div>
						<div class="stat-lbl">Grade</div>
					</div>
					<div v-if="report.class_arm_position" class="stat-box">
						<div class="stat-val">{{ ordinal(report.class_arm_position) }}</div>
						<div class="stat-lbl">Position</div>
					</div>
				</div>

				<!-- Action -->
				<div class="card-footer">
					<button
						class="btn-print"
						@click="printReport(report)"
						:disabled="printingReports[report.name]"
					>
						<svg
							viewBox="0 0 20 20"
							fill="currentColor"
							style="width: 15px; height: 15px"
						>
							<path
								fill-rule="evenodd"
								d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9v-1h8v3H6v-2h1a1 1 0 000-2H6v-.001zm7 0h1v2h-1v-2z"
								clip-rule="evenodd"
							/>
						</svg>
						{{ printingReports[report.name] ? 'Opening...' : 'View Result' }}
					</button>
				</div>
			</div>
		</div>

		<!-- Empty -->
		<div v-else class="empty-card">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				style="width: 48px; height: 48px; color: #d1d5db; margin: 0 auto 1rem"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
				/>
			</svg>
			<h3 class="empty-title">No Reports Found</h3>
			<p class="empty-sub">
				{{
					hasFilters
						? 'No reports match your current filters.'
						: 'No reports available yet.'
				}}
			</p>
			<button v-if="hasFilters" class="btn-clear" @click="clearFilters">
				Clear Filters
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, reactive, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { createResource } from 'frappe-ui'
import { useRoute } from 'vue-router'

const route = useRoute()

const data = createResource({
	url: 'education_extension.guardian.get_ward_reports',
	params: { student_id: route.params.studentId },
	auto: true,
	cache: false,
})

// Filters
const filterProgram = ref('')
const filterYear = ref('')
const filterTerm = ref('')

// Dropdown state
const openFilter = ref(null)
const filterMenuStyle = ref({})
const classRef = ref(null)
const yearRef = ref(null)
const termRef = ref(null)

const refMap = { class: classRef, year: yearRef, term: termRef }

function toggleFilter(key) {
	if (openFilter.value === key) {
		openFilter.value = null
		return
	}
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
	const refs = [classRef, yearRef, termRef]
	const inside = refs.some((r) => r.value?.contains(e.target))
	if (!inside) openFilter.value = null
}

onMounted(() => document.addEventListener('click', closeFilters))
onBeforeUnmount(() => document.removeEventListener('click', closeFilters))

// Filter options derived from data
const allReports = computed(() => data.data || [])

const programOptions = computed(() =>
	[...new Set(allReports.value.map((r) => r.program).filter(Boolean))].sort(),
)
const yearOptions = computed(() =>
	[...new Set(allReports.value.map((r) => r.academic_year).filter(Boolean))].sort().reverse(),
)
const termOptions = computed(() =>
	[...new Set(allReports.value.map((r) => r.assessment_group).filter(Boolean))].sort(),
)

const hasFilters = computed(() => filterProgram.value || filterYear.value || filterTerm.value)

function clearFilters() {
	filterProgram.value = ''
	filterYear.value = ''
	filterTerm.value = ''
}

const filteredReports = computed(() => {
	let list = [...allReports.value]
	if (filterProgram.value) list = list.filter((r) => r.program === filterProgram.value)
	if (filterYear.value) list = list.filter((r) => r.academic_year === filterYear.value)
	if (filterTerm.value) list = list.filter((r) => r.assessment_group === filterTerm.value)
	return list.sort((a, b) => {
		if (a.academic_year !== b.academic_year)
			return b.academic_year.localeCompare(a.academic_year)
		return a.assessment_group.localeCompare(b.assessment_group)
	})
})

// Helpers
function pct(got, max) {
	return Math.round((got / max) * 100)
}

function progressClass(got, max) {
	const p = pct(got, max)
	if (p >= 75) return 'fill-green'
	if (p >= 50) return 'fill-yellow'
	return 'fill-red'
}

function ordinal(n) {
	const s = ['th', 'st', 'nd', 'rd']
	const v = n % 100
	return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// Print
const printingReports = reactive({})

const getPrintFormatForProgram = async (program) => {
	try {
		const res = await fetch('/api/method/education.education.api.get_school_print_format', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
		})
		const result = await res.json()
		const primaryFormat = result.message?.primary_print_format || 'Standard'
		const secondaryFormat = result.message?.secondary_print_format || 'Standard'
		return isSecondaryProgram(program) ? secondaryFormat : primaryFormat
	} catch (error) {
		console.error('❌ Error fetching print format:', error)
		return 'Standard'
	}
}

function isSecondaryProgram(program) {
	if (!program) return false
	const lower = program.toLowerCase()
	return ['jss', 'ss', 'secondary', 'high school', 'senior', 'junior', 'junior secondary'].some(
		(k) => lower.includes(k),
	)
}

const printReport = async (report) => {
	try {
		printingReports[report.name] = true
		const format = await getPrintFormatForProgram(report.program)
		const printUrl = `/printview?doctype=School%20Term%20Result&name=${encodeURIComponent(report.name)}&format=${encodeURIComponent(format)}&no_letterhead=1`

		// Open and auto-trigger print dialog
		const printWindow = window.open(printUrl, '_blank')
		if (printWindow) {
			printWindow.addEventListener('load', () => {
				setTimeout(() => {
					printWindow.print()
				}, 500) // small delay to ensure page fully renders
			})
		}
	} catch (error) {
		console.error('Error printing report:', error)
	} finally {
		printingReports[report.name] = false
	}
}
</script>

<style scoped>
.report-page {
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
}

/* Header */
.page-header {
	background: #fff;
	border: 1px solid #e5e7eb;
	border-radius: 12px;
	padding: 1.25rem 1.5rem;
	display: flex;
	align-items: center;
	justify-content: space-between;
}
.page-title {
	font-size: 1.375rem;
	font-weight: 700;
	color: #111;
	margin: 0 0 0.25rem;
}
.page-sub {
	font-size: 0.875rem;
	color: #6b7280;
	margin: 0;
}
.btn-refresh {
	display: flex;
	align-items: center;
	gap: 0.4rem;
	font-size: 0.8125rem;
	font-weight: 600;
	padding: 0.4rem 0.875rem;
	border-radius: 8px;
	border: 1px solid #e5e7eb;
	background: #fff;
	color: #374151;
	cursor: pointer;
}
.btn-refresh svg {
	width: 14px;
	height: 14px;
}
.btn-refresh:hover {
	background: #f9fafb;
}
.spinning {
	animation: spin 0.8s linear infinite;
}
@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

/* Filters */
.filter-card {
	background: #fff;
	border: 1px solid #e5e7eb;
	border-radius: 12px;
	padding: 1.25rem 1.5rem;
}
.filter-title {
	font-size: 0.9375rem;
	font-weight: 600;
	color: #111;
	margin: 0 0 1rem;
}
.filter-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 1rem;
}
@media (max-width: 768px) {
	.filter-grid {
		grid-template-columns: 1fr 1fr;
	}
}
@media (max-width: 480px) {
	.filter-grid {
		grid-template-columns: 1fr;
	}
}
.filter-field {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}
.filter-clear {
	justify-content: flex-end;
}
.filter-label {
	font-size: 0.8125rem;
	font-weight: 500;
	color: #374151;
}
.filter-dropdown-wrap {
	position: relative;
}
.filter-btn {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.5rem;
	padding: 0.5rem 0.875rem;
	background: #fff;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	font-size: 0.875rem;
	font-weight: 500;
	color: #374151;
	cursor: pointer;
	font-family: inherit;
}
.filter-btn:hover {
	border-color: #d1d5db;
}
.chevron {
	width: 16px;
	height: 16px;
	flex-shrink: 0;
	transition: transform 0.15s;
}
.chevron.open {
	transform: rotate(180deg);
}
.btn-clear {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.4rem;
	width: 100%;
	padding: 0.5rem 0.875rem;
	font-size: 0.875rem;
	font-weight: 500;
	color: #374151;
	background: #fff;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	cursor: pointer;
	font-family: inherit;
	margin-top: auto;
}
.btn-clear:hover {
	background: #f9fafb;
}

/* Loading */
.loading {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 3rem;
	gap: 1rem;
	color: #6b7280;
	font-size: 0.875rem;
}
.spinner {
	width: 32px;
	height: 32px;
	border: 3px solid #e5e7eb;
	border-top-color: #1a1a1a;
	border-radius: 50%;
	animation: spin 0.7s linear infinite;
}

/* Reports Grid */
.reports-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 1.25rem;
}
@media (max-width: 1024px) {
	.reports-grid {
		grid-template-columns: repeat(2, 1fr);
	}
}
@media (max-width: 640px) {
	.reports-grid {
		grid-template-columns: 1fr;
	}
}

/* Report Card */
.report-card {
	background: #fff;
	border: 1px solid #e5e7eb;
	border-radius: 12px;
	padding: 1.25rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	transition: box-shadow 0.2s;
}
.report-card:hover {
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.card-header {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}
.card-title {
	font-size: 0.9375rem;
	font-weight: 700;
	color: #111;
	margin: 0;
	line-height: 1.4;
}
.card-sub {
	font-size: 0.8125rem;
	color: #6b7280;
	margin: 0;
}

.card-progress {
	display: flex;
	flex-direction: column;
	gap: 0.375rem;
}
.progress-row {
	display: flex;
	justify-content: space-between;
}
.progress-label {
	font-size: 0.8125rem;
	font-weight: 500;
	color: #374151;
}
.progress-value {
	font-size: 0.8125rem;
	font-weight: 600;
	color: #111;
}
.progress-track {
	height: 8px;
	background: #f3f4f6;
	border-radius: 99px;
	overflow: hidden;
}
.progress-fill {
	height: 100%;
	border-radius: 99px;
	transition: width 0.5s ease;
}
.fill-green {
	background: #22c55e;
}
.fill-yellow {
	background: #f59e0b;
}
.fill-red {
	background: #ef4444;
}
.progress-pct {
	font-size: 0.75rem;
	color: #9ca3af;
	text-align: right;
}

.card-stats {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 0.5rem;
}
.stat-box {
	background: #f9fafb;
	border-radius: 8px;
	padding: 0.625rem;
	text-align: center;
}
.stat-val {
	font-size: 1rem;
	font-weight: 700;
	color: #111;
}
.stat-lbl {
	font-size: 0.7rem;
	color: #6b7280;
	margin-top: 2px;
}

.card-footer {
	border-top: 1px solid #f3f4f6;
	padding-top: 0.75rem;
}
.btn-print {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.4rem;
	padding: 0.5rem;
	font-size: 0.875rem;
	font-weight: 500;
	color: #374151;
	background: #f9fafb;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	cursor: pointer;
	font-family: inherit;
	transition: background 0.15s;
}
.btn-print:hover {
	background: #111;
	color: #fff;
	border-color: #111;
}
.btn-print:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

/* Empty */
.empty-card {
	background: #fff;
	border: 1px solid #e5e7eb;
	border-radius: 12px;
	padding: 3rem;
	text-align: center;
}
.empty-title {
	font-size: 1rem;
	font-weight: 600;
	color: #374151;
	margin: 0 0 0.5rem;
}
.empty-sub {
	font-size: 0.875rem;
	color: #9ca3af;
	margin: 0 0 1rem;
}
</style>

<!-- Global styles for teleported filter menus -->
<style>
.report-filter-menu {
	background: #fff;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
	overflow: hidden;
	z-index: 9999;
}
.report-filter-item {
	display: block;
	width: 100%;
	padding: 0.625rem 0.875rem;
	font-size: 0.875rem;
	color: #374151;
	background: none;
	border: none;
	cursor: pointer;
	text-align: left;
	font-family: inherit;
	transition: background 0.1s;
}
.report-filter-item:hover {
	background: #f9fafb;
}
.report-filter-item.active {
	background: #f0f4ff;
	color: #1d4ed8;
	font-weight: 600;
}
</style>

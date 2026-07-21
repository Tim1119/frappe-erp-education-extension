<template>
	<div style="display: flex; flex-direction: column; gap: 1rem; height: 100%">
		<div v-if="data.loading" style="display: flex; justify-content: center; padding: 3rem">
			<div
				class="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin"
			></div>
		</div>
		<template v-else-if="data.data">
			<div
				v-if="data.data.enrollment"
				class="inline-block bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1.5 rounded-full"
			>
				{{ data.data.enrollment.program }} · {{ data.data.enrollment.academic_year }}
			</div>
			<div
				style="
					background: #fff;
					border: 1px solid #e5e7eb;
					border-radius: 12px;
					overflow: hidden;
					flex: 1;
				"
			>
				<GuardianCalendar :events="calendarEvents" />
			</div>
		</template>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { createResource } from 'frappe-ui'
import { useRoute } from 'vue-router'
import GuardianCalendar from '@/components/GuardianCalendar.vue'

const route = useRoute()
const data = createResource({
	url: 'education_extension.guardian.get_ward_schedule',
	params: { student_id: route.params.studentId },
	auto: true,
	cache: false,
})

const calendarEvents = computed(() => {
	if (!data.data?.schedule) return []
	return data.data.schedule.map((item) => ({
		name: item.name,
		title: item.course,
		date: item.schedule_date,
		schedule_date: item.schedule_date,
		from_time: item.from_time,
		to_time: item.to_time,
		room: item.room,
		instructor: item.instructor,
		color: 'blue',
	}))
})
</script>

<template>
	<div style="position: relative">
		<!-- Event pill -->
		<div
			@click.stop="togglePopup"
			:style="{
				width: '100%',
				padding: '3px 6px',
				borderRadius: '6px',
				cursor: 'pointer',
				borderLeft: '3px solid',
				marginBottom: '2px',
				overflow: 'hidden',
				backgroundColor: colorStyles[event?.color]?.bg || '#dbeafe',
				borderColor: colorStyles[event?.color]?.border || '#2563eb',
			}"
		>
			<p
				style="
					font-size: 0.7rem;
					font-weight: 600;
					color: #1e293b;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					margin: 0;
				"
			>
				{{ event.title || event.course }}
			</p>
			<p
				v-if="event.from_time"
				style="font-size: 0.65rem; color: #64748b; margin: 0; white-space: nowrap"
			>
				{{ event.from_time?.substring(0, 5) }} – {{ event.to_time?.substring(0, 5) }}
			</p>
		</div>

		<!-- Popup — teleported to body to escape calendar stacking context -->
		<Teleport to="body">
			<Transition name="popup">
				<div
					v-if="isOpen"
					ref="popupRef"
					:style="popupStyle"
					style="
						position: fixed;
						z-index: 9999;
						background: #fff;
						border: 1px solid #e5e7eb;
						border-radius: 12px;
						box-shadow: 0 8px 32px rgba(0, 0, 0, 0.14);
						min-width: 240px;
						max-width: 300px;
					"
					@click.stop
				>
					<!-- Header strip -->
					<div
						:style="{
							background: colorStyles[event?.color]?.bg || '#dbeafe',
							borderBottom:
								'1px solid ' + (colorStyles[event?.color]?.border || '#2563eb'),
							padding: '12px 16px 10px',
							borderRadius: '12px 12px 0 0',
						}"
					>
						<p
							style="
								margin: 0;
								font-size: 0.8125rem;
								font-weight: 700;
								color: #1e293b;
								line-height: 1.3;
							"
						>
							{{ event.title || event.course }}
							<span v-if="event.instructor" style="font-weight: 400; color: #475569">
								by {{ event.instructor }}</span
							>
						</p>
					</div>

					<!-- Body -->
					<div
						style="
							padding: 12px 16px 14px;
							display: flex;
							flex-direction: column;
							gap: 10px;
						"
					>
						<div
							v-if="event.schedule_date"
							style="display: flex; gap: 10px; align-items: center"
						>
							<svg
								style="width: 15px; height: 15px; color: #6b7280; flex-shrink: 0"
								viewBox="0 0 20 20"
								fill="#6b7280"
							>
								<path
									fill-rule="evenodd"
									d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
									clip-rule="evenodd"
								/>
							</svg>
							<span style="font-size: 0.8125rem; color: #374151">{{
								formatDate(event.schedule_date)
							}}</span>
						</div>

						<div
							v-if="event.from_time"
							style="display: flex; gap: 10px; align-items: center"
						>
							<svg
								style="width: 15px; height: 15px; flex-shrink: 0"
								viewBox="0 0 20 20"
								fill="#6b7280"
							>
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
									clip-rule="evenodd"
								/>
							</svg>
							<span style="font-size: 0.8125rem; color: #374151"
								>{{ event.from_time?.substring(0, 5) }} –
								{{ event.to_time?.substring(0, 5) }}</span
							>
						</div>

						<div
							v-if="event.instructor"
							style="display: flex; gap: 10px; align-items: center"
						>
							<svg
								style="width: 15px; height: 15px; flex-shrink: 0"
								viewBox="0 0 20 20"
								fill="#6b7280"
							>
								<path
									fill-rule="evenodd"
									d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
									clip-rule="evenodd"
								/>
							</svg>
							<span style="font-size: 0.8125rem; color: #374151">{{
								event.instructor
							}}</span>
						</div>

						<div
							v-if="event.room"
							style="display: flex; gap: 10px; align-items: center"
						>
							<svg
								style="width: 15px; height: 15px; flex-shrink: 0"
								viewBox="0 0 20 20"
								fill="#6b7280"
							>
								<path
									fill-rule="evenodd"
									d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
									clip-rule="evenodd"
								/>
							</svg>
							<span style="font-size: 0.8125rem; color: #374151"
								>Room: {{ event.room }}</span
							>
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>
	</div>
</template>

<script setup>
import { ref, computed, nextTick, onBeforeUnmount } from 'vue'
import { useCalendarPopup } from '@/composables/useCalendarPopup'

const props = defineProps({
	event: { type: Object, required: true },
	date: { type: Date, required: true },
})

const { activeEventId, setActive } = useCalendarPopup()

const isOpen = computed(() => activeEventId.value === props.event.name)

const popupRef = ref(null)
const popupStyle = ref({})

function togglePopup(e) {
	if (isOpen.value) {
		setActive(null)
		return
	}
	setActive(props.event.name)
	nextTick(() => {
		const rect = e.target.closest('[style]').getBoundingClientRect()
		const popup = popupRef.value
		if (!popup) return

		let top = rect.bottom + 6
		let left = rect.left

		if (left + 260 > window.innerWidth) left = window.innerWidth - 270
		if (top + 200 > window.innerHeight) top = rect.top - popup.offsetHeight - 6

		popupStyle.value = { top: top + 'px', left: left + 'px' }
	})
}

function onClickOutside(e) {
	if (isOpen.value && popupRef.value && !popupRef.value.contains(e.target)) {
		setActive(null)
	}
}

document.addEventListener('click', onClickOutside)
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))

const colorStyles = {
	blue: { bg: '#dbeafe', border: '#2563eb' },
	green: { bg: '#dcfce7', border: '#16a34a' },
	red: { bg: '#fee2e2', border: '#dc2626' },
	orange: { bg: '#ffedd5', border: '#ea580c' },
	yellow: { bg: '#fef9c3', border: '#ca8a04' },
	teal: { bg: '#ccfbf1', border: '#0d9488' },
	violet: { bg: '#ede9fe', border: '#7c3aed' },
	cyan: { bg: '#cffafe', border: '#0891b2' },
	purple: { bg: '#f3e8ff', border: '#9333ea' },
	pink: { bg: '#fce7f3', border: '#db2777' },
	amber: { bg: '#fef3c7', border: '#d97706' },
}

function formatDate(d) {
	return new Date(d).toDateString().split(' ').slice(0, 3).join(', ')
}
</script>

<style scoped>
.popup-enter-active {
	transition:
		opacity 0.15s ease,
		transform 0.15s ease;
}
.popup-leave-active {
	transition:
		opacity 0.1s ease,
		transform 0.1s ease;
}
.popup-enter-from {
	opacity: 0;
	transform: translateY(4px);
}
.popup-leave-to {
	opacity: 0;
	transform: translateY(4px);
}
</style>

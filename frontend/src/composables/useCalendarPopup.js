import { ref } from 'vue'

const activeEventId = ref(null)

export function useCalendarPopup() {
	function setActive(id) {
		activeEventId.value = id
	}

	function closeAll() {
		activeEventId.value = null
	}

	return { activeEventId, setActive, closeAll }
}

<template>
  <div class="min-h-screen bg-gray-50 px-6 py-8">
    <!-- Page Header -->
    <div class="mb-8">
      <div class="bg-white rounded-lg p-6 shadow-sm border">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">My General Awards</h1>
            <p class="text-gray-600">View certificates awarded to your class or group</p>
          </div>
          <div>
            <Button @click="loadCertificates" :loading="isRefreshing" size="sm" variant="outline">
              <template #prefix>
                <FeatherIcon name="refresh-cw" class="h-4 w-4" />
              </template>
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Filter Certificates</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Year -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Year</label>
          <Dropdown :options="yearOptions" v-model="filterYear">
            <template #default="{ open }">
              <Button :label="filterYear || 'All Years'" class="w-full justify-between">
                <template #suffix>
                  <FeatherIcon :name="open ? 'chevron-up' : 'chevron-down'" class="h-4 text-gray-600" />
                </template>
              </Button>
            </template>
          </Dropdown>
        </div>

        <!-- Category/Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <Dropdown :options="categoryOptions" v-model="filterCategory">
            <template #default="{ open }">
              <Button :label="filterCategory || 'All Types'" class="w-full justify-between">
                <template #suffix>
                  <FeatherIcon :name="open ? 'chevron-up' : 'chevron-down'" class="h-4 text-gray-600" />
                </template>
              </Button>
            </template>
          </Dropdown>
        </div>

        <!-- Student Group -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Class</label>
          <Dropdown :options="studentGroupOptions" v-model="filterStudentGroup">
            <template #default="{ open }">
              <Button :label="filterStudentGroup || 'All Classes'" class="w-full justify-between">
                <template #suffix>
                  <FeatherIcon :name="open ? 'chevron-up' : 'chevron-down'" class="h-4 text-gray-600" />
                </template>
              </Button>
            </template>
          </Dropdown>
        </div>

        <!-- Clear -->
        <div class="flex items-end">
          <Button @click="clearFilters" class="w-full" variant="outline">
            <template #prefix>
              <FeatherIcon name="x-circle" class="h-4 w-4" />
            </template>
            Clear Filters
          </Button>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-start">
        <FeatherIcon name="alert-circle" class="h-5 w-5 text-red-600 mt-0.5 mr-3" />
        <div>
          <h3 class="text-sm font-medium text-red-800">Error Loading Certificates</h3>
          <p class="text-sm text-red-700 mt-1">{{ errorMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading your certificates...</p>
    </div>

    <!-- Certificates Grid -->
    <div v-else-if="filteredCertificates.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div
        v-for="cert in filteredCertificates"
        :key="cert.name"
        class="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ cert.title }}</h3>
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {{ cert.studentGroup || 'General' }}
            </span>
          </div>
          <FeatherIcon name="award" class="h-6 w-6 text-yellow-500 flex-shrink-0 ml-2" />
        </div>
        
        <div class="space-y-2 mb-4">
          <div class="flex items-center text-sm text-gray-600">
            <FeatherIcon name="calendar" class="h-4 w-4 mr-2" />
            {{ formatDate(cert.date) }}
          </div>
          <div v-if="cert.category" class="flex items-center text-sm text-gray-600">
            <FeatherIcon name="tag" class="h-4 w-4 mr-2" />
            {{ cert.category }}
          </div>
        </div>

        <p v-if="cert.description" class="text-sm text-gray-700 mb-4 line-clamp-3">
          {{ cert.description }}
        </p>

        <div class="flex justify-end items-center border-t pt-4">
          <Button 
            size="sm" 
            v-if="cert.file" 
            @click="downloadCertificate(cert)"
            variant="solid"
          >
            <template #prefix>
              <FeatherIcon name="download" class="h-4 w-4" />
            </template>
            Download
          </Button>
          <span v-else class="text-xs text-gray-400 italic">No file attached</span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="bg-white rounded-lg p-8 shadow-sm border">
        <FeatherIcon name="award" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Certificates Found</h3>
        <p class="text-gray-600">
          {{ filterYear || filterCategory || filterStudentGroup 
            ? 'No certificates match your current filters. Try adjusting your filters.' 
            : 'You have not received any certificates yet.' 
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Button, Dropdown, FeatherIcon, call } from 'frappe-ui'

const isLoading = ref(false)
const isRefreshing = ref(false)
const allCertificates = ref([])
const filterYear = ref('')
const filterCategory = ref('')
const filterStudentGroup = ref('')
const errorMessage = ref('')

// Available filter options from backend
const availableYears = ref([])
const availableCategories = ref([])
const availableStudentGroups = ref([])

const yearOptions = computed(() => {
  return [
    { label: 'All Years', value: '', onClick: () => filterYear.value = '' },
    ...availableYears.value.map(y => ({ 
      label: y, 
      value: y, 
      onClick: () => filterYear.value = y 
    }))
  ]
})

const categoryOptions = computed(() => {
  return [
    { label: 'All Types', value: '', onClick: () => filterCategory.value = '' },
    ...availableCategories.value.map(c => ({ 
      label: c, 
      value: c, 
      onClick: () => filterCategory.value = c 
    }))
  ]
})

const studentGroupOptions = computed(() => {
  return [
    { label: 'All Classes', value: '', onClick: () => filterStudentGroup.value = '' },
    ...availableStudentGroups.value.map(sg => ({ 
      label: sg, 
      value: sg, 
      onClick: () => filterStudentGroup.value = sg 
    }))
  ]
})

const filteredCertificates = computed(() => {
  return allCertificates.value.filter(cert => {
    const yearMatch = !filterYear.value || cert.year === filterYear.value
    const categoryMatch = !filterCategory.value || cert.category === filterCategory.value
    const groupMatch = !filterStudentGroup.value || cert.studentGroup === filterStudentGroup.value
    
    return yearMatch && categoryMatch && groupMatch
  })
})

const loadCertificates = async () => {
  isLoading.value = true
  isRefreshing.value = true
  errorMessage.value = ''
  
  try {
    // Load certificates
    const certsResponse = await call('education.education.api.get_student_bulk_certificates')
    
    // Load filter options
    const filtersResponse = await call('education.education.api.get_bulk_certificate_filters')
    
    // Process certificates
    allCertificates.value = (certsResponse || []).map(cert => {
      const certDate = new Date(cert.certificate_date)
      return {
        name: cert.name,
        title: cert.certificate_title,
        date: cert.certificate_date,
        description: cert.description,
        category: cert.certificate_type,
        year: certDate.getFullYear().toString(),
        studentGroup: cert.student_group,
        file: cert.certificate_file
      }
    })
    
    // Set available filter options
    if (filtersResponse) {
      availableYears.value = filtersResponse.years || []
      availableCategories.value = filtersResponse.categories || []
      availableStudentGroups.value = filtersResponse.student_groups || []
    }
    
  } catch (error) {
    console.error('Error loading certificates:', error)
    errorMessage.value = error.message || 'Failed to load certificates. Please try again.'
  } finally {
    isLoading.value = false
    isRefreshing.value = false
  }
}

const clearFilters = () => {
  filterYear.value = ''
  filterCategory.value = ''
  filterStudentGroup.value = ''
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const downloadCertificate = (cert) => {
  if (cert.file) {
    window.open(cert.file, '_blank')
  }
}

onMounted(() => {
  loadCertificates()
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
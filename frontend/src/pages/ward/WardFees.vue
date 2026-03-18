<template>
  <div class="ward-page">
    <div v-if="data.loading" class="loading"><div class="spinner"></div></div>

    <template v-else-if="data.data">

      <!-- Summary cards -->
      <div class="fee-summary">
        <div class="fee-sum-card outstanding">
          <span class="sum-label">Outstanding</span>
          <span class="sum-amount">₦{{ formatAmount(data.data.summary.total_outstanding) }}</span>
        </div>
        <div class="fee-sum-card paid">
          <span class="sum-label">Total Paid</span>
          <span class="sum-amount">₦{{ formatAmount(data.data.summary.total_paid) }}</span>
        </div>
      </div>

      <!-- Invoice list -->
      <div v-if="data.data.invoices.length === 0" class="empty-card">
        No fee invoices found.
      </div>

      <div v-else class="list-wrap">
        <table class="fee-table">
          <thead>
            <tr>
              <th>Program</th>
              <th>Status</th>
              <th>Payment Date</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in sortedInvoices" :key="row.name">
              <td class="td-program">{{ row.program || '—' }}</td>
              <td>
                <span class="badge" :class="badgeClass(row.status)">{{ row.status }}</span>
              </td>
              <td class="td-muted">{{ row.payment_date_formatted }}</td>
              <td class="td-muted">{{ row.due_date_formatted }}</td>
              <td class="td-amount">{{ row.amount_display }}</td>
              <td class="td-action">
                <button v-if="row.status === 'Paid'" class="btn-action" @click="downloadInvoice(row)">
                  ↓ Download
                </button>
                <button v-else class="btn-pay" @click="openPayment(row)">
                  💳 Pay Now
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { createResource } from 'frappe-ui'
import { useRoute } from 'vue-router'

const route = useRoute()

const data = createResource({
  url: 'education_extension.guardian.get_ward_fees',
  params: { student_id: route.params.studentId },
  auto: true,
})

const sortedInvoices = computed(() => {
  if (!data.data?.invoices) return []
  const order = { Overdue: 0, Unpaid: 1, 'Partly Paid': 2, Paid: 3 }
  return [...data.data.invoices]
    .map(inv => ({
      ...inv,
      due_date_formatted: inv.due_date ? formatDate(inv.due_date) : '—',
      payment_date_formatted: inv.payment_date ? formatDate(inv.payment_date) : '—',
      amount_display: `${inv.currency || '₦'} ${formatAmount(
        inv.status === 'Paid' ? inv.grand_total : inv.outstanding_amount || inv.grand_total
      )}`,
    }))
    .sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9))
})

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatAmount(n) {
  return Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })
}

function badgeClass(status) {
  return {
    Paid: 'badge-green',
    Unpaid: 'badge-red',
    Overdue: 'badge-red',
    'Partly Paid': 'badge-orange',
  }[status] || 'badge-gray'
}

function downloadInvoice(row) {
  const url = `/api/method/frappe.utils.print_format.download_pdf?` +
    `doctype=${encodeURIComponent('Sales Invoice')}` +
    `&name=${encodeURIComponent(row.name)}` +
    `&format=Standard`
  window.open(url, '_blank')
}

function openPayment(row) {
  window.open(`/Sales Invoice/${row.name}`, '_blank')
}
</script>

<style scoped>
.ward-page { display: flex; flex-direction: column; gap: 1rem; }
.loading { display: flex; justify-content: center; padding: 3rem; }
.spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #1a1a1a; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Summary */
.fee-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.fee-sum-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.25rem; }
.fee-sum-card.outstanding { border-left: 3px solid #ef4444; }
.fee-sum-card.paid { border-left: 3px solid #22c55e; }
.sum-label { font-size: 0.75rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; }
.sum-amount { font-size: 1.25rem; font-weight: 700; color: #111; }

/* Empty */
.empty-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 2.5rem; text-align: center; color: #9ca3af; font-size: 0.875rem; }

/* Table */
.list-wrap { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: auto; }
.fee-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.fee-table th { background: #f9fafb; padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #e5e7eb; white-space: nowrap; }
.fee-table td { padding: 0.875rem 1rem; border-bottom: 1px solid #f3f4f6; color: #374151; vertical-align: middle; }
.fee-table tr:last-child td { border-bottom: none; }
.fee-table tr:hover td { background: #f9fafb; }

.td-program { font-weight: 600; color: #111; font-size: 0.875rem; min-width: 100px; }
.td-muted { color: #9ca3af; font-size: 0.8125rem; white-space: nowrap; }
.td-amount { font-weight: 700; color: #111; white-space: nowrap; }
.td-action { text-align: right; white-space: nowrap; }

/* Badges */
.badge { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 99px; white-space: nowrap; }
.badge-green  { background: #f0fdf4; color: #166534; }
.badge-red    { background: #fef2f2; color: #991b1b; }
.badge-orange { background: #fff7ed; color: #9a3412; }
.badge-gray   { background: #f3f4f6; color: #6b7280; }

/* Buttons */
.btn-action { font-size: 0.75rem; font-weight: 600; padding: 0.35rem 0.75rem; border-radius: 8px; border: 1px solid #e5e7eb; background: #fff; color: #374151; cursor: pointer; transition: background 0.15s, color 0.15s, border-color 0.15s; }
.btn-action:hover { background: #111; color: #fff; border-color: #111; }
.btn-pay { font-size: 0.75rem; font-weight: 600; padding: 0.35rem 0.75rem; border-radius: 8px; border: none; background: #111; color: #fff; cursor: pointer; transition: background 0.15s; }
.btn-pay:hover { background: #374151; }

/* Responsive — hide payment date on small screens */
@media (max-width: 600px) {
  .fee-table th:nth-child(3),
  .fee-table td:nth-child(3) { display: none; }
}
</style>
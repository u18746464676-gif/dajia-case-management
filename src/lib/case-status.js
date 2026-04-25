function formatAmount(value) {
  const amount = Number(value || 0)
  if (!Number.isFinite(amount)) return '0'
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2).replace(/\.00$/, '')
}

const STATUS_META = {
  pending_report: { label: '未受理', className: 'bg-amber-50 text-amber-700 border-amber-200', dotClass: 'bg-amber-500' },
  accepted: { label: '已受理', className: 'bg-violet-50 text-violet-700 border-violet-200', dotClass: 'bg-violet-500' },
  reported: { label: '不予受理', className: 'bg-sky-50 text-sky-700 border-sky-200', dotClass: 'bg-sky-500' },
  decided: { label: '已调解', className: 'bg-orange-50 text-orange-700 border-orange-200', dotClass: 'bg-orange-500' },
  closed: { label: '已处罚', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotClass: 'bg-emerald-500' },
  rejected: { label: '不予立案', className: 'bg-rose-50 text-rose-700 border-rose-200', dotClass: 'bg-rose-500' },
  not_punished: { label: '责令改正', className: 'bg-slate-100 text-slate-700 border-slate-200', dotClass: 'bg-slate-400' },
  exempted: { label: '不予处罚', className: 'bg-slate-100 text-slate-600 border-slate-200', dotClass: 'bg-slate-400' },
  mediation_terminated: { label: '终止调解', className: 'bg-rose-50 text-rose-700 border-rose-200', dotClass: 'bg-rose-500' },
  filed: { label: '已立案', className: 'bg-blue-50 text-blue-700 border-blue-200', dotClass: 'bg-blue-500' },
}

export function getCaseStatusMeta(caseOrStatus, profitValue) {
  const status = typeof caseOrStatus === 'string' ? caseOrStatus : caseOrStatus?.status
  const profit = typeof caseOrStatus === 'string' ? Number(profitValue || 0) : Number(caseOrStatus?.profit || 0)

  if (status === 'decided' && profit > 0) {
    return {
      label: `已赔偿${formatAmount(profit)}元`,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotClass: 'bg-emerald-500',
    }
  }

  return STATUS_META[status] || {
    label: status || '-',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400',
  }
}

export { formatAmount }

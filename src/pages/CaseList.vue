<template>
  <div class="space-y-4">
    <!-- Toast 通知 -->
    <transition-group name="toast" tag="div" class="fixed top-4 right-4 z-50 space-y-2 w-72">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="card shadow-lg text-sm"
        :class="{
          'border-l-4 border-emerald-500': toast.type === 'success',
          'border-l-4 border-red-400': toast.type === 'error',
          'border-l-4 border-amber-400': toast.type === 'warn',
          'border-l-4 border-blue-400': toast.type === 'info',
        }"
      >{{ toast.message }}</div>
    </transition-group>

    <!-- 背景上传进度条 -->
    <div v-if="uploadQueueHasActive" class="card overflow-hidden">
      <div class="flex items-center justify-between gap-3 mb-2">
        <div class="flex items-center gap-2">
          <div class="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-500"></div>
          <span class="text-sm font-medium text-slate-700">
            正在上传 {{ uploadQueueActive }} 个文件...
          </span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs text-slate-500">{{ uploadQueueItems.length }} 个文件</span>
          <span class="text-xs font-medium text-blue-600">{{ uploadQueueProgress }}%</span>
          <button @click="clearUploadFinished" class="text-xs text-slate-400 hover:text-slate-600">清空</button>
        </div>
      </div>
      <!-- 总进度条 -->
      <div class="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          class="h-full rounded-full bg-blue-500 transition-all duration-500"
          :style="{ width: uploadQueueProgress + '%' }"
        ></div>
      </div>
      <!-- 各文件状态 -->
      <div class="mt-2 space-y-1 max-h-40 overflow-y-auto">
        <div
          v-for="item in uploadQueueItems"
          :key="item.id"
          class="flex items-center gap-2 text-xs"
        >
          <!-- 状态图标 -->
          <span v-if="item.status === 'done'" class="text-emerald-500">✅</span>
          <span v-else-if="item.status === 'error'" class="text-red-400 cursor-pointer" @click="retryUploadItem(item.id, uploadQueueCallback)" title="点击重试">❌</span>
          <span v-else-if="item.status === 'uploading'" class="animate-spin text-blue-400">⟳</span>
          <span v-else class="text-slate-300">○</span>

          <span class="flex-1 truncate text-slate-600" :class="{ 'text-emerald-600 font-medium': item.status === 'done' }">{{ item.name }}</span>

          <span v-if="item.status === 'uploading'" class="text-slate-400">{{ item.progress }}%</span>
          <span v-else-if="item.status === 'done'" class="text-emerald-500">完成</span>
          <span v-else-if="item.status === 'error'" class="text-red-400" :title="item.error">{{ item.error || '失败' }}</span>
          <span v-else class="text-slate-400">等待</span>
        </div>
      </div>
    </div>

    <section class="card overflow-hidden">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div class="space-y-3">
          <div>
            <div class="text-xs uppercase tracking-[0.24em] text-slate-400">案件总览</div>
            <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">待跟进案件</h1>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">先筛出当前要处理的案件，再补材料、查单号、批量跟进，减少来回切换。</p>
        </div>
          <div class="flex flex-wrap gap-2">
            <span class="soft-tag">检索结果 {{ filteredCases.length }}</span>
            <span class="soft-tag">本页已选 {{ selectedIds.length }}</span>
            <span class="soft-tag">云端文件 {{ totalCloudFiles }}</span>
          </div>
        </div>

        <div class="w-full xl:max-w-2xl">
          <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap xl:justify-end">
            <button type="button" @click="triggerPhotoUpload" class="btn-primary flex-1 sm:flex-none">
              <span>拍照上传</span>
            </button>
            <router-link to="/case/new" class="btn-primary flex-1 sm:flex-none">
              <span>新增案件</span>
            </router-link>
            <button type="button" @click="showMoreActions = !showMoreActions" class="btn-secondary flex-1 sm:flex-none">
              <span>{{ showMoreActions ? '收起操作' : '更多操作' }}</span>
            </button>
          </div>

          <div v-if="showMoreActions" class="grid grid-cols-1 gap-3 mt-3 sm:grid-cols-2">
            <label for="input-envelope" class="action-tile cursor-pointer">
              <span class="min-w-0">
                <span class="block text-sm font-semibold text-slate-800">📮 上传信封</span>
                <span class="mt-1 block text-xs text-slate-500">OCR识别 → 信封分类</span>
              </span>
            </label>
            <label for="input-document" class="action-tile cursor-pointer">
              <span class="min-w-0">
                <span class="block text-sm font-semibold text-slate-800">📄 上传文书</span>
                <span class="mt-1 block text-xs text-slate-500">OCR识别 → 文书分类</span>
              </span>
            </label>
            <label for="input-word" class="action-tile cursor-pointer">
              <span class="min-w-0">
                <span class="block text-sm font-semibold text-slate-800">📝 上传Word</span>
                <span class="mt-1 block text-xs text-slate-500">文件名解析 → 文书分类</span>
              </span>
            </label>
            <button type="button" @click="showMoreActions = false; triggerFileUpload()" class="action-tile">
              <span class="min-w-0">
                <span class="block text-sm font-semibold text-slate-800">📎 混合上传</span>
                <span class="mt-1 block text-xs text-slate-500">混合格式，系统自动分类</span>
              </span>
            </button>
            <button type="button" @click="showMoreActions = false; triggerExcelUpload()" class="action-tile">
              <span class="min-w-0">
                <span class="block text-sm font-semibold text-slate-800">导入 Excel</span>
                <span class="mt-1 block text-xs text-slate-500">先预览再勾选导入</span>
              </span>
            </button>
            <button type="button" @click="showMoreActions = false; exportCasesToExcel()" class="action-tile">
              <span class="min-w-0">
                <span class="block text-sm font-semibold text-slate-800">导出台账</span>
                <span class="mt-1 block text-xs text-slate-500">有选中导出选中，否则导出当前筛选结果</span>
              </span>
            </button>
            <button type="button" @click="showMoreActions = false; showCloudFiles = true" class="action-tile">
              <span class="min-w-0">
                <span class="block text-sm font-semibold text-slate-800">云端文件</span>
                <span class="mt-1 block text-xs text-slate-500">当前 {{ totalCloudFiles }} 个文件可管理</span>
              </span>
            </button>
          </div>

          <input ref="photoInputRef" type="file" accept="image/*,.heic,.heif" capture="environment" @change="handleScanUpload" class="hidden" />
          <input ref="albumInputRef" type="file" accept="image/*,.heic,.heif" multiple @change="handleAlbumUpload" class="hidden" />
          <input ref="envelopeInputRef" id="input-envelope" type="file" accept="image/*,.heic,.heif,.pdf" multiple @change="handleEnvelopeUpload" class="hidden" />
          <input ref="documentInputRef" id="input-document" type="file" accept="image/*,.heic,.heif,.pdf" multiple @change="handleDocumentUpload" class="hidden" />
          <input ref="wordInputRef" id="input-word" type="file" accept=".doc,.docx" multiple @change="handleWordUpload" class="hidden" />
          <input ref="fileInputRef" type="file" accept="image/*,.heic,.heif,.pdf,.doc,.docx,.txt" multiple @change="handleFileUpload" class="hidden" />
          <input ref="excelInputRef" type="file" accept=".xlsx,.xls,.csv" @change="importExcel" class="hidden" />
        </div>
      </div>

      <div v-if="uploadLoading" class="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        <div class="flex items-center gap-3">
          <div class="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <span>{{ processingStatus }}</span>
        </div>
      </div>

      <div v-if="uploadResult" class="mt-4 rounded-2xl border px-4 py-3 text-sm" :class="uploadResult.success ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-orange-100 bg-orange-50 text-orange-700'">
        <div class="flex items-start justify-between gap-3">
          <span>{{ uploadResult.message }}</span>
          <button @click="uploadResult = null" class="btn-ghost p-0 text-current">×</button>
        </div>
      </div>

      <div v-if="albumUploads.length > 0" class="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="text-sm text-slate-600">已选择 {{ albumUploads.length }} 张图片，先预览，再勾选上传。</div>
          <div class="flex flex-wrap items-center gap-2">
            <label class="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" :checked="selectAllAlbumUploads" @change="toggleSelectAllAlbumUploads" class="h-4 w-4 rounded" />
              <span>全选</span>
            </label>
            <button @click="confirmAlbumUpload" class="btn-primary">上传选中</button>
            <button @click="clearAlbumUploads" class="btn-secondary">清空</button>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          <div v-for="item in albumUploads" :key="item.id" class="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <label class="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-md bg-white/90 px-1.5 py-1 text-xs text-slate-700">
              <input type="checkbox" v-model="item.selected" class="h-4 w-4 rounded" />
              <span>选中</span>
            </label>
            <img :src="item.url" class="h-28 w-full bg-slate-50 object-contain" />
            <div class="truncate p-2 text-xs text-slate-500">{{ item.name }}</div>
          </div>
        </div>
      </div>

      <div v-if="ocrLoading" class="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        <div class="flex items-center gap-3">
          <div class="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <span>正在识别图片，请稍候...</span>
        </div>
      </div>

      <div v-if="ocrResult" class="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <div class="flex items-center justify-between gap-3">
          <span class="text-sm font-semibold text-emerald-700">
            <span v-if="ocrResult._ocrFailed" class="text-red-500">⚠️ OCR 识别失败</span>
            <span v-else>✅ OCR 识别结果</span>
            <span class="ml-2 font-normal text-slate-400 text-xs">文件: {{ ocrResult.fileName || '-' }}</span>
          </span>
          <button @click="ocrResult = null; logisticsResult = null" class="btn-ghost p-0 text-emerald-600">×</button>
        </div>
        <div class="mt-3 space-y-2 text-sm text-emerald-700">
          <div v-if="ocrResult.documentTitle" class="p-2 bg-emerald-100 rounded font-semibold">
            📄 OCR提取标题：{{ ocrResult.documentTitle }}
          </div>
          <div v-else class="text-slate-400 text-xs">（未从图片中识别到文书标题）</div>
          <div>执照名称：<strong>{{ ocrResult.licenseName || '-' }}</strong></div>
          <div>店铺名称：<strong>{{ ocrResult.shopName || '-' }}</strong></div>
          <div>文书类型：<strong>{{ ocrResult.documentType || '-' }}</strong></div>
          <div>
            识别到单号：
            <div v-if="ocrResult.trackingCandidates.length > 1" class="mt-1 space-y-1">
              <label
                v-for="(tn, idx) in ocrResult.trackingCandidates"
                :key="tn"
                class="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-emerald-100"
                :class="{ 'bg-emerald-100 font-bold': ocrResult.trackingNumber === tn }"
              >
                <input
                  type="radio"
                  :value="tn"
                  v-model="ocrResult.trackingNumber"
                  class="accent-emerald-600"
                />
                <span class="text-sm">{{ tn }}</span>
                <span class="text-xs text-slate-400">({{ ocrResult.isDoc ? '文件名' : 'AI优选' }})</span>
              </label>
            </div>
            <strong v-else>{{ ocrResult.trackingNumber || '-' }}</strong>
            <button
              v-if="ocrResult.trackingNumber && !logisticsResult"
              @click="queryLogistics(ocrResult.trackingNumber)"
              :disabled="logisticsLoading"
              class="btn-primary ml-3 px-3 py-1 text-xs"
            >
              {{ logisticsLoading ? '查询中...' : '查物流' }}
            </button>
          </div>
        </div>

        <div v-if="logisticsResult" class="mt-3 rounded-2xl bg-white p-3 shadow-sm">
          <div class="mb-2 flex items-center justify-between">
            <span class="font-semibold text-emerald-700">物流信息</span>
            <span :class="logisticsResult.status === '签收' ? 'text-emerald-600' : 'text-yellow-600'" class="text-sm font-bold">
              {{ logisticsResult.status }}
            </span>
          </div>
          <div class="space-y-2 text-sm">
            <div
              v-for="(item, idx) in logisticsResult.details"
              :key="idx"
              class="flex gap-3 rounded-xl p-2"
              :class="idx === 0 ? 'bg-emerald-50' : 'bg-slate-50'"
            >
              <div class="shrink-0 text-slate-500">{{ item.time }}</div>
              <div class="flex-1">{{ item.description }}</div>
            </div>
          </div>
          <div v-if="logisticsResult.status === '签收' && ocrResult.matchedCases.length > 0" class="mt-3">
            <button @click="applyOcrToCaseWithSign(ocrResult.matchedCases[0].id, logisticsResult.details[0]?.time)" class="btn-primary w-full">
              一键关联并记录签收时间
            </button>
          </div>
        </div>

        <div v-if="ocrResult.matchedCases.length > 0" class="mt-3">
          <div class="mb-2 text-sm text-emerald-600">匹配到的案件：</div>
          <div class="space-y-2">
            <button
              v-for="matched in ocrResult.matchedCases"
              :key="matched.id"
              @click="applyOcrToCase(matched.id)"
              class="w-full rounded-xl bg-white p-3 text-left text-sm transition hover:bg-emerald-100"
            >
              <span class="font-medium">{{ matched.licenseName || matched.shopName }}</span>
              <span class="ml-2 text-slate-400">{{ matched.productName }}</span>
            </button>
          </div>
        </div>
        <div v-else class="mt-2 text-sm text-orange-600">未匹配到相关案件，请手动选择</div>
      </div>

      <div v-if="uploadedFiles.length > 0" class="mt-4 flex flex-wrap gap-3">
        <div v-for="(file, idx) in uploadedFiles" :key="'file-' + idx" class="group relative">
          <div class="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-100">
            <span class="text-2xl">📄</span>
            <span class="w-full truncate px-1 text-center text-xs text-slate-500">{{ file.name.substring(0, 8) }}</span>
          </div>
          <button @click="removeFile(idx)" class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-sm text-white opacity-0 transition group-hover:opacity-100">×</button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <button type="button" @click="focusMonthlyCases" class="metric-card text-left transition hover:border-slate-300 hover:shadow-md">
          <div class="text-xs font-medium text-slate-500">当月花费</div>
          <div class="mt-1 text-2xl font-bold text-slate-800">¥{{ monthlyStats.expense.toLocaleString() }}</div>
          <div class="mt-1 text-xs text-slate-400">点击定位到案件列表</div>
        </button>
        <button type="button" @click="focusMonthlyCases" class="metric-card text-left transition hover:border-slate-300 hover:shadow-md">
          <div class="text-xs font-medium text-slate-500">当月盈利</div>
          <div class="mt-1 text-2xl font-bold text-slate-800">¥{{ monthlyStats.profit.toLocaleString() }}</div>
          <div class="mt-1 text-xs text-slate-400">点击定位到案件列表</div>
        </button>
      </div>

      <div class="mt-4 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div class="text-sm font-semibold text-slate-800">检索与筛选</div>
          <p class="mt-1 text-xs leading-5 text-slate-500">按月份、状态和关键词快速缩小范围，把今天要处理的案件先拎出来。</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span v-if="selectedIds.length > 0" class="soft-tag">已选 {{ selectedIds.length }} 条</span>
          <button v-if="hasActiveFilters" type="button" @click="clearFilters" class="btn-ghost text-xs text-slate-500">清空筛选</button>
        </div>
      </div>

      <div class="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center">
        <div class="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap">
          <select v-model="filterYear" class="input-field sm:w-28">
            <option v-for="y in availableYears" :key="y" :value="y">{{ y }}年</option>
          </select>
          <select v-model="filterMonth" class="input-field sm:w-24">
            <option v-for="m in 12" :key="m" :value="String(m).padStart(2, '0')">{{ m }}月</option>
          </select>
          <select v-model="filterStatus" class="input-field sm:w-32">
            <option value="">全部状态</option>
            <option value="pending_report">未受理</option>
            <option value="accepted">已受理</option>
            <option value="reported">不予受理</option>
            <option value="decided">已调解</option>
            <option value="closed">已处罚</option>
            <option value="rejected">不予立案</option>
            <option value="not_punished">责令改正</option>
          </select>
          <div class="min-w-0 flex-1 xl:max-w-md">
            <input
              v-model="keyword"
              type="text"
              placeholder="搜索编号 / 店铺 / 商品 / 执照 / 单号..."
              class="input-field"
            />
          </div>
        </div>

        <button v-if="selectedIds.length > 0" @click="showBatchModal = true" class="btn-primary w-full xl:w-auto">
          <span>🧰</span>
          <span>批量操作</span>
          <span class="rounded-full bg-white/20 px-2 py-0.5 text-xs">{{ selectedIds.length }}</span>
        </button>
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span class="soft-tag">当前共 {{ filteredCases.length }} 条</span>
        <label class="flex items-center gap-1 cursor-pointer select-none">
          <input type="checkbox" :checked="isAllPageSelected" @change="toggleSelectAllPage" class="h-3.5 w-3.5 rounded" />
          <span>本页全选</span>
        </label>
        <button type="button" @click="toggleSelectAllAll" class="cursor-pointer select-none">
          <span class="soft-tag">所有页面全选</span>
        </button>
        <span v-if="keyword" class="soft-tag">关键词：{{ keyword }}</span>
        <span v-if="filterStatus" class="soft-tag">状态已筛选</span>
        <span class="soft-tag">{{ filterYear }} 年 {{ Number(filterMonth) }} 月</span>
      </div>
    </section>

    <div v-if="showBatchModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" @click.self="showBatchModal = false">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 class="text-lg font-bold text-slate-800">批量操作</h3>
        <p class="mt-1 text-sm text-slate-500">已选 {{ selectedIds.length }} 个案件</p>
        <div class="mt-4">
          <button
            @click="batchQueryLogisticsForSelected"
            :disabled="batchLogisticsLoading"
            class="btn-secondary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>📦</span>
            <span>{{ batchLogisticsLoading ? `查询快递中 ${batchLogisticsProgress}` : '批量查询快递' }}</span>
          </button>
        </div>
        <div class="mt-4">
          <label class="label">批量设置寄件日期</label>
          <input type="date" v-model="batchReportDate" class="input-field" />
        </div>
        <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button @click="showBatchModal = false" class="btn-secondary flex-1">取消</button>
          <button @click="batchUpdateReportDate" class="btn-primary flex-1">保存日期</button>
        </div>
        <button @click="batchDeleteCases" class="btn-danger mt-3 w-full">批量删除选中案件</button>
      </div>
    </div>

    <div v-if="showImportPreview" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm" @click.self="closeImportPreview">
      <div class="flex max-h-[85vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white p-4 shadow-2xl sm:p-6">
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 class="text-lg font-bold text-slate-800">Excel 导入预览</h3>
            <p class="mt-1 text-sm text-slate-500">先预览，再选择全选或单选后导入</p>
          </div>
          <button @click="closeImportPreview" class="btn-ghost p-0 text-2xl text-slate-400">×</button>
        </div>
        <div class="mb-3 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <label class="flex items-center gap-2 text-slate-600">
            <input type="checkbox" :checked="selectAllImportRows" @change="toggleSelectAllImportRows" class="h-4 w-4 rounded" />
            <span>全选</span>
          </label>
          <span class="text-slate-500">共 {{ importPreviewRows.length }} 条，已选 {{ selectedImportRows.length }} 条</span>
        </div>
        <div class="flex-1 overflow-auto rounded-2xl border border-slate-100">
          <table class="w-full text-sm">
            <thead class="sticky top-0 bg-slate-50">
              <tr>
                <th class="w-10 py-2 px-3 text-left"></th>
                <th class="py-2 px-3 text-left">管辖局</th>
                <th class="py-2 px-3 text-left">执照名称</th>
                <th class="py-2 px-3 text-left">店铺名称</th>
                <th class="py-2 px-3 text-left">商品名称</th>
                <th class="py-2 px-3 text-right">花费</th>
                <th class="py-2 px-3 text-left">快递单号</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="row in importPreviewRows" :key="row.__importId" class="hover:bg-slate-50">
                <td class="py-2 px-3">
                  <input type="checkbox" :checked="selectedImportRows.includes(row.__importId)" @change="toggleImportRow(row.__importId)" class="h-4 w-4 rounded" />
                </td>
                <td class="py-2 px-3">{{ row.jurisdiction || '-' }}</td>
                <td class="py-2 px-3">{{ row.licenseName || '-' }}</td>
                <td class="py-2 px-3">{{ row.shopName || '-' }}</td>
                <td class="py-2 px-3">{{ row.productName || '-' }}</td>
                <td class="py-2 px-3 text-right">¥{{ Number(row.expense || 0) }}</td>
                <td class="py-2 px-3">{{ row.trackingNumber || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-4 flex flex-col-reverse gap-3 sm:flex-row">
          <button @click="closeImportPreview" class="btn-secondary flex-1">取消</button>
          <button @click="confirmImportRows" :disabled="selectedImportRows.length === 0 || excelImporting" class="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50">
            {{ excelImporting ? '导入中...' : `导入选中 ${selectedImportRows.length} 条` }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showCloudFiles" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm" @click.self="showCloudFiles = false">
      <div class="flex max-h-[85vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white p-4 shadow-2xl sm:p-6">
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 class="text-lg font-bold text-slate-800">☁️ 云端文件管理</h3>
            <p class="mt-1 text-sm text-slate-500">统一查看未关联文件、图片与已上传材料。</p>
          </div>
          <button @click="showCloudFiles = false" class="btn-ghost p-0 text-2xl text-slate-400">×</button>
        </div>

        <div v-if="cloudFilesLoading" class="flex items-center justify-center py-8">
          <div class="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <span class="ml-3 text-slate-500">加载中...</span>
        </div>

        <div v-else-if="allCloudFiles.length === 0" class="py-8 text-center text-slate-400">
          <span class="text-4xl">☁️</span>
          <p class="mt-2">暂无云端文件</p>
        </div>

        <div v-else class="flex-1 overflow-y-auto">
          <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="text-sm text-slate-500">
              共 {{ allCloudFiles.length }} 个文件
              <span class="ml-2 text-orange-500">（未关联: {{ allCloudFiles.length - assignedCount }}）</span>
            </div>
            <button v-if="selectedCloudFiles.length > 0" @click="batchDeleteCloudFiles" class="btn-danger">
              🗑️ 批量删除 ({{ selectedCloudFiles.length }})
            </button>
          </div>

          <table class="w-full text-sm">
            <thead class="sticky top-0 bg-slate-50">
              <tr>
                <th class="w-10 py-2 px-3 text-left">
                  <input type="checkbox" v-model="selectAllCloudFiles" @change="toggleSelectAllCloudFiles" class="h-4 w-4 rounded" />
                </th>
                <th class="py-2 px-3 text-left">预览</th>
                <th class="py-2 px-3 text-left">文件名</th>
                <th class="py-2 px-3 text-left">上传时间</th>
                <th class="py-2 px-3 text-left">关联案件</th>
                <th class="py-2 px-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="file in allCloudFiles" :key="file.Key || file.url" class="hover:bg-slate-50">
                <td class="py-2 px-3">
                  <input :checked="selectedCloudFiles.includes(file)" @change="toggleSelectCloudFile(file)" type="checkbox" class="h-4 w-4 rounded" />
                </td>
                <td class="py-2 px-3">
                  <button type="button" @click="openFilePreview(file)" class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-blue-400 hover:ring-2 hover:ring-blue-100">
                    <img v-if="isImageFile(file)" :src="getCloudFileUrl(file.Key) || file.url" class="h-full w-full bg-slate-50 object-contain p-1" />
                    <span v-else class="text-2xl">{{ getFileIcon(file) }}</span>
                  </button>
                </td>
                <td class="max-w-xs truncate py-2 px-3">
                  <div class="truncate text-sm text-slate-800">{{ getFileName(file) }}</div>
                  <div v-if="file.ocrTitle" class="truncate text-xs text-blue-500">{{ file.ocrTitle }}</div>
                </td>
                <td class="py-2 px-3">{{ file.LastModified ? new Date(file.LastModified).toLocaleString('zh-CN') : (file.uploadedAt ? new Date(file.uploadedAt).toLocaleString('zh-CN') : '-') }}</td>
                <td class="py-2 px-3">
                  <select :value="getFileCaseId(file)" @change="assignFileToCase(file, $event.target.value)" class="input-field py-2 text-xs sm:w-44">
                    <option value="">未关联</option>
                    <option v-for="caseItem in store.cases" :key="caseItem.id" :value="caseItem.id">
                      {{ caseItem.licenseName || caseItem.shopName }}
                    </option>
                  </select>
                </td>
                <td class="py-2 px-3 text-center">
                  <div class="flex items-center justify-center gap-3">
                    <button @click="openFilePreview(file)" class="text-blue-500 hover:text-blue-700">预览</button>
                    <button @click="deleteCloudFile(file)" class="text-red-500 hover:text-red-700">删除</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="showImagePreview" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" @click="closeFilePreview">
      <button @click="closeFilePreview" class="absolute right-4 top-4 text-3xl text-white hover:text-gray-300">×</button>
      <div class="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" @click.stop>
        <div class="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
          <div class="min-w-0">
            <div class="truncate font-semibold text-slate-800">{{ previewFile.name || '文件预览' }}</div>
            <div class="truncate text-xs text-slate-400">{{ previewFile.url }}</div>
          </div>
          <button @click="openPreviewInNewTab" class="text-sm text-blue-500 hover:text-blue-700">新窗口打开</button>
        </div>
        <div class="flex min-h-[70vh] max-h-[80vh] items-center justify-center overflow-auto bg-slate-50 p-4">
          <img v-if="previewFile.kind === 'image'" :src="previewFile.url" class="max-h-[78vh] max-w-full rounded-xl object-contain shadow" />
          <iframe v-else-if="previewFile.kind === 'pdf'" :src="previewFile.url" class="h-[78vh] w-full rounded-xl bg-white"></iframe>
          <div v-else-if="previewFile.kind === 'text'" class="h-[78vh] w-full overflow-auto whitespace-pre-wrap rounded-xl bg-white p-4 text-sm text-slate-700">{{ previewTextContent || '正在加载文本预览...' }}</div>
          <div v-else class="space-y-3 text-center text-slate-500">
            <div class="text-5xl">{{ getFileIcon(previewFile) }}</div>
            <div>当前格式暂不支持弹窗内预览，请点击“新窗口打开”。</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredCases.length === 0" class="rounded-2xl border border-slate-100 bg-white py-24 text-center shadow-sm">
      <div class="mb-6 text-7xl">📂</div>
      <p class="mb-3 text-lg text-slate-400">{{ hasActiveFilters ? '没有找到符合条件的案件' : '还没有任何案件' }}</p>
      <p class="mb-6 text-sm text-slate-400">{{ hasActiveFilters ? '可以试试清空筛选，或者换个关键词。' : '现在就新建第一条案件，后面批量处理会顺很多。' }}</p>
      <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <router-link to="/case/new" class="btn-primary">
          <span>+</span>
          <span>添加第一个案件</span>
        </router-link>
        <button v-if="hasActiveFilters" type="button" @click="clearFilters" class="btn-secondary">
          <span>重置筛选</span>
        </button>
      </div>
    </div>

    <div v-else ref="caseListSectionRef" class="space-y-3">
      <section
        v-for="caseItem in paginatedCases"
        :key="caseItem.id"
        class="card p-0 transition"
        :class="selectedIds.includes(caseItem.id) ? 'border-blue-200 ring-2 ring-blue-100' : 'hover:border-slate-200 hover:shadow-md'"
      >
        <div class="flex flex-col gap-4 p-4 md:p-5 lg:flex-row lg:items-start lg:justify-between">
          <div class="flex min-w-0 flex-1 gap-3">
            <div class="pt-1" @click.stop>
              <input
                type="checkbox"
                :checked="selectedIds.includes(caseItem.id)"
                @change="toggleSelect(caseItem.id)"
                class="h-4 w-4 rounded border-slate-300"
              />
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div class="min-w-0">
                  <div class="mb-2 flex flex-wrap gap-2">
                    <span class="soft-tag">编号 {{ caseItem.caseNumber || '待生成' }}</span>
                  </div>
                  <router-link :to="'/case/' + caseItem.id" class="block break-words text-lg font-semibold text-slate-900 hover:text-slate-600">
                    {{ getPrimaryCaseName(caseItem) }}
                  </router-link>
                  <p class="mt-1 text-sm text-slate-500">{{ getSecondaryCaseName(caseItem) }}</p>
                </div>
                <div class="flex flex-wrap items-center gap-2 md:justify-end">
                  <StatusBadge :status="caseItem.status" :profit="caseItem.profit" />
                  <span v-if="selectedIds.includes(caseItem.id)" class="soft-tag border-blue-200 bg-blue-50 text-blue-600">已选中</span>
                  <div class="rounded-2xl bg-slate-100 px-3 py-2 text-right">
                    <div class="text-[11px] text-slate-500">花费</div>
                    <div class="text-base font-semibold text-slate-800">¥{{ formatMoney(caseItem.expense) }}</div>
                  </div>
                  <div v-if="Number(caseItem.profit)" class="rounded-2xl bg-slate-100 px-3 py-2 text-right">
                    <div class="text-[11px] text-slate-500">赔偿</div>
                    <div class="text-base font-semibold text-slate-800">¥{{ formatMoney(caseItem.profit) }}</div>
                  </div>
                </div>
              </div>

              <div class="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                <div class="rounded-2xl bg-slate-50/80 px-3 py-2">
                  <div class="text-[11px] text-slate-400">商品</div>
                  <div class="mt-1 text-sm font-medium text-slate-700">{{ caseItem.productName || '未填写商品名称' }}</div>
                </div>
                <div class="rounded-2xl bg-slate-50/80 px-3 py-2">
                  <div class="text-[11px] text-slate-400">快递单号</div>
                  <div class="mt-1 break-all text-sm font-medium text-slate-700">{{ caseItem.trackingNumber || '暂无单号' }}</div>
                </div>
                <div class="rounded-2xl bg-slate-50/80 px-3 py-2">
                  <div class="text-[11px] text-slate-400">管辖局</div>
                  <div class="mt-1 text-sm font-medium text-slate-700">{{ caseItem.jurisdiction || '未填写' }}</div>
                </div>
              </div>

              <div class="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                <span class="soft-tag">创建 {{ formatCaseDate(caseItem.createdAt) }}</span>
                <span class="soft-tag">更新 {{ formatCaseDate(caseItem.updatedAt) }}</span>
                <span v-if="caseItem.profit" class="soft-tag text-slate-600">赔偿 ¥{{ formatMoney(caseItem.profit) }}</span>
              </div>
            </div>
          </div>

          <div class="flex gap-2 lg:w-36 lg:flex-col" @click.stop>
            <router-link :to="'/case/' + caseItem.id" class="btn-primary flex-1">查看详情</router-link>
            <button @click="deleteSingleCase(caseItem)" class="btn-secondary flex-1 text-rose-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">删除案件</button>
          </div>
        </div>
      </section>

      <div class="card">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div class="text-sm text-slate-500">
            共 <span class="font-semibold text-slate-700">{{ filteredCases.length }}</span> 条，第 <span class="font-semibold text-slate-700">{{ currentPage }}</span> / <span class="font-semibold text-slate-700">{{ totalPages }}</span> 页
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button @click="currentPage = 1" :disabled="currentPage === 1" class="btn-secondary px-3 py-2 text-xs disabled:opacity-40">首页</button>
            <button @click="currentPage--" :disabled="currentPage === 1" class="btn-secondary px-3 py-2 text-xs disabled:opacity-40">上一页</button>
            <template v-for="p in pageNumbers" :key="`page-${p}`">
              <span v-if="p === '...'" class="px-1 text-sm text-slate-400">...</span>
              <button
                v-else
                @click="currentPage = p"
                class="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-medium transition"
                :class="p === currentPage ? 'bg-slate-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
              >{{ p }}</button>
            </template>
            <button @click="currentPage++" :disabled="currentPage === totalPages" class="btn-secondary px-3 py-2 text-xs disabled:opacity-40">下一页</button>
            <button @click="currentPage = totalPages" :disabled="currentPage === totalPages" class="btn-secondary px-3 py-2 text-xs disabled:opacity-40">末页</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import * as XLSX from 'xlsx'
import { useCaseStore } from '@/stores/case'
import dayjs from 'dayjs'
import { extractFromImage } from '@/lib/doubao'
import { queryExpress } from '@/lib/kuaidi100'
import { uploadBase64ToTos, deleteFromTos, listTosObjects, getTosFileUrl } from '@/lib/tos'
import { readFileAsDataUrl } from '@/lib/document-processing'
import { detectBarcodeFromDataUrl } from '@/lib/barcode'
import { extractTrackingCandidates, normalizeTrackingNumber, pickBestTrackingNumber, isBlockedTrackingCode } from '@/lib/tracking'
import StatusBadge from '@/components/StatusBadge.vue'
import { formatAmount } from '@/lib/case-status'
import { useBgUploadQueue } from '@/composables/useBgUploadQueue'

const store = useCaseStore()
const route = useRoute()
const keyword = ref('')
const filterStatus = ref(route.query.status || '')
const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1
const filterYear = ref(currentYear)
const filterMonth = ref(String(currentMonth).padStart(2, '0'))
const currentPage = ref(1)
const selectedIds = ref([])
const selectAll = ref(false)
const showBatchModal = ref(false)
const batchReportDate = ref('')
const uploadedFiles = ref([])
const ocrLoading = ref(false)
const ocrResult = ref(null)
const toasts = ref([])
let toastTimer = null
const logisticsLoading = ref(false)
const logisticsResult = ref(null)
const batchLogisticsLoading = ref(false)
const batchLogisticsProgress = ref('')
const pageSize = 20
const albumUploads = ref([])
const showImportPreview = ref(false)
const importPreviewRows = ref([])
const selectedImportRows = ref([])
const excelImporting = ref(false)
const photoInputRef = ref(null)
const albumInputRef = ref(null)
const envelopeInputRef = ref(null)
const documentInputRef = ref(null)
const wordInputRef = ref(null)
const fileInputRef = ref(null)
const excelInputRef = ref(null)
const caseListSectionRef = ref(null)

// ── 背景上传队列 ─────────────────────────────────────
const {
  items: uploadQueueItems,
  totalProgress: uploadQueueProgress,
  activeCount: uploadQueueActive,
  hasActive: uploadQueueHasActive,
  enqueueFiles,
  clearFinished: clearUploadFinished,
  retryItem: retryUploadItem,
} = useBgUploadQueue()

// 上传成功后自动关联到案件（仅 OCR 结果中已匹配到案件的情况）
async function uploadQueueCallback(dataUrl, name) {
  const url = await uploadBase64ToTos(dataUrl, name)
  return url
}

// 监听队列完成项，自动关联到案件
watch(uploadQueueItems, async (items) => {
  const doneItems = items.filter(it => it.status === 'done' && !it._handled)
  for (const item of doneItems) {
    item._handled = true
    // 如果该文件是 OCR 识别后入队的，且当时匹配到了案件，自动关联
    const ocrInfo = item._ocrInfo
    if (ocrInfo && ocrInfo.matchedCaseId) {
      try {
        const fileMeta = {
          url: item.url,
          name: item.name,
          date: dayjs().format('YYYY-MM-DD'),
          uploadedAt: dayjs().toISOString(),
          trackingNumber: ocrInfo.trackingNumber || '',
          documentType: ocrInfo.documentType || '普通图片',
        }
        await store.assignCloudFile(item.url, ocrInfo.matchedCaseId, fileMeta,
          ocrInfo.trackingNumber ? { trackingNumber: ocrInfo.trackingNumber } : null)
        if (ocrInfo.caseName) {
          console.log(`[BgUpload] ${item.name} 已自动关联到「${ocrInfo.caseName}」`)
        }
      } catch (err) {
        console.error('[BgUpload] 自动关联失败:', err)
      }
    }
  }
}, { deep: true })

// ── 全选逻辑 ──────────────────────────────────────────
const isAllPageSelected = computed(() => {
  return paginatedCases.value.length > 0 && paginatedCases.value.every(c => selectedIds.value.includes(c.id))
})

function toggleSelectAllPage() {
  if (isAllPageSelected.value) {
    // 取消本页全选
    for (const c of paginatedCases.value) {
      const idx = selectedIds.value.indexOf(c.id)
      if (idx !== -1) selectedIds.value.splice(idx, 1)
    }
  } else {
    // 选中本页
    for (const c of paginatedCases.value) {
      if (!selectedIds.value.includes(c.id)) selectedIds.value.push(c.id)
    }
  }
}

function toggleSelectAllAll() {
  if (selectedIds.value.length === filteredCases.value.length) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredCases.value.map(c => c.id)
  }
}
const showMoreActions = ref(false)

// 监听路由变化，同步筛选状态
watch(() => route.query.status, (newStatus) => {
  filterStatus.value = newStatus || ''
  currentPage.value = 1
})

function triggerInput(inputRef) {
  if (!inputRef?.value) return
  inputRef.value.value = ''
  inputRef.value.click()
}

function triggerPhotoUpload() {
  triggerInput(photoInputRef)
}

function triggerAlbumUpload() {
  triggerInput(albumInputRef)
}

function triggerFileUpload() {
  triggerInput(fileInputRef)
}

function triggerExcelUpload() {
  triggerInput(excelInputRef)
}

function focusMonthlyCases() {
  filterYear.value = currentYear
  filterMonth.value = String(currentMonth).padStart(2, '0')
  currentPage.value = 1
  caseListSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function formatMoney(value) {
  return formatAmount(value)
}

function formatCaseDate(value) {
  if (!value) return '-'
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('MM-DD HH:mm') : String(value)
}

function getStatusLabel(status = '') {
  const labels = {
    pending_report: '未受理',
    accepted: '已受理',
    reported: '不予受理',
    decided: '已调解',
    closed: '已处罚',
    rejected: '不予立案',
    not_punished: '责令改正',
  }
  return labels[status] || status || '-'
}

function exportCasesToExcel() {
  const exportList = selectedIds.value.length > 0
    ? store.cases.filter(item => selectedIds.value.includes(item.id))
    : filteredCases.value

  if (!exportList.length) {
    alert('当前没有可导出的案件')
    return
  }

  const rows = exportList.map(item => ({
    案件编号: item.caseNumber || '',
    当前状态: getStatusLabel(item.status),
    执照名称: item.licenseName || '',
    店铺名称: item.shopName || '',
    商品名称: item.productName || '',
    管辖局: item.jurisdiction || '',
    快递单号: item.trackingNumber || '',
    举报寄件日期: item.reportDate || '',
    签收日期: item.signDate || '',
    受理日期: item.acceptanceDate || '',
    受理方式: item.acceptanceWay || '',
    结果日期: item.decisionDate || '',
    商品价格: Number(item.productPrice || 0),
    花费总额: Number(item.expense || 0),
    赔偿金额: Number(item.profit || 0),
    行政复议: item.hasAdminReview === 'yes' ? '已申请' : '未申请',
    复议结果: item.adminReviewResult || '',
    复议机关: item.adminReviewAuthority || '',
    备注: item.notes || '',
    创建时间: dayjs(item.createdAt).isValid() ? dayjs(item.createdAt).format('YYYY-MM-DD HH:mm') : (item.createdAt || ''),
    更新时间: dayjs(item.updatedAt).isValid() ? dayjs(item.updatedAt).format('YYYY-MM-DD HH:mm') : (item.updatedAt || ''),
  }))

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(rows)
  worksheet['!cols'] = [
    { wch: 18 }, { wch: 12 }, { wch: 24 }, { wch: 18 }, { wch: 24 },
    { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
    { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 30 }, { wch: 18 }, { wch: 18 },
  ]
  XLSX.utils.book_append_sheet(workbook, worksheet, '案件台账')

  const fileLabel = selectedIds.value.length > 0 ? `选中${exportList.length}条` : `筛选结果${exportList.length}条`
  const fileName = `案件台账_${fileLabel}_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
  XLSX.writeFile(workbook, fileName)
}

function getPrimaryCaseName(caseItem = {}) {
  return caseItem.licenseName || caseItem.shopName || '未命名案件'
}

function getSecondaryCaseName(caseItem = {}) {
  const primary = getPrimaryCaseName(caseItem)
  const lines = []
  if (caseItem.shopName && caseItem.shopName !== primary) lines.push(`店铺：${caseItem.shopName}`)
  if (caseItem.licenseName && caseItem.licenseName !== primary) lines.push(`执照：${caseItem.licenseName}`)
  if (caseItem.productName) lines.push(`商品：${caseItem.productName}`)
  return lines.length > 0 ? lines.join(' · ') : '补充店铺、执照或商品信息后更方便跟进'
}

const availableYears = computed(() => {
  const years = [...new Set(store.cases.map(c => dayjs(c.createdAt).year()))]
  const currentYear = new Date().getFullYear()
  if (!years.includes(currentYear)) years.push(currentYear)
  if (!years.includes(currentYear - 1)) years.push(currentYear - 1)
  return years.sort((a, b) => b - a)
})

const filteredCases = computed(() => {
  let list = store.cases

  if (!filterStatus.value) {
    list = list.filter(c => !(c.status === 'decided' && Number(c.profit) > 0))
  }

  if (filterYear.value) {
    list = list.filter(c => dayjs(c.createdAt).year() === Number(filterYear.value))
  }
  if (filterMonth.value) {
    list = list.filter(c => dayjs(c.createdAt).month() + 1 === Number(filterMonth.value))
  }
  if (filterStatus.value) {
    list = list.filter(c => c.status === filterStatus.value)
  }
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(c =>
      (c.shopName || '').toLowerCase().includes(kw) ||
      (c.productName || '').toLowerCase().includes(kw) ||
      (c.licenseName || '').toLowerCase().includes(kw) ||
      (c.jurisdiction || '').toLowerCase().includes(kw) ||
      (c.trackingNumber || '').toLowerCase().includes(kw) ||
      (c.caseNumber || '').toLowerCase().includes(kw)
    )
  }
  return list
})

// 当月统计
const monthlyStats = computed(() => {
  const monthCases = store.cases.filter(c => {
    const created = dayjs(c.createdAt)
    return created.year() === currentYear && created.month() + 1 === currentMonth
  })
  return {
    expense: monthCases.reduce((sum, c) => sum + (Number(c.expense) || 0), 0),
    profit: monthCases.reduce((sum, c) => sum + ((Number(c.profit) || 0) - (Number(c.expense) || 0)), 0),
  }
})

const hasActiveFilters = computed(() => {
  return Boolean(
    keyword.value ||
    filterStatus.value ||
    Number(filterYear.value) !== currentYear ||
    Number(filterMonth.value) !== currentMonth
  )
})

watch([keyword, filterStatus, filterYear, filterMonth], () => {
  currentPage.value = 1
  selectedIds.value = []
  selectAll.value = false
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredCases.value.length / pageSize)))

const paginatedCases = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredCases.value.slice(start, start + pageSize)
})

const pageNumbers = computed(() => {
  const total = totalPages.value
  const cur = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = []
  if (cur <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i)
    pages.push('...')
    pages.push(total)
  } else if (cur >= total - 3) {
    pages.push(1)
    pages.push('...')
    for (let i = total - 4; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    pages.push('...')
    for (let i = cur - 1; i <= cur + 1; i++) pages.push(i)
    pages.push('...')
    pages.push(total)
  }
  return pages
})

function updateReportDate(id, date) {
  store.updateCase(id, { reportDate: date })
}

function clearFilters() {
  keyword.value = ''
  filterStatus.value = ''
  filterYear.value = currentYear
  filterMonth.value = String(currentMonth).padStart(2, '0')
  currentPage.value = 1
}

function toggleSelect(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(idx, 1)
  }
  selectAll.value = selectedIds.value.length > 0 && selectedIds.value.length === paginatedCases.value.length
}

function toggleSelectAll() {
  if (selectAll.value) {
    selectedIds.value = paginatedCases.value.map(c => c.id)
  } else {
    selectedIds.value = []
  }
}

async function batchUpdateReportDate() {
  if (!batchReportDate.value) return
  await store.batchUpdateCases(selectedIds.value, { reportDate: batchReportDate.value })
  selectedIds.value = []
  selectAll.value = false
  batchReportDate.value = ''
  showBatchModal.value = false
}

async function batchDeleteCases() {
  if (selectedIds.value.length === 0) return
  if (!confirm(`确定要删除选中的 ${selectedIds.value.length} 个案件吗？`)) return

  await store.deleteCases(selectedIds.value)
  selectedIds.value = []
  selectAll.value = false
  batchReportDate.value = ''
  showBatchModal.value = false
  alert('批量删除完成')
}

function extractSignDateFromLogistics(result) {
  if (!result || result.status !== '签收') return ''
  const signEntry = (result.details || []).find(item => /签收/.test(item.description || '')) || result.details?.[0]
  const rawTime = signEntry?.time
  if (!rawTime) return ''
  const parsed = dayjs(rawTime)
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : String(rawTime).split(' ')[0]
}

async function batchQueryLogisticsForSelected() {
  if (selectedIds.value.length === 0 || batchLogisticsLoading.value) return

  const casesToQuery = store.cases.filter(c => selectedIds.value.includes(c.id) && c.trackingNumber)
  if (casesToQuery.length === 0) {
    alert('选中的案件里没有可查询的快递单号')
    return
  }

  batchLogisticsLoading.value = true
  let checkedCount = 0
  let signedCount = 0
  let updatedCount = 0
  let failedCount = 0

  try {
    for (let i = 0; i < casesToQuery.length; i++) {
      const item = casesToQuery[i]
      batchLogisticsProgress.value = `${i + 1}/${casesToQuery.length}`
      checkedCount++

      try {
        const result = await queryExpress(item.trackingNumber)
        if (!result || result.status !== '签收') continue

        signedCount++
        const signDate = extractSignDateFromLogistics(result)
        if (signDate) {
          await store.updateCase(item.id, { signDate })
          updatedCount++
        }
      } catch (error) {
        console.error('批量查询快递失败:', item.trackingNumber, error)
        failedCount++
      }
    }

    alert(`批量查询完成：查询 ${checkedCount} 个，识别签收 ${signedCount} 个，更新签收日期 ${updatedCount} 个${failedCount > 0 ? `，失败 ${failedCount} 个` : ''}`)
  } finally {
    batchLogisticsLoading.value = false
    batchLogisticsProgress.value = ''
  }
}

function makeUploadPreview(file, url) {
  return {
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    file,
    name: file.name,
    url,
    selected: true,
  }
}

async function handleAlbumUpload(event) {
  const files = Array.from(event.target.files || [])
  if (files.length === 0) return

  const previews = await Promise.all(files.map(file => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(makeUploadPreview(file, e.target.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })))

  albumUploads.value = [...albumUploads.value, ...previews]
  event.target.value = ''
}

const selectAllAlbumUploads = computed(() => albumUploads.value.length > 0 && albumUploads.value.every(item => item.selected))

function toggleSelectAllAlbumUploads(event) {
  const checked = typeof event?.target?.checked === 'boolean' ? event.target.checked : !selectAllAlbumUploads.value
  albumUploads.value.forEach(item => {
    item.selected = checked
  })
}

function clearAlbumUploads() {
  albumUploads.value = []
}

function getCellValue(row, keys = []) {
  for (const key of keys) {
    const value = row?.[key]
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value
    }
  }
  return ''
}

function normalizeStatus(value) {
  const text = String(value || '').trim()
  const map = {
    '未受理': 'pending_report',
    '待举报': 'pending_report',
    '已受理': 'accepted',
    '不予受理': 'reported',
    '已调解': 'decided',
    '已处罚': 'closed',
    '不予立案': 'rejected',
    '责令改正': 'not_punished',
  }
  return map[text] || 'pending_report'
}

function normalizeHeaderName(value = '') {
  return String(value || '')
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B-\u200D\u2060\u00A0\u3000]/g, '')
    .replace(/[\s\n\r\t]/g, '')
    .replace(/[~!@#$%^&*()_+\-=|\\{}\[\]:;"'“”‘’<>,.?/·！￥…（）—【】、；：，。？《》]/g, '')
    .trim()
    .toLowerCase()
}

const excelFieldAliases = {
  jurisdiction: ['管辖局', '辖区', '所属管辖局', '受理机关', '办理机关'],
  licenseName: ['执照名称', '主体名称', '经营者名称', '营业执照名称'],
  shopName: ['店铺名称', '店铺', '店名', '店铺名', '商铺名称'],
  productName: ['商品名称', '商品', '商品名', '链接商品', '商品标题', '产品名称', '商品信息', '产品信息'],
  expense: ['花费', '费用', '商品价格', '价格', '金额', '购买金额', '花费金额', '支付金额', '付款金额', '实付金额', '订单金额', '商品实付', '实付款'],
  productPrice: ['商品价格', '价格', '花费', '金额', '购买金额', '支付金额', '付款金额', '实付金额'],
  trackingNumber: ['快递单号', '物流单号', '单号', '运单号', '快递号'],
  reportDate: ['举报日期', '寄件日期', '投诉日期'],
  signDate: ['签收日期', '签收时间'],
  notes: ['备注', '说明', '备注信息'],
  status: ['状态', '案件状态'],
}

const excelCoreFields = ['licenseName', 'shopName', 'productName', 'expense']
const excelSupplementaryFields = ['jurisdiction', 'trackingNumber', 'reportDate', 'signDate', 'notes', 'status', 'productPrice']

function parseNumericCell(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  const text = String(value || '')
    .replace(/[￥¥,\s]/g, '')
    .trim()
  if (!text) return 0
  const number = Number(text)
  return Number.isFinite(number) ? number : 0
}

function parseExcelDate(value) {
  if (value === null || value === undefined || value === '') return null

  if (typeof value === 'number') {
    const parsedCode = XLSX.SSF.parse_date_code(value)
    if (parsedCode) {
      return dayjs(new Date(parsedCode.y, parsedCode.m - 1, parsedCode.d)).format('YYYY-MM-DD')
    }
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return dayjs(value).format('YYYY-MM-DD')
  }

  const normalized = String(value)
    .trim()
    .replace(/[年/.]/g, '-')
    .replace(/月/g, '-')
    .replace(/日/g, '')

  const parsed = dayjs(normalized)
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : String(value).trim()
}

function scoreExcelHeaderMatch(header = '', alias = '') {
  if (!header || !alias) return -1
  if (header === alias) return 1000 + alias.length

  const shortAlias = alias.length <= 2
  if (shortAlias) return -1

  if (header.startsWith(alias) || header.endsWith(alias)) return 800 + alias.length
  if (alias.startsWith(header) || alias.endsWith(header)) return header.length >= 4 ? 650 + header.length : -1
  if (alias.length >= 4 && header.includes(alias)) return 500 + alias.length
  if (header.length >= 4 && alias.includes(header)) return 300 + header.length

  return -1
}

function buildExcelFieldIndexMap(row = []) {
  const normalizedRow = row.map(normalizeHeaderName)
  const fieldIndexMap = {}

  Object.entries(excelFieldAliases).forEach(([field, aliases]) => {
    const normalizedAliases = aliases.map(normalizeHeaderName)
    let bestMatchIndex = -1
    let bestMatchScore = -1

    normalizedRow.forEach((header, index) => {
      normalizedAliases.forEach(alias => {
        const score = scoreExcelHeaderMatch(header, alias)
        if (score > bestMatchScore) {
          bestMatchScore = score
          bestMatchIndex = index
        }
      })
    })

    if (bestMatchIndex !== -1) fieldIndexMap[field] = bestMatchIndex
  })

  return fieldIndexMap
}

function normalizeExcelRow(row, fieldIndexMap, index) {
  const getValue = field => {
    const columnIndex = fieldIndexMap[field]
    if (columnIndex === undefined) return ''
    return row[columnIndex] ?? ''
  }

  const expense = parseNumericCell(getValue('expense'))
  const productPrice = parseNumericCell(getValue('productPrice')) || expense || 0

  return {
    __importId: `import_${index}_${Date.now()}`,
    jurisdiction: String(getValue('jurisdiction')).trim(),
    licenseName: String(getValue('licenseName')).trim(),
    shopName: String(getValue('shopName')).trim(),
    productName: String(getValue('productName')).trim(),
    expense,
    productPrice,
    trackingNumber: normalizeTrackingNumber(getValue('trackingNumber')),
    reportDate: parseExcelDate(getValue('reportDate')),
    signDate: parseExcelDate(getValue('signDate')),
    notes: String(getValue('notes')).trim(),
    status: normalizeStatus(getValue('status')),
  }
}

function isImportRowUseful(row) {
  return Boolean(
    row.jurisdiction ||
    row.licenseName ||
    row.shopName ||
    row.productName ||
    row.expense ||
    row.productPrice ||
    row.trackingNumber ||
    row.notes
  )
}

function scoreExcelCandidate(fieldIndexMap, rows = []) {
  const uniqueMatchedColumns = new Set(Object.values(fieldIndexMap)).size
  const coreFieldCount = excelCoreFields.filter(field => fieldIndexMap[field] !== undefined).length
  const supplementaryFieldCount = excelSupplementaryFields.filter(field => fieldIndexMap[field] !== undefined).length
  const sampleRows = rows.slice(0, Math.min(rows.length, 50))

  const rowsWithProductName = rows.filter(row => row.productName).length
  const rowsWithExpense = rows.filter(row => Number(row.expense || row.productPrice)).length
  const rowsWithCorePair = rows.filter(row => row.productName && Number(row.expense || row.productPrice)).length

  const sampleCompleteness = sampleRows.reduce((total, row) => {
    return total
      + (row.licenseName ? 1 : 0)
      + (row.shopName ? 1 : 0)
      + (row.productName ? 1 : 0)
      + (Number(row.expense || row.productPrice) ? 1 : 0)
  }, 0)

  return coreFieldCount * 100000
    + supplementaryFieldCount * 5000
    + uniqueMatchedColumns * 500
    + rowsWithCorePair * 50
    + rowsWithProductName * 20
    + rowsWithExpense * 20
    + sampleCompleteness
    + rows.length
}

function analyzeExcelSheet(sheet) {
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true })
  if (!rows.length) return null

  const maxHeaderScanRows = Math.min(rows.length, 8)
  let best = null

  for (let headerRowIndex = 0; headerRowIndex < maxHeaderScanRows; headerRowIndex++) {
    const fieldIndexMap = buildExcelFieldIndexMap(rows[headerRowIndex] || [])
    const matchedFieldCount = Object.keys(fieldIndexMap).length
    if (matchedFieldCount === 0) continue

    const normalizedRows = rows
      .slice(headerRowIndex + 1)
      .map((row, index) => normalizeExcelRow(row, fieldIndexMap, index))
      .filter(isImportRowUseful)

    const score = scoreExcelCandidate(fieldIndexMap, normalizedRows)
    if (!best || score > best.score) {
      best = {
        headerRowIndex,
        fieldIndexMap,
        matchedFieldCount,
        rows: normalizedRows,
        score,
      }
    }
  }

  return best
}

function pickBestWorkbookSheet(workbook) {
  let best = null

  for (const sheetName of workbook.SheetNames || []) {
    const sheet = workbook.Sheets[sheetName]
    const analysis = analyzeExcelSheet(sheet)
    if (!analysis) continue

    if (!best || analysis.score > best.score) {
      best = {
        ...analysis,
        sheetName,
      }
    }
  }

  return best
}

async function importExcel(event) {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
    const bestSheet = pickBestWorkbookSheet(workbook)
    if (!bestSheet) {
      alert('Excel 里没有可读取的工作表')
      return
    }

    const normalized = bestSheet.rows

    if (normalized.length === 0) {
      alert('没有识别到可导入的数据，请检查表头是否正确')
      return
    }

    importPreviewRows.value = normalized
    selectedImportRows.value = normalized.map(row => row.__importId)
    showImportPreview.value = true
  } catch (err) {
    console.error('Excel导入失败:', err)
    alert('Excel 解析失败，请检查文件格式')
  } finally {
    event.target.value = ''
  }
}

const selectAllImportRows = computed(() => importPreviewRows.value.length > 0 && selectedImportRows.value.length === importPreviewRows.value.length)

function toggleImportRow(id) {
  const idx = selectedImportRows.value.indexOf(id)
  if (idx === -1) {
    selectedImportRows.value.push(id)
  } else {
    selectedImportRows.value.splice(idx, 1)
  }
}

function toggleSelectAllImportRows(event) {
  const checked = typeof event?.target?.checked === 'boolean' ? event.target.checked : !selectAllImportRows.value
  selectedImportRows.value = checked ? importPreviewRows.value.map(row => row.__importId) : []
}

function closeImportPreview() {
  showImportPreview.value = false
  importPreviewRows.value = []
  selectedImportRows.value = []
  excelImporting.value = false
}

async function confirmImportRows() {
  const selected = importPreviewRows.value.filter(row => selectedImportRows.value.includes(row.__importId))
  if (selected.length === 0) return

  excelImporting.value = true
  try {
    await store.createCasesBulk(selected.map(({ __importId, ...row }) => row))
    closeImportPreview()
    alert(`已成功导入 ${selected.length} 条案件`)
  } catch (err) {
    console.error('导入保存失败:', err)
    alert('导入保存失败，请稍后重试')
    excelImporting.value = false
  }
}

// 统一文件上传入口：图片走OCR识别，PDF/Word/文档走文件名解析
// 文件排队列逐一处理，用户确认后再处理下一个
const pendingFileQueue = ref([])
const isProcessingFileQueue = ref(false)

const OCR_CONCURRENCY = 3  // 最多同时识别图片数量
let ocrRunningCount = 0

function handleFileUpload(event) {
  const files = Array.from(event.target.files || [])
  if (files.length === 0) return
  pendingFileQueue.value.push(...files)
  if (!isProcessingFileQueue.value) {
    isProcessingFileQueue.value = true
    processNextBatch()
  }
  event.target.value = ''
}

// 启动下一批，直到达到并发上限或队空
function processNextBatch() {
  while (ocrRunningCount < OCR_CONCURRENCY && pendingFileQueue.value.length > 0) {
    ocrRunningCount++
    const file = pendingFileQueue.value.shift()
    const isImage = file.type.startsWith('image/')
    if (isImage) {
      handleOcrUploadForFile(file).finally(() => {
        ocrRunningCount--
        if (pendingFileQueue.value.length > 0) processNextBatch()
        else if (ocrRunningCount === 0) isProcessingFileQueue.value = false
      })
    } else {
      handleDocUpload(file).finally(() => {
        ocrRunningCount--
        if (pendingFileQueue.value.length > 0) processNextBatch()
        else if (ocrRunningCount === 0) isProcessingFileQueue.value = false
      })
    }
  }
}

// 用户点"×"关闭 OCR 结果时，自动处理下一个文件
// ── 图片文件 → OCR识别 ──────────────────────────────────
async function handleOcrUploadForFile(file) {
  ocrLoading.value = true
  try {
    const dataUrl = await readFileAsDataUrl(file)
    const result = await analyzeDocumentImage(dataUrl)
    console.log('[PATH] handleOcrUploadForFile analyzeDocumentImage:', JSON.stringify({
      _documentTitle: result?._documentTitle,
      documentTitle: result?.documentTitle,
      documentType: result?.documentType,
      isEnvelope: result?.isEnvelope,
      trackingNumber: result?.trackingNumber,
    }))
    console.log('[OCR] 识别结果:', JSON.stringify(result, null, 2))
    if (!result || result._ocrFailed) {
      // OCR完全失败（API报错），仍上传文件但不关联
      await uploadQueueCallback(dataUrl, file.name)
      addToast(`⚠️ ${file.name} OCR识别失败，文件已上传（未关联）`, 'warn')
      return
    }
    const matchedCases = findMatchedCases(result)
    const allCandidates = buildTrackingCandidates(result)
    const xaCandidate = allCandidates.find(t => t.toUpperCase().startsWith('XA'))
    const defaultTracking = xaCandidate || normalizeTrackingNumber(result.trackingNumber || '')
    console.log('[OCR] 匹配到案件:', matchedCases.map(c => c.licenseName || c.shopName))

    // 直接上传文件
    const uploadedUrl = await uploadQueueCallback(dataUrl, file.name)

    // 找到最佳匹配（取第一个匹配到的）
    const bestMatch = matchedCases.length > 0 ? matchedCases[0] : null
    const title2 = extractDocumentTitle(result)
    const ext2 = getFileExtension(file.name)
    let finalName2 = title2
      ? `${title2}${ext2}`
      : (file.name || `图片${ext2}`)
    let nameSource2 = title2 ? 'title' : 'fallback'
    if (/^信封([_.]|\.|$)/.test(finalName2)) {
      finalName2 = title2 ? `${sanitizeFileName(title2)}${ext2}` : (file.name || `图片${ext2}`)
      nameSource2 = 'hard-guard:' + (title2 ? 'title' : 'fallback')
      addToast('🛡️ [OCR通道] HARD-GUARD: "' + title2 + ext2 + '"', 'info')
    }
    if (bestMatch) {
      const fileMeta = {
        url: uploadedUrl,
        name: finalName,
        date: dayjs().format('YYYY-MM-DD'),
        uploadedAt: dayjs().toISOString(),
        trackingNumber: defaultTracking || '',
        documentType: '普通图片',
      }
      await store.assignCloudFile(uploadedUrl, bestMatch.id, fileMeta,
        defaultTracking ? { trackingNumber: defaultTracking } : null)
      addToast('✅ [OCR通道] FINAL=' + finalName2 + ' TITLE=' + (title2 || '-') + ' SOURCE=' + nameSource2 + ' → ' + (bestMatch.licenseName || bestMatch.shopName), 'success')
    } else {
      addToast('📄 [OCR通道] FINAL=' + finalName2 + ' TITLE=' + (title2 || '-') + ' SOURCE=' + nameSource2 + '（未匹配，已存云端）', 'warn')
    }
  } catch (err) {
    console.error('OCR错误:', err)
    addToast('识别失败：' + (err.message || String(err)), 'error')
  } finally {
    ocrLoading.value = false
  }
}

// 文档文件 → 从文件名解析
async function handleDocUpload(file) {
  ocrLoading.value = true
  try {
    const parsed = parseDocFileName(file.name)
    const matchedCases = findMatchedCases(parsed)
    addToast(`📄 解析「${file.name}」→ 执照:${parsed.licenseName || '-'} 店铺:${parsed.shopName || '-'} 单号:${parsed.trackingNumber || '-'}`, 'info')

    // 直接上传文件
    const dataUrl = await readFileAsDataUrl(file)
    const uploadedUrl = await uploadQueueCallback(dataUrl, file.name)

    // 找到最佳匹配
    const bestMatch = matchedCases.length > 0 ? matchedCases[0] : null
    if (bestMatch) {
      const fileMeta = {
        url: uploadedUrl,
        name: file.name,
        date: dayjs().format('YYYY-MM-DD'),
        uploadedAt: dayjs().toISOString(),
        trackingNumber: parsed.trackingNumber || '',
        documentType: '其他文书',
      }
      await store.assignCloudFile(uploadedUrl, bestMatch.id, fileMeta,
        parsed.trackingNumber ? { trackingNumber: parsed.trackingNumber } : null)
      addToast(`✅ 【${parsed.licenseName || parsed.shopName || file.name}】→ ${bestMatch.licenseName || bestMatch.shopName}`, 'success')
    } else {
      addToast(`📄 【${parsed.licenseName || parsed.shopName || file.name}】（未匹配到案件，已存入云端文件）`, 'warn')
    }
  } catch (err) {
    console.error('文档处理错误:', err)
    addToast('处理失败：' + (err.message || String(err)), 'error')
  } finally {
    ocrLoading.value = false
  }
}

// 轻量提示通知（3秒自动消失）
function addToast(message, type = 'info') {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 4000)
}

// 从文件名解析执照/店铺/单号
function parseDocFileName(fileName = '') {
  const name = String(fileName).replace(/\.[^.]+$/, '') // 去掉扩展名
  const parts = name.split(/[_,\-–。、\s/\\]/).filter(p => p.length > 0)
  let licenseName = ''
  let shopName = ''
  let trackingNumber = ''

  for (const part of parts) {
    // 单号候选
    const normalized = part.replace(/[^A-Za-z0-9]/g, '')
    if (/^[A-Z0-9]{10,20}$/i.test(normalized)) {
      trackingNumber = normalized.toUpperCase()
      continue
    }
    // 执照/店铺
    if (/[公司企业店厂行社]$/.test(part) || /(?:有限公司|股份|集团|店铺|旗舰店)/.test(part)) {
      if (!licenseName) licenseName = part
      else if (!shopName) shopName = part
    }
  }

  // 如果没找到执照名，取第一段作为店铺名
  if (!shopName && parts.length > 0) {
    const first = parts[0]
    if (first.length >= 2 && !/^\d+$/.test(first)) {
      shopName = first
    }
  }

  return { licenseName, shopName, trackingNumber }
}

// 复用handleOcrUpload中的匹配和候选构建逻辑
// ── 从 OCR 结果中提取文书标题 ──────────────────────────────
// 优先级：documentTitle 字段 > raw 文本前几行匹配标题规则
const DOCUMENT_TITLE_PATTERNS = [
  // 核心行政文书
  /关于.{4,30}/,                              // 关于xxx的调查回复/答复函/处理意见等（通用标题格式）
  /投诉举报处理告知书/, /投诉受理回执/, /投诉举报答复/, /投诉举报函/,
  /不予立案告知书/, /不予立案通知书/, /不予立案决定书/,
  /行政处罚决定书/, /行政处罚告知书/, /行政处罚听证告知书/,
  /举报答复书/, /举报答复函/, /举报处理告知书/,
  /立案告知书/, /立案审批表/, /立案通知书/,
  /终止调解书/, /终止调解告知书/, /终止行政调解书/,
  /案件移送函/, /案件移送通知书/, /案件处理告知书/,
  /责令改正通知书/, /责令限期改正通知书/, /责令整改通知书/,
  /查封扣押决定书/, /查封（扣押）物品清单/,
  /听证告知书/, /听证通知书/,
  /复议决定书/, /行政复议决定书/,
  /撤销决定书/, /撤销行政处罚决定书/,
  /赔偿决定书/, /补偿决定书/, /行政赔偿决定书/,
  // 通用文书
  /调解书/, /调解协议书/, /和解协议书/,
  /处罚决定/, /处罚告知/, /处罚审批表/,
  /结案报告/, /结案审批表/, /案件终结报告/,
  /行政处理/, /行政处理决定书/,
  /答复函/, /投诉函/, /举报函/, /情况说明/, /授权委托书/,
  /身份证/, /营业执照/, /公证文书/, /法定代表人/,
  /先行登记保存/, /先行登记保存物品清单/,
  /地址确认书/, /送达回证/, /送达地址确认书/,
]

// 清洗非法字符，返回干净的文件名
function sanitizeFileName(name = '') {
  return String(name)
    .replace(/[\\/:*?"<>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^\s+|\s+$/g, '')
    .replace(/^\.+/, '')
    .substring(0, 120)
}

// 判断一行是否"有意义"（不是页码/日期/编号等脏行）
function isMeaningfulTitle(line) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.length < 4 || trimmed.length > 60) return false
  // 纯页码行
  if (/^第\s*[0-9]+\s*页$/.test(trimmed)) return false
  if (/^\d+\s*\/\s*\d+$/.test(trimmed)) return false          // "1 / 2"
  if (/^共\s*\d+\s*页/.test(trimmed)) return false
  // 纯日期/编号前缀开头的行（常见OCR误识别格式，如"2024-01-01 投诉举报..."）
  if (/^[0-9年日月时分秒\-\:\.\s]{8,20}[\u4e00-\u9fa5]/.test(trimmed)) return false
  // 全是符号或单字符
  if (/^[\W_]+$/.test(trimmed)) return false
  if (trimmed.length <= 2) return false
  // 页眉/页脚关键词
  if (/^(此页|空白|签字|签章|盖章|扫描|复印|仅供)/.test(trimmed)) return false
  return true
}

function extractDocumentTitle(aiResult) {
  // 优先用 OCR 层已提取的 _documentTitle
  if (aiResult?._documentTitle && String(aiResult._documentTitle).trim().length > 1) {
    const cleaned = sanitizeFileName(String(aiResult._documentTitle).trim())
    if (isMeaningfulTitle(cleaned)) return cleaned
  }
  if (aiResult?.documentTitle && String(aiResult.documentTitle).trim().length > 1) {
    const cleaned = sanitizeFileName(String(aiResult.documentTitle).trim())
    if (isMeaningfulTitle(cleaned)) return cleaned
  }
  // 从 OCR 原文 raw 文本中按标题规则匹配（取第一条有意义匹配）
  const rawText = aiResult?._rawOcrText || aiResult?.raw || ''
  if (rawText) {
    const lines = rawText.split(/[\n\r]+/).slice(0, 15)
    // 调试：打出前10行供排查
    const candidates = lines.map((l, i) => `${i + 1}. ${l.trim().substring(0, 50)}`).join(' | ')
    // 先尝试"关于"开头的标题（不过 isMeaningfulTitle 的日期过滤）
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('关于') && trimmed.length >= 6 && trimmed.length <= 50) {
        const cleaned = sanitizeFileName(trimmed)
        console.log('[PATH] extractDocumentTitle 关于 match:', cleaned)
        return cleaned
      }
    }
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.length >= 4 && trimmed.length <= 60) {
        for (const pattern of DOCUMENT_TITLE_PATTERNS) {
          if (pattern.test(trimmed) && isMeaningfulTitle(trimmed)) {
            const r = sanitizeFileName(trimmed)
            console.log('[PATH] extractDocumentTitle raw match:', r)
            return r
          }
        }
      }
    }
    console.log('[PATH] extractDocumentTitle: no title, scanned lines:', lines.slice(0, 5).map(l => l.trim().substring(0, 40)))
  }
  return ''
}

function findMatchedCases(result) {
  const ocrLicense = result.licenseName || ''
  const ocrShop = result.shopName || ''
  const ocrTitle = result._documentTitle || ''  // OCR 提取的标题

  console.log('[findMatchedCases] 匹配依据:', { ocrLicense, ocrShop, ocrTitle })

  // 如果有 OCR 标题，先用标题关键字做宽松匹配
  if (ocrTitle) {
    const titleResults = store.cases.filter(c => {
      const caseText = [c.licenseName, c.shopName, c.productName, c.notes]
        .filter(Boolean).join(' ')
      return entityNameMatches(caseText, ocrTitle)
    })
    if (titleResults.length > 0) {
      console.log('[findMatchedCases] ✅ 标题匹配到案件:', titleResults.map(c => c.licenseName || c.shopName))
      return titleResults
    }
  }

  if (!ocrLicense && !ocrShop) {
    console.log('[findMatchedCases] OCR 未识别到执照名或店铺名，无法匹配')
    return []
  }

  const matched = store.cases.filter(c => {
    const caseLicense = c.licenseName || ''
    const caseShop = c.shopName || ''
    if (ocrLicense && ocrShop) {
      return entityNameMatches(caseLicense, ocrLicense) || entityNameMatches(caseShop, ocrShop)
    } else if (ocrLicense) {
      return entityNameMatches(caseLicense, ocrLicense) || entityNameMatches(caseShop, ocrLicense)
    } else {
      return entityNameMatches(caseShop, ocrShop) || entityNameMatches(caseLicense, ocrShop)
    }
  })
  console.log('[findMatchedCases] 执照/店铺匹配结果:', matched.map(c => c.licenseName || c.shopName))
  return matched
}

function buildTrackingCandidates(result) {
  const raw = result.raw || ''
  const aiNums = Array.isArray(result.trackingNumbers)
    ? result.trackingNumbers.filter(t => !isBlockedTrackingCode(t))
    : (result.trackingNumber ? [result.trackingNumber] : [])
  const fromRaw = extractTrackingCandidates(raw)
  return [...new Set([...aiNums, ...fromRaw])].slice(0, 5)
}

function removeFile(idx) {
  uploadedFiles.value.splice(idx, 1)
}

async function deleteSingleCase(caseItem) {
  if (!caseItem?.id) return
  if (!confirm(`确定要删除案件「${getPrimaryCaseName(caseItem)}」吗？`)) return

  await store.deleteCase(caseItem.id)
  selectedIds.value = selectedIds.value.filter(id => id !== caseItem.id)
  selectAll.value = false
  alert('案件已删除')
}

function getFileExtension(fileName = '') {
  const match = String(fileName || '').match(/\.[a-zA-Z0-9]+$/)
  return match ? match[0].toLowerCase() : '.jpg'
}

function getPreferredEntityName(result = {}) {
  return result.licenseName || result.shopName || ''
}

function normalizeEntityName(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[\s（）()【】\[\]<>《》“”"'‘’]/g, '')
    .replace(/有限责任公司|股份有限公司|有限公司|个体工商户|普通合伙|个人独资企业|旗舰店|专营店|专卖店|企业店/g, '')
    .trim()
}

function entityNameMatches(left = '', right = '') {
  const normalizedLeft = normalizeEntityName(left)
  const normalizedRight = normalizeEntityName(right)
  if (!normalizedLeft || !normalizedRight) return false
  return normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft)
}

// 根据 OCR 结果构建最终展示文件名
// 优先级：OCR标题 > 文书类型 > 原始文件名
// ===== 信封专用：提取单号 =====
function extractTrackingNumber(result = {}) {
  const sources = [
    result?.trackingNumber,
    ...(Array.isArray(result?.trackingNumbers) ? result.trackingNumbers : []),
    result?._rawOcrText,
    result?.raw,
  ].filter(Boolean).map(v => String(v))
  const merged = sources.join('\n').toUpperCase()

  // 优先抓 XA 开头单号
  const xaMatch = merged.match(/\bXA[A-Z0-9]{6,30}\b/)
  if (xaMatch) {
    return xaMatch[0].replace(/[^A-Z0-9]/g, '')
  }
  // 其他有效单号（纯大写字母数字，10位以上）
  const genericMatches = merged.match(/\b[A-Z0-9]{10,30}\b/g) || []
  return genericMatches.map(s => s.replace(/[^A-Z0-9]/g, '')).filter(s => s.length >= 10)[0] || ''
}

// ===== 三条链路各自命名 =====

function buildEnvelopeDisplayName(result = {}, originalFileName = '') {
  const extension = getFileExtension(originalFileName)
  const tracking = extractTrackingNumber(result)
  if (tracking && /^XA[A-Z0-9]{6,30}$/.test(tracking)) {
    return `信封_${tracking}${extension}`
  }
  if (tracking) {
    return `信封_${tracking}${extension}`
  }
  return `信封${extension}`
}

function buildDocumentDisplayName(result = {}, originalFileName = '', fallbackLabel = '文书') {
  const extension = getFileExtension(originalFileName)
  // 文书通道：标题优先，绝不返回"信封"
  const title = extractDocumentTitle(result)
  const source = title ? 'document-title' : (originalFileName ? 'original-file' : 'fallback')
  const finalName = title ? `${title}${extension}` : (originalFileName || `${fallbackLabel}${extension}`)
  console.log('[PATH] buildDocumentDisplayName', { originalFileName, title, extension, source, finalName, documentType: result?.documentType, isEnvelope: result?.isEnvelope })
  return finalName
}

function buildWordDisplayName(originalFileName = '', fallbackLabel = '文书') {
  const extension = getFileExtension(originalFileName)
  return originalFileName || `${fallbackLabel}${extension}`
}

async function analyzeDocumentImage(dataUrl) {
  try {
    const base64Data = dataUrl.split(',')[1]
    let aiResult = await extractFromImage(base64Data).catch(() => null)
    // 第一次失败则重试一次
    if (!aiResult) {
      await new Promise(r => setTimeout(r, 1000))
      aiResult = await extractFromImage(base64Data).catch(() => null)
    }
    // 打印 OCR 原始返回，方便核对
    console.log('[OCR原始返回] aiResult:', JSON.stringify(aiResult, null, 2))
    let barcodeResult = {}
    try {
      barcodeResult = await detectBarcodeFromDataUrl(dataUrl) || {}
    } catch { barcodeResult = {} }

    const aiNumbers = Array.isArray(aiResult?.trackingNumbers)
      ? aiResult.trackingNumbers.filter(t => !isBlockedTrackingCode(t))
      : (aiResult?.trackingNumber ? [aiResult.trackingNumber] : [])
    const barcodeTracking = isBlockedTrackingCode(barcodeResult?.trackingNumber) ? '' : barcodeResult?.trackingNumber
    const barcodeRawValue = isBlockedTrackingCode(barcodeResult?.rawValue) ? '' : barcodeResult?.rawValue
    const trackingCandidates = extractTrackingCandidates(JSON.stringify(aiResult || {})).filter(value => !isBlockedTrackingCode(value))

    const trackingNumber = pickBestTrackingNumber(
      ...aiNumbers,
      barcodeTracking,
      barcodeRawValue,
      trackingCandidates
    )

    // ── 提取文书标题（从 OCR 结果的 documentTitle 字段）────────────
    const documentTitle = extractDocumentTitle(aiResult)
    console.log('[OCR提取标题] documentTitle:', documentTitle)

    const merged = {
      ...(aiResult || {}),
      trackingNumber: isBlockedTrackingCode(trackingNumber) ? '' : trackingNumber,
      trackingNumbers: [...new Set([trackingNumber, ...aiNumbers, ...trackingCandidates])].filter(t => !isBlockedTrackingCode(t) && t),
      licenseName: (aiResult?.licenseName || aiResult?.shopName || ''),
      shopName: (aiResult?.shopName || aiResult?.licenseName || ''),
      barcodeRawValue,
      barcodeFormat: barcodeResult?.format || '',
      isEnvelope: Boolean(aiResult?.isEnvelope || aiResult?.documentType === '信封' || trackingNumber),
      _ocrFailed: !aiResult,
      _documentTitle: documentTitle,   // 显式存储提取的标题
      _rawOcrText: aiResult?.raw || (aiResult ? JSON.stringify(aiResult) : ''), // OCR 原始文本
    }

    if (!merged.documentType) {
      merged.documentType = merged.isEnvelope ? '信封' : '普通图片'
    }

    console.log('[analyzeDocumentImage] 最终 OCR 结果:', {
      licenseName: merged.licenseName,
      shopName: merged.shopName,
      documentTitle: merged._documentTitle,
      documentType: merged.documentType,
      trackingNumber: merged.trackingNumber,
      _ocrFailed: merged._ocrFailed,
    })

    return merged
  } catch (err) {
    console.error('[analyzeDocumentImage] 全面异常:', err)
    return { _ocrFailed: true, licenseName: '', shopName: '', trackingNumber: '', trackingNumbers: [], isEnvelope: false, _documentTitle: '', _rawOcrText: '' }
  }
}

async function handleOcrUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  ocrLoading.value = true
  ocrResult.value = null

  try {
    const dataUrl = await readFileAsDataUrl(file)
    const result = await analyzeDocumentImage(dataUrl)

    if (!result) {
      alert('AI识别失败，请重试或使用传统OCR')
      return
    }

    const matchedCases = store.cases.filter(c => {
      const ocrName = result.licenseName || result.shopName || ''
      if (!ocrName) return false
      return entityNameMatches(c.licenseName || c.shopName || '', ocrName)
    })

    // 提取所有候选单号（AI返回的 + 从原始文本重新提取的，取最多5个）
    // 优先选 XA 开头的单号，其次选数字最多的
    const rawTextForTracking = result.raw || ''
    const aiNumbers = Array.isArray(result.trackingNumbers)
      ? result.trackingNumbers.filter(t => !isBlockedTrackingCode(t))
      : (result.trackingNumber ? [result.trackingNumber] : [])
    const candidatesFromRaw = extractTrackingCandidates(rawTextForTracking)
    const allCandidates = [...new Set([...aiNumbers, ...candidatesFromRaw])].slice(0, 5)

    // 自动选：XA 开头 > 纯数字 > 其他
    const xaCandidate = allCandidates.find(t => t.toUpperCase().startsWith('XA'))
    const defaultTracking = xaCandidate || normalizeTrackingNumber(result.trackingNumber || rawTextForTracking)

    ocrResult.value = {
      fileName: file.name,   // 【区分】原始文件名（不是 OCR 结果）
      documentTitle: result._documentTitle || '',  // 【关键】OCR 提取的文书标题
      licenseName: result.licenseName || '',
      shopName: result.shopName || '',
      documentType: result.documentType || '',
      trackingNumber: defaultTracking,
      trackingCandidates: allCandidates,
      matchedCases,
      rawText: result._rawOcrText || result.raw || JSON.stringify(result, null, 2), // OCR 原始文本（用于核对）
      aiResult: result,
      _ocrFailed: result._ocrFailed,
    }

    console.log('[handleOcrUpload] OCR 完成:', {
      fileName: file.name,
      documentTitle: result._documentTitle || '(未识别到)',
      licenseName: result.licenseName || '(空)',
      shopName: result.shopName || '(空)',
      documentType: result.documentType,
      matchedCount: matchedCases.length,
      _ocrFailed: result._ocrFailed,
    })

  } catch (err) {
    console.error('OCR错误:', err)
    alert('OCR识别失败，请重试')
  } finally {
    ocrLoading.value = false
    event.target.value = ''
  }
}

// 关联OCR结果到案件（文件入背景上传队列，不阻塞页面）
function applyOcrToCase(caseId) {
  if (!ocrResult.value) return
  const result = ocrResult.value

  const matchedCase = store.cases.find(c => c.id === caseId)

  // 把文件加入背景上传队列
  if (result.sourceFile) {
    const ocrInfo = {
      matchedCaseId: caseId,
      caseName: matchedCase ? (matchedCase.licenseName || matchedCase.shopName) : '',
      trackingNumber: result.trackingNumber || '',
      documentType: result.aiResult?.documentType || (result.isDoc ? '其他文书' : '普通图片'),
    }
    enqueueFiles([result.sourceFile], uploadQueueCallback)
    // 给刚入队的项附加 OCR 信息（hack: 利用 watch 异步写入）
    setTimeout(() => {
      const queue = uploadQueueItems.value
      const lastItem = queue[queue.length - 1]
      if (lastItem && lastItem.name === result.sourceFile.name && !lastItem._ocrInfo) {
        lastItem._ocrInfo = ocrInfo
      }
    }, 100)
  }

  const updates = {}
  if (result.trackingNumber) {
    updates.trackingNumber = result.trackingNumber
  }
  store.updateCase(caseId, updates)

  ocrResult.value = null
  logisticsResult.value = null
  alert('已成功关联到案件，文件正在后台上传！')
}

// 查询物流
async function queryLogistics(trackingNumber) {
  if (!trackingNumber) return

  logisticsLoading.value = true
  logisticsResult.value = null

  try {
    const result = await queryExpress(trackingNumber)
    if (result) {
      logisticsResult.value = result
    } else {
      alert('未查询到物流信息，请稍后重试')
    }
  } catch (err) {
    console.error('物流查询失败:', err)
    alert('物流查询失败')
  }

  logisticsLoading.value = false
}

// OCR识别后一键关联并记录签收时间（文件入背景上传队列）
function applyOcrToCaseWithSign(caseId, signTime) {
  if (!ocrResult.value) return
  const result = ocrResult.value

  const matchedCase = store.cases.find(c => c.id === caseId)

  // 文件入背景上传队列
  if (result.sourceFile) {
    const ocrInfo = {
      matchedCaseId: caseId,
      caseName: matchedCase ? (matchedCase.licenseName || matchedCase.shopName) : '',
      trackingNumber: result.trackingNumber || '',
      documentType: result.aiResult?.documentType || (result.isDoc ? '其他文书' : '普通图片'),
    }
    enqueueFiles([result.sourceFile], uploadQueueCallback)
    setTimeout(() => {
      const queue = uploadQueueItems.value
      const lastItem = queue[queue.length - 1]
      if (lastItem && lastItem.name === result.sourceFile.name && !lastItem._ocrInfo) {
        lastItem._ocrInfo = ocrInfo
      }
    }, 100)
  }

  const updates = {}
  if (result.trackingNumber) {
    updates.trackingNumber = result.trackingNumber
  }
  if (signTime) {
    updates.signDate = signTime.split(' ')[0]
  }

  store.updateCase(caseId, updates)

  ocrResult.value = null
  logisticsResult.value = null
  alert('已成功关联到案件并记录签收时间，文件正在后台上传！')
}

function findMatchedCase(licenseName = '') {
  if (!licenseName) return null
  return store.cases.find(c =>
    entityNameMatches(c.licenseName || c.shopName || '', licenseName)
  )
}

async function processImageUpload(imageBase64, fileName, labelPrefix = '图片') {
  processingStatus.value = '原图上传并识别中...'
  const [url, result] = await Promise.all([
    uploadBase64ToTos(imageBase64, fileName),
    analyzeDocumentImage(imageBase64),
  ])

  if (!url) {
    throw new Error('上传失败，请重试')
  }

  const displayName = buildDocumentDisplayName(result, fileName, labelPrefix)
  const fileMeta = {
    url,
    name: displayName,
    date: dayjs().format('YYYY-MM-DD'),
    uploadedAt: dayjs().toISOString(),
    trackingNumber: normalizeTrackingNumber(result?.trackingNumber),
    documentType: result?.documentType || '',
  }

  const matchedCase = result?.licenseName ? findMatchedCase(result.licenseName) : null

  if (matchedCase) {
    const nextImages = Array.isArray(matchedCase.images) ? matchedCase.images : []
    await store.assignCloudFile(url, matchedCase.id, fileMeta, (fileMeta.trackingNumber || nextImages.length === 0)
      ? { trackingNumber: fileMeta.trackingNumber || matchedCase.trackingNumber || '' }
      : null)
    totalCloudFiles.value += 1
    return { matched: true, matchedCaseName: matchedCase.licenseName || matchedCase.shopName, analysis: result }
  }

  await store.addUnassignedImage(fileMeta)
  totalCloudFiles.value += 1
  return { matched: false, analysis: result }
}

// 拍照上传 - 拍照后立即优化、上传、AI识别并匹配
// ── 上传信封 → OCR → 信封分类 ──────────────────────────────
async function handleEnvelopeUpload(event) {
  addToast('📮 开始处理信封上传...', 'info')
  const files = Array.from(event.target.files || [])
  if (files.length === 0) { addToast('未选择文件', 'warn'); ocrLoading.value = false; return }
  ocrLoading.value = true
  try {
    await Promise.all(files.map(async (file) => {
      try {
        addToast('🔄 读取文件: ' + file.name, 'info')
        const dataUrl = await readFileAsDataUrl(file)
        addToast('🔍 AI识别中...', 'info')
        const result = await analyzeDocumentImage(dataUrl)
        if (result._ocrFailed) {
          addToast('⚠️ AI识别失败，文件仍会上传', 'warn')
        }
        addToast('☁️ 上传到云端...', 'info')
        const uploadedUrl = await uploadQueueCallback(dataUrl, file.name)
        if (!uploadedUrl) {
          addToast('❌ 云端上传失败，请重试', 'error')
          return
        }
        addToast('🔗 匹配案件中...', 'info')
        const matchedCases = findMatchedCases(result)
        const bestMatch = matchedCases[0] || null
        if (bestMatch) {
          await store.assignCloudFile(uploadedUrl, bestMatch.id, {
            url: uploadedUrl, name: buildEnvelopeDisplayName(result, file.name),
            date: dayjs().format('YYYY-MM-DD'),
            uploadedAt: dayjs().toISOString(),
            trackingNumber: result.trackingNumber || '',
            documentType: '信封',
          }, result.trackingNumber ? { trackingNumber: result.trackingNumber } : null)
          addToast(`✅ 【${extractDocumentTitle(result) || file.name}】→ ${bestMatch.licenseName || bestMatch.shopName}（信封）`, 'success')
        } else {
          // 未匹配到案件 → 必须写入 cloud_files 表才算成功
          try {
            await store.assignCloudFile(uploadedUrl, null, {
              url: uploadedUrl, name: buildEnvelopeDisplayName(result, file.name),
              date: dayjs().format('YYYY-MM-DD'),
              uploadedAt: dayjs().toISOString(),
              trackingNumber: result.trackingNumber || '',
              documentType: '信封',
            })
            addToast(`📮 ${buildEnvelopeDisplayName(result, file.name)}（未匹配到案件，已存入云端文件）`, 'warn')
          } catch (err) {
            console.error('[信封上传] ❌ 未匹配文件写入 cloud_files 失败:', err)
            addToast('❌ ' + buildEnvelopeDisplayName(result, file.name) + ' 已上传云端但未入库，请联系管理员', 'error')
          }
        }
      } catch (innerErr) {
        console.error('[DEBUG] 信封单文件处理失败:', innerErr)
        addToast('处理失败: ' + (innerErr.message || String(innerErr)), 'error')
      }
    }))
  } catch (err) {
    console.error('信封上传错误:', err)
    addToast('信封上传失败：' + (err.message || String(err)), 'error')
  } finally {
    ocrLoading.value = false
    event.target.value = ''
  }
}

// ── 上传文书 → OCR → 文书分类 ─────────────────────────────
async function handleDocumentUpload(event) {
  console.log('[PATH] handleDocumentUpload called')
  addToast('📄 开始处理文书上传...', 'info')
  const files = Array.from(event.target.files || [])
  if (files.length === 0) { addToast('未选择文件', 'warn'); ocrLoading.value = false; return }
  ocrLoading.value = true
  try {
    await Promise.all(files.map(async (file) => {
      try {
        console.log('[PATH] handleDocumentUpload file:', file.name)
        addToast('🔄 读取文件: ' + file.name, 'info')
        const dataUrl = await readFileAsDataUrl(file)
        addToast('🔍 AI识别中...', 'info')
        const result = await analyzeDocumentImage(dataUrl)
        console.log('[PATH] analyzeDocumentImage result:', JSON.stringify({
          _documentTitle: result?._documentTitle,
          documentTitle: result?.documentTitle,
          documentType: result?.documentType,
          isEnvelope: result?.isEnvelope,
          trackingNumber: result?.trackingNumber,
          raw: (result?._rawOcrText || result?.raw || '').substring(0, 100)
        }))
        addToast('☁️ 上传到云端...', 'info')
        const uploadedUrl = await uploadQueueCallback(dataUrl, file.name)
        if (!uploadedUrl) {
          addToast('❌ 云端上传失败，请重试', 'error')
          return
        }
        addToast('🔗 匹配案件中...', 'info')
        const matchedCases = findMatchedCases(result)
        const bestMatch = matchedCases[0] || null
        // 文书通道：先统一提取标题，再生成名字，来源透明
        const title = extractDocumentTitle(result)  // OCR title stored separately, NOT used for rename
        const ext = getFileExtension(file.name)
        const finalName = file.name || `文书${ext}`   // 稳定方案：保留原文件名，不自动改名
        const nameSource = 'original'
        if (bestMatch) {
          await store.assignCloudFile(uploadedUrl, bestMatch.id, {
            url: uploadedUrl, name: finalName,
            ocrTitle: title || '',   // OCR标题独立存储，不改文件名
            date: dayjs().format('YYYY-MM-DD'),
            uploadedAt: dayjs().toISOString(),
            trackingNumber: result.trackingNumber || '',
            documentType: '其他文书',
          }, result.trackingNumber ? { trackingNumber: result.trackingNumber } : null)
          addToast('✅ ' + finalName + (title ? ' [' + title + ']' : '') + ' → ' + (bestMatch.licenseName || bestMatch.shopName), 'success')
        } else {
          try {
            await store.assignCloudFile(uploadedUrl, null, {
              url: uploadedUrl, name: finalName,
              ocrTitle: title || '',
              date: dayjs().format('YYYY-MM-DD'),
              uploadedAt: dayjs().toISOString(),
              trackingNumber: result.trackingNumber || '',
              documentType: '其他文书',
            })
            addToast('📄 ' + finalName + (title ? ' [' + title + ']' : '') + '（未匹配，已存云端）', 'warn')
          } catch (err) {
            console.error('[文书上传] ❌ 未匹配文件写入 cloud_files 失败:', err)
            addToast('❌ ' + finalName + ' 上传失败', 'error')
          }
        }
      } catch (innerErr) {
        console.error('[DEBUG] 文书单文件处理失败:', innerErr)
        addToast('处理失败: ' + (innerErr.message || String(innerErr)), 'error')
      }
    }))
  } catch (err) {
    console.error('文书上传错误:', err)
    addToast('文书上传失败：' + (err.message || String(err)), 'error')
  } finally {
    ocrLoading.value = false
    event.target.value = ''
  }
}

// ── 上传Word → 文件名解析 → 文书分类 ──────────────────────
async function handleWordUpload(event) {
  addToast('📝 开始处理Word上传...', 'info')
  const files = Array.from(event.target.files || [])
  if (files.length === 0) { addToast('未选择文件', 'warn'); ocrLoading.value = false; return }
  ocrLoading.value = true
  try {
    await Promise.all(files.map(async (file) => {
      try {
        addToast('🔄 解析文件名: ' + file.name, 'info')
        const parsed = parseDocFileName(file.name)
        addToast('☁️ 上传到云端...', 'info')
        const dataUrl = await readFileAsDataUrl(file)
        const uploadedUrl = await uploadQueueCallback(dataUrl, file.name)
        if (!uploadedUrl) {
          addToast('❌ 云端上传失败，请重试', 'error')
          return
        }
        addToast('🔗 匹配案件中...', 'info')
        const matchedCases = findMatchedCases(parsed)
        const bestMatch = matchedCases[0] || null
        if (bestMatch) {
          await store.assignCloudFile(uploadedUrl, bestMatch.id, {
            url: uploadedUrl, name: buildWordDisplayName(file.name),
            date: dayjs().format('YYYY-MM-DD'),
            uploadedAt: dayjs().toISOString(),
            trackingNumber: parsed.trackingNumber || '',
            documentType: '其他文书',
          }, parsed.trackingNumber ? { trackingNumber: parsed.trackingNumber } : null)
          addToast(`✅ 【${buildWordDisplayName(file.name)}】→ ${bestMatch.licenseName || bestMatch.shopName}（Word）`, 'success')
        } else {
          try {
            await store.assignCloudFile(uploadedUrl, null, {
              url: uploadedUrl, name: buildWordDisplayName(file.name),
              date: dayjs().format('YYYY-MM-DD'),
              uploadedAt: dayjs().toISOString(),
              trackingNumber: parsed.trackingNumber || '',
              documentType: '其他文书',
            })
            addToast(`📝 ${buildWordDisplayName(file.name)}（未匹配到案件，已存入云端文件）`, 'warn')
          } catch (err) {
            console.error('[Word上传] ❌ 未匹配文件写入 cloud_files 失败:', err)
            addToast('❌ ' + buildWordDisplayName(file.name) + ' 已上传云端但未入库，请联系管理员', 'error')
          }
        }
      } catch (innerErr) {
        console.error('[DEBUG] Word单文件处理失败:', innerErr)
        addToast('处理失败: ' + (innerErr.message || String(innerErr)), 'error')
      }
    }))
  } catch (err) {
    console.error('Word上传错误:', err)
    addToast('Word上传失败：' + (err.message || String(err)), 'error')
  } finally {
    ocrLoading.value = false
    event.target.value = ''
  }
}

async function handleScanUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  uploadLoading.value = true
  processingStatus.value = '准备处理拍照文件...'

  try {
    const imageBase64 = await readFileAsDataUrl(file)
    const fileName = file.name || `camera_${Date.now()}${getFileExtension(file.name) || '.jpg'}`
    const result = await processImageUpload(imageBase64, fileName, '拍照')
    uploadResult.value = result.matched
      ? { success: true, message: `✅ 上传成功！已按执照名称匹配到：「${result.matchedCaseName}」` }
      : { success: false, message: '⚠️ 上传成功，但未识别到执照名称匹配案件，请在云端文件手动分配' }

    if (showCloudFiles.value) {
      await loadCloudFiles()
    }
  } catch (err) {
    console.error('Camera upload failed:', err)
    uploadResult.value = { success: false, message: '处理失败：' + err.message }
  }

  uploadLoading.value = false
  event.target.value = ''
}

async function confirmAlbumUpload() {
  const selected = albumUploads.value.filter(item => item.selected)
  if (selected.length === 0) {
    alert('请先选择要上传的图片')
    return
  }

  uploadLoading.value = true
  let successCount = 0
  let unmatchedCount = 0

  try {
    for (const item of selected) {
      processingStatus.value = `正在处理 ${item.name}`
      const result = await processImageUpload(item.url, item.name || `album_${Date.now()}.jpg`, '相册')
      if (result.matched) {
        successCount++
      } else {
        unmatchedCount++
      }
    }

    uploadResult.value = {
      success: true,
      message: `相册上传完成：匹配成功 ${successCount} 张，待手动分配 ${unmatchedCount} 张`
    }
    albumUploads.value = albumUploads.value.filter(item => !item.selected)

    if (showCloudFiles.value) {
      await loadCloudFiles()
    }
  } catch (err) {
    console.error('Album upload failed:', err)
    uploadResult.value = { success: false, message: '相册上传失败：' + err.message }
  }

  uploadLoading.value = false
}

// 云端文件管理
const showCloudFiles = ref(false)
const allCloudFiles = ref([])
const cloudFilesLoading = ref(false)
const showImagePreview = ref(false)
const previewImageUrl = ref('')
const previewFile = ref({ url: '', kind: '', name: '' })
const previewTextContent = ref('')
const totalCloudFiles = ref(0)
const uploadLoading = ref(false)
const processingStatus = ref('')
const uploadResult = ref(null)
const selectedCloudFiles = ref([])
const selectAllCloudFiles = ref(false)

function dedupeCloudFiles(list = []) {
  const map = new Map()
  list.filter(Boolean).forEach(file => {
    const key = file.url || file.Key || getCloudFileUrl(file.Key)
    if (!key) return
    map.set(key, { ...file, url: file.url || getCloudFileUrl(file.Key) || key })
  })
  return Array.from(map.values())
}

async function loadCloudFiles() {
  cloudFilesLoading.value = true
  try {
    const storageFiles = await listTosObjects('case-images/')
    const assignedFiles = store.cases.flatMap(c => (Array.isArray(c.images) ? c.images : []).map(img => ({
      ...img,
      url: img.url,
      name: img.name || `${c.shopName || c.licenseName || '案件文件'}`,
    })))

    const mergedFiles = dedupeCloudFiles([
      ...store.unassignedImages,
      ...assignedFiles,
      ...storageFiles.map(file => ({ ...file, url: getCloudFileUrl(file.Key) }))
    ])

    allCloudFiles.value = mergedFiles
    totalCloudFiles.value = mergedFiles.length
  } catch (err) {
    console.error('加载云端文件失败:', err)
    allCloudFiles.value = dedupeCloudFiles([
      ...store.unassignedImages,
      ...store.cases.flatMap(c => Array.isArray(c.images) ? c.images : [])
    ])
    totalCloudFiles.value = allCloudFiles.value.length
  }
  cloudFilesLoading.value = false
}

function getCloudFileUrl(key) {
  return getTosFileUrl(key)
}

function isImageFile(file) {
  const key = file.Key || ''
  const name = file.name || ''
  const lower = (key + name).toLowerCase()
  return lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif') || lower.endsWith('.webp') || lower.endsWith('.bmp')
}

function getFileName(file) {
  if (file?.name) return file.name
  if (file?.Key) {
    const parts = file.Key.split('/')
    return parts[parts.length - 1]
  }
  if (file?.url) {
    try {
      const urlObj = new URL(file.url, window.location.origin)
      const pathParts = urlObj.pathname.split('/')
      return pathParts[pathParts.length - 1]
    } catch {
      return '未命名文件'
    }
  }
  return '未命名文件'
}

function getPreviewKind(file) {
  const name = getFileName(file).toLowerCase()
  if (/\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(name)) return 'image'
  if (/\.pdf$/i.test(name)) return 'pdf'
  if (/\.(txt|md|json|csv)$/i.test(name)) return 'text'
  return 'other'
}

function getFileIcon(file) {
  const kind = typeof file === 'string' ? file : getPreviewKind(file)
  if (kind === 'image') return '🖼️'
  if (kind === 'pdf') return '📕'
  if (kind === 'text') return '📝'
  return '📄'
}

function getFileCaseId(file) {
  const fileUrl = file.url || getCloudFileUrl(file.Key)
  for (const c of store.cases) {
    if (c.images && c.images.some(img => img.url === fileUrl)) {
      return c.id
    }
  }
  return ''
}

async function assignFileToCase(file, caseId) {
  const fileUrl = file.url || getCloudFileUrl(file.Key)
  const trackingNumber = normalizeTrackingNumber(file.trackingNumber)
  await store.assignCloudFile(fileUrl, caseId, {
    name: getFileName(file),
    date: file.date || dayjs().format('YYYY-MM-DD'),
    uploadedAt: file.uploadedAt || file.LastModified || dayjs().toISOString(),
    trackingNumber,
  }, caseId && trackingNumber ? { trackingNumber } : null)

  if (caseId) {
    alert('已关联到案件！')
  }
}

async function deleteCloudFile(file) {
  const fileUrl = file.url || getCloudFileUrl(file.Key)
  const fileKey = file.Key

  if (!confirm('确定要删除这个文件吗？')) return

  try {
    if (fileKey) {
      await deleteFromTos(getCloudFileUrl(fileKey))
    } else {
      await deleteFromTos(fileUrl)
    }
  } catch (err) {
    console.error('云端删除失败:', err)
    alert('删除失败，请稍后重试')
    return
  }

  await store.removeCloudFileReferences(fileUrl)

  allCloudFiles.value = allCloudFiles.value.filter(f => (f.url || getCloudFileUrl(f.Key)) !== fileUrl)
  totalCloudFiles.value = allCloudFiles.value.length

  alert('删除成功！')
}

function toggleSelectCloudFile(file) {
  const idx = selectedCloudFiles.value.indexOf(file)
  if (idx === -1) {
    selectedCloudFiles.value.push(file)
  } else {
    selectedCloudFiles.value.splice(idx, 1)
  }
}

function toggleSelectAllCloudFiles() {
  if (selectAllCloudFiles.value) {
    selectedCloudFiles.value = [...allCloudFiles.value]
  } else {
    selectedCloudFiles.value = []
  }
}

async function batchDeleteCloudFiles() {
  if (selectedCloudFiles.value.length === 0) return
  if (!confirm(`确定要删除选中的 ${selectedCloudFiles.value.length} 个文件吗？`)) return

  let successCount = 0
  let failCount = 0
  const removedUrls = []

  for (const file of selectedCloudFiles.value) {
    const fileUrl = file.url || getCloudFileUrl(file.Key)
    const fileKey = file.Key

    try {
      if (fileKey) {
        await deleteFromTos(getCloudFileUrl(fileKey))
      } else {
        await deleteFromTos(fileUrl)
      }
      removedUrls.push(fileUrl)
      successCount++
    } catch (err) {
      console.error('云端删除失败:', err)
      failCount++
    }
  }

  if (removedUrls.length > 0) {
    await store.removeCloudFileReferences(removedUrls)
  }

  await loadCloudFiles()
  selectedCloudFiles.value = []
  selectAllCloudFiles.value = false

  alert(`批量删除完成：成功 ${successCount} 个${failCount > 0 ? '，失败 ' + failCount + ' 个' : ''}`)
}

async function openFilePreview(file) {
  const url = file?.url || getCloudFileUrl(file?.Key)
  if (!url) return

  const kind = getPreviewKind(file)
  previewImageUrl.value = url
  previewFile.value = {
    url,
    kind,
    name: getFileName(file),
  }
  previewTextContent.value = ''

  if (kind === 'text') {
    try {
      previewTextContent.value = await fetch(url).then(res => res.text())
    } catch (error) {
      previewTextContent.value = '文本预览加载失败，请点击“新窗口打开”。'
    }
  }

  showImagePreview.value = true
}

function closeFilePreview() {
  showImagePreview.value = false
  previewImageUrl.value = ''
  previewFile.value = { url: '', kind: '', name: '' }
  previewTextContent.value = ''
}

function openPreviewInNewTab() {
  if (!previewFile.value.url) return
  window.open(previewFile.value.url, '_blank', 'noopener,noreferrer')
}

// 计算未关联文件数
const assignedCount = computed(() => {
  let count = 0
  allCloudFiles.value.forEach(f => {
    const fileUrl = f.url || getCloudFileUrl(f.Key)
    if (store.cases.some(c => c.images && c.images.some(img => img.url === fileUrl))) {
      count++
    }
  })
  return count
})

// 监听云端文件弹窗打开
watch(showCloudFiles, (val) => {
  if (val) {
    loadCloudFiles()
  } else {
    selectedCloudFiles.value = []
    selectAllCloudFiles.value = false
  }
})
</script>

<template>
  <div>
    <!-- 图片上传区域 -->
    <div class="card mb-4 p-4 border-0 shadow-md">
      <div class="flex flex-wrap items-center gap-3 mb-3">
        <label class="btn-primary text-sm cursor-pointer flex items-center gap-2 shadow-lg shadow-blue-600/20">
          <span>📷</span>
          <span>扫码上传</span>
          <input type="file" accept="image/*" capture="environment" @change="handleScanUpload" class="hidden" />
        </label>
        <label class="btn-secondary text-sm cursor-pointer flex items-center gap-2">
          <span>🖼️</span>
          <span>相册上传</span>
          <input type="file" accept="image/*" multiple @change="handleAlbumUpload" class="hidden" />
        </label>
        <label class="btn-secondary text-sm cursor-pointer flex items-center gap-2">
          <span>📄</span>
          <span>上传文件</span>
          <input type="file" accept=".doc,.docx,.pdf,.txt" multiple @change="handleFileUpload" class="hidden" />
        </label>
        <label class="btn-secondary text-sm cursor-pointer flex items-center gap-2">
          <span>📊</span>
          <span>导入Excel</span>
          <input type="file" accept=".xlsx,.xls" @change="importExcel" class="hidden" />
        </label>
        <button @click="showCloudFiles = true" class="btn-secondary text-sm flex items-center gap-2">
          <span>☁️</span>
          <span>云端文件</span>
          <span v-if="totalCloudFiles > 0" class="bg-blue-500 text-white text-xs px-1.5 rounded-full">{{ totalCloudFiles }}</span>
        </button>
        <router-link to="/case/new" class="btn-primary text-sm inline-flex items-center gap-2">
          <span>＋</span>
          <span>新增案件</span>
        </router-link>
      </div>

      <!-- 上传加载中 -->
      <div v-if="uploadLoading" class="flex items-center gap-3 p-4 bg-blue-50 rounded-xl mb-3">
        <div class="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        <span class="text-blue-600">{{ processingStatus }}</span>
      </div>

      <!-- 上传结果 -->
      <div v-if="uploadResult" class="p-4 rounded-xl mb-3" :class="uploadResult.success ? 'bg-green-50' : 'bg-orange-50'">
        <div class="flex items-center justify-between">
          <span :class="uploadResult.success ? 'text-green-600' : 'text-orange-600'">
            {{ uploadResult.message }}
          </span>
          <button @click="uploadResult = null" class="text-gray-400 hover:text-gray-600">×</button>
        </div>
      </div>

      <div v-if="albumUploads.length > 0" class="p-4 bg-slate-50 rounded-xl mb-3 border border-slate-200">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div class="text-sm text-slate-600">已选择 {{ albumUploads.length }} 张图片，先预览，再勾选上传</div>
          <div class="flex flex-wrap items-center gap-2">
            <label class="text-sm flex items-center gap-2 text-slate-600">
              <input type="checkbox" :checked="selectAllAlbumUploads" @change="toggleSelectAllAlbumUploads" class="w-4 h-4 rounded" />
              <span>全选</span>
            </label>
            <button @click="confirmAlbumUpload" class="btn-primary text-sm">上传选中</button>
            <button @click="clearAlbumUploads" class="btn-secondary text-sm">清空</button>
          </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div v-for="item in albumUploads" :key="item.id" class="relative rounded-xl overflow-hidden border border-slate-200 bg-white">
            <label class="absolute top-2 left-2 z-10 bg-white/90 rounded-md px-1.5 py-1 flex items-center gap-1 text-xs text-slate-700">
              <input type="checkbox" v-model="item.selected" class="w-4 h-4 rounded" />
              <span>选中</span>
            </label>
            <img :src="item.url" class="w-full h-28 object-cover" />
            <div class="p-2 text-xs text-slate-500 truncate">{{ item.name }}</div>
          </div>
        </div>
      </div>
    </div>

      <!-- OCR加载中 -->
      <div v-if="ocrLoading" class="flex items-center gap-3 p-4 bg-blue-50 rounded-xl mb-3">
        <div class="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        <span class="text-blue-600">正在识别图片，请稍候...</span>
      </div>

      <!-- OCR结果 -->
      <div v-if="ocrResult" class="p-4 bg-green-50 rounded-xl mb-3">
        <div class="flex items-center justify-between mb-2">
          <span class="text-green-600 font-semibold">✅ OCR识别结果</span>
          <button @click="ocrResult = null; logisticsResult = null" class="text-green-400 hover:text-green-600">×</button>
        </div>
        <div class="text-sm text-green-700 mb-2">识别到的主体：<strong>{{ ocrResult.shopName }}</strong></div>
        <div class="text-sm text-green-700 mb-2">识别到单号：<strong>{{ ocrResult.trackingNumber }}</strong>
          <button
            v-if="ocrResult.trackingNumber && !logisticsResult"
            @click="queryLogistics(ocrResult.trackingNumber)"
            :disabled="logisticsLoading"
            class="ml-3 btn-primary text-xs py-1 px-3"
          >
            {{ logisticsLoading ? '查询中...' : '查物流' }}
          </button>
        </div>

        <!-- 物流查询结果 -->
        <div v-if="logisticsResult" class="mt-3 p-3 bg-white rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="font-semibold text-green-700">物流信息</span>
            <span :class="logisticsResult.status === '签收' ? 'text-green-600' : 'text-yellow-600'" class="text-sm font-bold">
              {{ logisticsResult.status }}
            </span>
          </div>
          <div class="space-y-2 text-sm">
            <div
              v-for="(item, idx) in logisticsResult.details"
              :key="idx"
              class="flex gap-3 p-2 rounded"
              :class="idx === 0 ? 'bg-green-50' : 'bg-gray-50'"
            >
              <div class="text-gray-500 shrink-0">{{ item.time }}</div>
              <div class="flex-1">{{ item.description }}</div>
            </div>
          </div>
          <div v-if="logisticsResult.status === '签收' && ocrResult.matchedCases.length > 0" class="mt-3">
            <button
              @click="applyOcrToCaseWithSign(ocrResult.matchedCases[0].id, logisticsResult.details[0]?.time)"
              class="btn-primary text-sm w-full"
            >
              一键关联并记录签收时间
            </button>
          </div>
        </div>

        <div v-if="ocrResult.matchedCases.length > 0" class="mt-3">
          <div class="text-sm text-green-600 mb-2">匹配到的案件：</div>
          <div class="space-y-2">
            <div
              v-for="c in ocrResult.matchedCases"
              :key="c.id"
              @click="applyOcrToCase(c.id)"
              class="p-2 bg-white rounded-lg cursor-pointer hover:bg-green-100 transition-colors text-sm"
            >
              <span class="font-medium">{{ c.shopName }}</span>
              <span class="text-slate-400 ml-2">{{ c.productName }}</span>
            </div>
          </div>
        </div>
        <div v-else class="text-sm text-orange-600 mt-2">
          未匹配到相关案件，请手动选择
        </div>
      </div>

      <div v-if="uploadedFiles.length > 0" class="flex flex-wrap gap-3">
        <div v-for="(file, idx) in uploadedFiles" :key="'file-' + idx" class="relative group">
          <div class="w-16 h-16 flex flex-col items-center justify-center bg-slate-100 rounded-xl border-2 border-slate-100">
            <span class="text-2xl">📄</span>
            <span class="text-xs text-slate-500 truncate w-full text-center px-1">{{ file.name.substring(0, 8) }}</span>
          </div>
          <button
            @click="removeFile(idx)"
            class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >×</button>
        </div>
      </div>

    <!-- 筛选栏 -->
    <div class="mb-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <!-- 统计卡片 -->
      <div class="flex flex-wrap gap-4 mb-4">
        <div class="flex-1 min-w-[150px] bg-gradient-to-r from-red-50 to-amber-50 rounded-xl p-3 border border-red-100">
          <div class="text-xs text-red-500 font-medium">当月案件</div>
          <div class="text-2xl font-bold text-red-700">{{ monthlyStats.total }}</div>
        </div>
        <div class="flex-1 min-w-[150px] bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-3 border border-orange-100">
          <div class="text-xs text-orange-500 font-medium">当月花费</div>
          <div class="text-2xl font-bold text-orange-700">¥{{ monthlyStats.expense.toLocaleString() }}</div>
        </div>
      </div>

      <!-- 筛选条件 -->
      <div class="flex flex-wrap gap-3 items-center">
        <select v-model="filterYear" class="input-field w-28 text-sm rounded-lg">
          <option v-for="y in availableYears" :key="y" :value="y">{{ y }}年</option>
        </select>
        <select v-model="filterMonth" class="input-field w-24 text-sm rounded-lg">
          <option v-for="m in 12" :key="m" :value="String(m).padStart(2,'0')">{{ m }}月</option>
        </select>
        <select v-model="filterStatus" class="input-field w-28 text-sm rounded-lg">
          <option value="">全部状态</option>
          <option value="pending_report">未受理</option>
          <option value="accepted">已受理</option>
          <option value="reported">已立案</option>
          <option value="decided">已调解</option>
          <option value="closed">已处罚</option>
          <option value="rejected">不予立案</option>
          <option value="not_punished">不予处罚</option>
        </select>
        <div class="flex-1 max-w-xs">
          <input
            v-model="keyword"
            type="text"
            placeholder="🔍 搜索店铺/商品/执照..."
            class="input-field text-sm rounded-lg"
          />
        </div>
        <button
          v-if="selectedIds.length > 0"
          @click="showBatchModal = true"
          class="btn-primary text-sm flex items-center gap-2 shadow-lg shadow-red-600/20"
        >
          <span>🧰</span>
          <span>批量操作</span>
          <span class="bg-white/20 px-2 py-0.5 rounded-full text-xs">{{ selectedIds.length }}</span>
        </button>
        <router-link to="/case/new" class="btn-secondary text-sm inline-flex items-center gap-2">
          <span>＋</span>
          <span>新增案件</span>
        </router-link>
      </div>
    </div>

    <!-- 批量操作弹窗 -->
    <div v-if="showBatchModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" @click.self="showBatchModal = false">
      <div class="bg-white rounded-2xl p-6 w-[460px] shadow-2xl">
        <h3 class="font-bold text-lg mb-2 text-slate-800">批量操作</h3>
        <p class="text-sm text-slate-500 mb-4">已选 {{ selectedIds.length }} 个案件</p>
        <div class="mb-6">
          <label class="label">批量设置寄件日期</label>
          <input type="date" v-model="batchReportDate" class="input-field rounded-lg" />
        </div>
        <div class="flex gap-3 mb-3">
          <button @click="batchUpdateReportDate" class="btn-primary flex-1 shadow-lg shadow-blue-600/20">保存日期</button>
          <button @click="showBatchModal = false" class="btn-secondary flex-1">取消</button>
        </div>
        <button @click="batchDeleteCases" class="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 text-sm font-medium transition-colors">批量删除选中案件</button>
      </div>
    </div>

    <!-- Excel导入预览弹窗 -->
    <div v-if="showImportPreview" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" @click.self="closeImportPreview">
      <div class="bg-white rounded-2xl p-6 w-[1100px] max-h-[85vh] shadow-2xl overflow-hidden flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-bold text-lg text-slate-800">Excel 导入预览</h3>
            <p class="text-sm text-slate-500 mt-1">先预览，再选择全选或单选后导入</p>
          </div>
          <button @click="closeImportPreview" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
        </div>
        <div class="flex items-center justify-between mb-3 text-sm">
          <label class="flex items-center gap-2 text-slate-600">
            <input type="checkbox" :checked="selectAllImportRows" @change="toggleSelectAllImportRows" class="w-4 h-4 rounded" />
            <span>全选</span>
          </label>
          <span class="text-slate-500">共 {{ importPreviewRows.length }} 条，已选 {{ selectedImportRows.length }} 条</span>
        </div>
        <div class="flex-1 overflow-auto border border-slate-100 rounded-xl">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 sticky top-0">
              <tr>
                <th class="py-2 px-3 text-left w-10"></th>
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
                  <input type="checkbox" :checked="selectedImportRows.includes(row.__importId)" @change="toggleImportRow(row.__importId)" class="w-4 h-4 rounded" />
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
        <div class="flex gap-3 mt-4">
          <button @click="confirmImportRows" :disabled="selectedImportRows.length === 0 || excelImporting" class="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
            {{ excelImporting ? '导入中...' : `导入选中 ${selectedImportRows.length} 条` }}
          </button>
          <button @click="closeImportPreview" class="btn-secondary flex-1">取消</button>
        </div>
      </div>
    </div>

    <!-- 云端文件管理弹窗 -->
    <div v-if="showCloudFiles" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" @click.self="showCloudFiles = false">
      <div class="bg-white rounded-2xl p-6 w-[900px] max-h-[85vh] shadow-2xl overflow-hidden flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-lg text-slate-800">☁️ 云端文件管理</h3>
          <button @click="showCloudFiles = false" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
        </div>

        <div v-if="cloudFilesLoading" class="flex items-center justify-center py-8">
          <div class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span class="ml-3 text-slate-500">加载中...</span>
        </div>

        <div v-else-if="allCloudFiles.length === 0" class="text-center py-8 text-slate-400">
          <span class="text-4xl">☁️</span>
          <p class="mt-2">暂无云端文件</p>
        </div>

        <div v-else class="flex-1 overflow-y-auto">
          <div class="mb-4 flex items-center justify-between">
            <div class="text-sm text-slate-500">
              共 {{ allCloudFiles.length }} 个文件
              <span class="ml-2 text-orange-500">（未关联: {{ allCloudFiles.length - assignedCount }}）</span>
            </div>
            <div class="flex items-center gap-3">
              <button
                v-if="selectedCloudFiles.length > 0"
                @click="batchDeleteCloudFiles"
                class="btn-danger text-sm"
              >
                🗑️ 批量删除 ({{ selectedCloudFiles.length }})
              </button>
            </div>
          </div>

          <table class="w-full text-sm">
            <thead class="bg-slate-50 sticky top-0">
              <tr>
                <th class="py-2 px-3 text-left w-10">
                  <input type="checkbox" v-model="selectAllCloudFiles" @change="toggleSelectAllCloudFiles" class="w-4 h-4 rounded" />
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
                  <input
                    type="checkbox"
                    :checked="selectedCloudFiles.includes(file)"
                    @change="toggleSelectCloudFile(file)"
                    class="w-4 h-4 rounded"
                  />
                </td>
                <td class="py-2 px-3">
                  <img
                    v-if="isImageFile(file)"
                    :src="getCloudFileUrl(file.Key) || file.url"
                    class="w-12 h-12 object-cover rounded cursor-pointer hover:ring-2 hover:ring-blue-400"
                    @click="previewImage(getCloudFileUrl(file.Key) || file.url)"
                  />
                  <span v-else class="text-2xl">📄</span>
                </td>
                <td class="py-2 px-3 truncate max-w-xs">{{ getFileName(file) }}</td>
                <td class="py-2 px-3">{{ file.LastModified ? new Date(file.LastModified).toLocaleString('zh-CN') : (file.uploadedAt ? new Date(file.uploadedAt).toLocaleString('zh-CN') : '-') }}</td>
                <td class="py-2 px-3">
                  <select
                    :value="getFileCaseId(file)"
                    @change="assignFileToCase(file, $event.target.value)"
                    class="input-field text-xs py-1 w-40"
                  >
                    <option value="">未关联</option>
                    <option v-for="c in store.cases" :key="c.id" :value="c.id">
                      {{ c.shopName }}
                    </option>
                  </select>
                </td>
                <td class="py-2 px-3 text-center">
                  <button @click="deleteCloudFile(file)" class="text-red-500 hover:text-red-700">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <div v-if="showImagePreview" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" @click="showImagePreview = false">
      <button @click="showImagePreview = false" class="absolute top-4 right-4 text-white text-3xl hover:text-gray-300">×</button>
      <img :src="previewImageUrl" class="max-w-[90vw] max-h-[90vh] object-contain" @click.stop />
    </div>

    <!-- 空状态 -->
    <div v-if="filteredCases.length === 0" class="text-center py-32 bg-white rounded-2xl shadow-sm border border-slate-100">
      <div class="text-8xl mb-6">📂</div>
      <p class="text-xl text-slate-400 mb-6">{{ keyword || filterStatus || filterYear || filterMonth ? '没有找到符合条件的案件' : '还没有任何案件' }}</p>
      <router-link to="/case/new" class="btn-primary inline-flex items-center gap-2 text-lg px-6 py-3 shadow-lg shadow-blue-600/20">
        <span class="text-xl">+</span>
        <span>添加第一个案件</span>
      </router-link>
    </div>

    <!-- 案件列表 -->
    <div v-else class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gradient-to-r from-red-600 to-amber-500 text-white text-xs uppercase tracking-wider">
              <th class="py-3 px-4 text-center font-semibold w-12">
                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="w-4 h-4 rounded border-white" />
              </th>
              <th class="py-3 px-4 text-left font-semibold">管辖局</th>
              <th class="py-3 px-4 text-left font-semibold">执照名称</th>
              <th class="py-3 px-4 text-left font-semibold">店铺名称</th>
              <th class="py-3 px-4 text-left font-semibold">商品名称</th>
              <th class="py-3 px-4 text-right font-semibold">花费</th>
              <th class="py-3 px-4 text-center font-semibold">状态</th>
              <th class="py-3 px-4 text-center font-semibold">签收日期</th>
              <th class="py-3 px-4 text-center font-semibold w-20">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr
              v-for="c in paginatedCases"
              :key="c.id"
              class="hover:bg-blue-50/30 transition-colors cursor-pointer"
              :class="{ 'bg-blue-50/50': selectedIds.includes(c.id) }"
            >
              <td class="py-3 px-4 text-center" @click.stop>
                <input
                  type="checkbox"
                  :checked="selectedIds.includes(c.id)"
                  @change="toggleSelect(c.id)"
                  class="w-4 h-4 rounded border-slate-300"
                />
              </td>
              <td class="py-3 px-4 text-slate-600">{{ c.jurisdiction || '-' }}</td>
              <td class="py-3 px-4 text-slate-600">{{ c.licenseName || '-' }}</td>
              <td class="py-3 px-4 text-slate-600">{{ c.shopName || '-' }}</td>
              <td class="py-3 px-4 font-medium text-slate-800">{{ c.productName || '-' }}</td>
              <td class="py-3 px-4 text-right text-orange-600">¥{{ c.expense || 0 }}</td>
              <td class="py-3 px-4 text-center" @click.stop>
                <select
                  :value="c.status"
                  @change="changeCaseStatus(c.id, $event.target.value)"
                  class="input-field w-28 text-xs py-1.5 text-center rounded-lg"
                >
                  <option value="pending_report">未受理</option>
                  <option value="accepted">已受理</option>
                  <option value="reported">已立案</option>
                  <option value="decided">已调解</option>
                  <option value="closed">已处罚</option>
                  <option value="rejected">不予立案</option>
                  <option value="not_punished">不予处罚</option>
                </select>
              </td>
              <td class="py-3 px-4 text-center" @click.stop>
                <input
                  type="date"
                  :value="c.signDate"
                  @change="updateSignDate(c.id, $event.target.value)"
                  class="input-field w-32 text-xs py-1.5 text-center rounded-lg"
                />
              </td>
              <td class="py-3 px-4 text-center" @click.stop>
                <router-link :to="'/case/' + c.id" class="text-blue-500 hover:text-blue-700 text-sm font-medium">查看</router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
        <div class="text-sm text-slate-500">
          共 <span class="font-semibold text-slate-700">{{ filteredCases.length }}</span> 条，第 <span class="font-semibold text-slate-700">{{ currentPage }}</span> / <span class="font-semibold text-slate-700">{{ totalPages }}</span> 页
        </div>
        <div class="flex items-center gap-1">
          <button
            @click="currentPage = 1"
            :disabled="currentPage === 1"
            class="px-3 py-1.5 text-xs rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >首页</button>
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-3 py-1.5 text-xs rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >上一页</button>
          <button
            v-for="p in pageNumbers"
            :key="p"
            @click="currentPage = p"
            class="w-8 h-8 text-xs rounded-lg transition-colors"
            :class="p === currentPage ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'hover:bg-white'"
          >{{ p }}</button>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 text-xs rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >下一页</button>
          <button
            @click="currentPage = totalPages"
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 text-xs rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >末页</button>
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
const logisticsLoading = ref(false)
const logisticsResult = ref(null)
const pageSize = 20
const albumUploads = ref([])
const showImportPreview = ref(false)
const importPreviewRows = ref([])
const selectedImportRows = ref([])
const excelImporting = ref(false)

// 监听路由变化，同步筛选状态
watch(() => route.query.status, (newStatus) => {
  filterStatus.value = newStatus || ''
  currentPage.value = 1
})

const availableYears = computed(() => {
  const years = [...new Set(store.cases.map(c => dayjs(c.createdAt).year()))]
  const currentYear = new Date().getFullYear()
  if (!years.includes(currentYear)) years.push(currentYear)
  if (!years.includes(currentYear - 1)) years.push(currentYear - 1)
  return years.sort((a, b) => b - a)
})

const filteredCases = computed(() => {
  let list = store.cases
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
      (c.jurisdiction || '').toLowerCase().includes(kw)
    )
  }
  return list
})

// 当月统计
const monthlyStats = computed(() => {
  const monthCases = store.cases.filter(c => {
    const created = dayjs(c.createdAt)
    return created.year() === filterYear.value && created.month() + 1 === Number(filterMonth.value)
  })
  return {
    total: monthCases.length,
    expense: monthCases.reduce((sum, c) => sum + (Number(c.expense) || 0), 0),
  }
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
    '已立案': 'reported',
    '已调解': 'decided',
    '已处罚': 'closed',
    '不予立案': 'rejected',
    '不予处罚': 'not_punished',
  }
  return map[text] || 'pending_report'
}

function normalizeExcelRow(row, index) {
  const expense = Number(getCellValue(row, ['花费', '费用', '商品价格', '价格', '金额']) || 0)
  const productPrice = Number(getCellValue(row, ['商品价格', '价格', '花费', '金额']) || expense || 0)
  const reportDate = getCellValue(row, ['举报日期', '寄件日期']) || null
  const signDate = getCellValue(row, ['签收日期']) || null

  return {
    __importId: `import_${index}_${Date.now()}`,
    jurisdiction: String(getCellValue(row, ['管辖局', '辖区', '所属管辖局']) || '').trim(),
    licenseName: String(getCellValue(row, ['执照名称', '主体名称', '经营者名称']) || '').trim(),
    shopName: String(getCellValue(row, ['店铺名称', '店铺', '店名']) || '').trim(),
    productName: String(getCellValue(row, ['商品名称', '商品', '商品名']) || '').trim(),
    expense,
    productPrice,
    trackingNumber: String(getCellValue(row, ['快递单号', '物流单号', '单号']) || '').trim(),
    reportDate,
    signDate,
    notes: String(getCellValue(row, ['备注', '说明']) || '').trim(),
    status: normalizeStatus(getCellValue(row, ['状态'])),
  }
}

async function importExcel(event) {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      alert('Excel 里没有可读取的工作表')
      return
    }

    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
    const normalized = rows
      .map((row, index) => normalizeExcelRow(row, index))
      .filter(row => row.jurisdiction || row.licenseName || row.shopName || row.productName || row.expense || row.trackingNumber)

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

function handleFileUpload(event) {
  const files = event.target.files
  for (let i = 0; i < files.length; i++) {
    uploadedFiles.value.push(files[i])
  }
}

function removeFile(idx) {
  uploadedFiles.value.splice(idx, 1)
}

function changeCaseStatus(id, newStatus) {
  const updates = {}
  // 当变更为"已受理"状态时，自动设置受理日期为今天
  if (newStatus === 'accepted') {
    updates.acceptanceDate = dayjs().format('YYYY-MM-DD')
  }
  store.changeStatus(id, newStatus, updates)
}

function updateSignDate(id, date) {
  store.updateCase(id, { signDate: date })
}

async function handleOcrUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  ocrLoading.value = true
  ocrResult.value = null

  try {
    // 将图片转换为 base64
    const reader = new FileReader()
    const imageBase64 = await new Promise((resolve, reject) => {
      reader.onload = (e) => {
        const base64 = e.target.result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    // 使用豆包AI提取图片信息
    const result = await extractFromImage(imageBase64)

    if (!result) {
      alert('AI识别失败，请重试或使用传统OCR')
      return
    }

    // 匹配案件
    const matchedCases = store.cases.filter(c => {
      const shopName = result.shopName || ''
      if (!shopName) return false
      return c.shopName.includes(shopName) || shopName.includes(c.shopName) ||
             c.licenseName.includes(shopName) || shopName.includes(c.licenseName)
    })

    ocrResult.value = {
      shopName: result.shopName || '',
      trackingNumber: result.trackingNumber || '',
      matchedCases,
      rawText: result.raw || JSON.stringify(result, null, 2),
      aiResult: result
    }

  } catch (err) {
    console.error('OCR错误:', err)
    alert('OCR识别失败，请重试')
  } finally {
    ocrLoading.value = false
    event.target.value = ''
  }
}

function applyOcrToCase(caseId) {
  if (!ocrResult.value) return

  const updates = {}
  if (ocrResult.value.trackingNumber) {
    updates.trackingNumber = ocrResult.value.trackingNumber
  }
  store.updateCase(caseId, updates)

  ocrResult.value = null
  logisticsResult.value = null
  alert('已成功关联到案件！')
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

// OCR识别后一键关联并记录签收时间
function applyOcrToCaseWithSign(caseId, signTime) {
  if (!ocrResult.value) return

  const updates = {}
  if (ocrResult.value.trackingNumber) {
    updates.trackingNumber = ocrResult.value.trackingNumber
  }
  // 格式化签收时间
  if (signTime) {
    updates.signDate = signTime.split(' ')[0]
  }

  store.updateCase(caseId, updates)

  ocrResult.value = null
  logisticsResult.value = null
  alert('已成功关联到案件并记录签收时间！')
}

function findMatchedCase(shopName = '') {
  if (!shopName) return null
  return store.cases.find(c =>
    (c.shopName && c.shopName.includes(shopName)) ||
    (shopName && c.shopName && shopName.includes(c.shopName)) ||
    (c.licenseName && c.licenseName.includes(shopName)) ||
    (shopName && c.licenseName && shopName.includes(c.licenseName))
  )
}

async function processImageUpload(imageBase64, fileName, labelPrefix = '图片') {
  processingStatus.value = '上传中...'
  const base64Data = imageBase64.split(',')[1]
  const url = await uploadBase64ToTos(imageBase64, fileName)

  if (!url) {
    throw new Error('上传失败，请重试')
  }

  const fileMeta = {
    url,
    name: `${labelPrefix}_${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
    date: dayjs().format('YYYY-MM-DD'),
    uploadedAt: dayjs().toISOString()
  }

  processingStatus.value = 'AI匹配中...'
  const result = await extractFromImage(base64Data)
  const matchedCase = result?.shopName ? findMatchedCase(result.shopName) : null

  if (matchedCase) {
    await store.assignCloudFile(url, matchedCase.id, fileMeta)
    totalCloudFiles.value += 1
    return { matched: true, matchedCaseName: matchedCase.shopName }
  }

  await store.addUnassignedImage(fileMeta)
  totalCloudFiles.value += 1
  return { matched: false }
}

// 扫码上传 - 扫描后立即AI识别并上传
async function handleScanUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  uploadLoading.value = true
  processingStatus.value = '识别中...'

  try {
    const imageBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    const result = await processImageUpload(imageBase64, `scan_${Date.now()}.jpg`, '扫描')
    uploadResult.value = result.matched
      ? { success: true, message: `✅ 上传成功！已识别并匹配到：「${result.matchedCaseName}」` }
      : { success: false, message: '⚠️ 上传成功，但未识别到匹配的案件，请在云端文件手动分配' }

    if (showCloudFiles.value) {
      await loadCloudFiles()
    }
  } catch (err) {
    console.error('Scan upload failed:', err)
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
  if (file.name) return file.name
  if (file.Key) {
    const parts = file.Key.split('/')
    return parts[parts.length - 1]
  }
  if (file.url) {
    try {
      const urlObj = new URL(file.url)
      const pathParts = urlObj.pathname.split('/')
      return pathParts[pathParts.length - 1]
    } catch {
      return '未命名文件'
    }
  }
  return '未命名文件'
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
  await store.assignCloudFile(fileUrl, caseId, {
    name: getFileName(file),
    date: file.date || dayjs().format('YYYY-MM-DD'),
    uploadedAt: file.uploadedAt || file.LastModified || dayjs().toISOString()
  })

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

function previewImage(url) {
  previewImageUrl.value = url
  showImagePreview.value = true
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

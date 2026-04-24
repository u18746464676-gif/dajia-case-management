<template>
  <div v-if="c" class="max-w-5xl mx-auto space-y-4">
    <button @click="$router.back()" class="btn-ghost px-0">
      <span>←</span>
      <span>返回列表</span>
    </button>

    <div class="card overflow-hidden">
      <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div class="space-y-4">
          <div>
            <div class="text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">案件卷宗</div>
            <h2 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{{ primaryTitle }}</h2>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 dark:text-slate-500">{{ secondaryTitle }}</p>
          </div>

          <div class="flex flex-wrap gap-2">
            <StatusBadge :status="effectiveStatus" :profit="c.profit" />
            <span class="soft-tag">编号 {{ c.caseNumber || '待生成' }}</span>
            <span class="soft-tag">管辖局 {{ c.jurisdiction || '未填写' }}</span>
            <span class="soft-tag">快递单号 {{ c.trackingNumber || '暂无' }}</span>
            <span class="soft-tag">修改后自动保存</span>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div class="metric-card">
              <div class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">当前状态</div>
              <div class="mt-2"><StatusBadge :status="effectiveStatus" :profit="c.profit" /></div>
            </div>
            <div class="metric-card">
              <div class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">商品价格</div>
              <div class="mt-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">¥{{ formatCurrency(c.productPrice) }}</div>
            </div>
            <div class="metric-card">
              <div class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">花费总额</div>
              <div class="mt-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">¥{{ formatCurrency(c.expense) }}</div>
            </div>
            <div class="metric-card">
              <div class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">赔偿金额</div>
              <div class="mt-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">¥{{ formatCurrency(c.profit) }}</div>
            </div>
          </div>
        </div>

        <div class="w-full xl:max-w-sm">
          <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4 shadow-sm">
            <div class="text-sm font-semibold text-slate-800 dark:text-slate-100">处置操作</div>
            <p class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400 dark:text-slate-500">围绕状态流转、答复补录与材料补充集中操作，基础字段在下方卷宗中直接维护。</p>

            <div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <button @click="showStatusModal = true" class="btn-primary w-full">变更状态</button>
              <button @click="showReplyModal = true" class="btn-secondary w-full">添加答复</button>
              <button @click="showDocModal = true" class="btn-secondary w-full">上传文书</button>
              <button @click="downloadCaseSummary" class="btn-secondary w-full">导出卷宗摘要</button>
              <button @click="printCaseDossier" class="btn-secondary w-full">打印卷宗</button>
              <button @click="confirmDelete" class="btn-danger w-full">删除案件</button>
            </div>

            <div class="mt-4 border-t border-slate-200 dark:border-slate-700 pt-3 text-xs leading-5 text-slate-400 dark:text-slate-500">
              创建于 {{ formatDate(c.createdAt) }}<br />
              更新于 {{ formatDate(c.updatedAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="flex gap-2 overflow-x-auto pb-1">
        <button
          v-for="tab in detailTabs"
          :key="tab.value"
          type="button"
          @click="activeDetailTab = tab.value"
          class="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition"
          :class="activeDetailTab === tab.value ? 'bg-slate-700 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:bg-slate-700'"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <template v-if="activeDetailTab === 'info'">
      <div class="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_0.85fr]">
        <section class="card">
          <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 class="section-title mb-0">基础信息</h3>
            <span class="soft-tag">与“编辑案件”页保持一致</span>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label class="label">案件编号</label>
              <input :value="c.caseNumber || '待生成'" type="text" class="input-field bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 dark:text-slate-500" readonly />
            </div>
            <div>
              <label class="label">📋 执照名称</label>
              <input v-model="c.licenseName" @change="saveField('licenseName', c.licenseName)" type="text" class="input-field" placeholder="营业执照上的名称" />
            </div>
            <div>
              <label class="label">🏪 店铺名称</label>
              <input v-model="c.shopName" @change="saveField('shopName', c.shopName)" type="text" class="input-field" placeholder="例：xxx旗舰店" />
            </div>
            <div class="md:col-span-2">
              <label class="label">📦 商品名称</label>
              <input v-model="c.productName" @change="saveField('productName', c.productName)" type="text" class="input-field" placeholder="例：美白祛斑面膜" />
            </div>
            <div>
              <label class="label">🏛️ 管辖局</label>
              <input v-model="c.jurisdiction" @change="saveField('jurisdiction', c.jurisdiction)" type="text" class="input-field" placeholder="例：市场监督管理局" />
            </div>
            <div>
              <label class="label">📦 快递单号</label>
              <input v-model="c.trackingNumber" @change="saveField('trackingNumber', c.trackingNumber)" type="text" class="input-field" placeholder="有单号时可直接录入" />
            </div>
            <div>
              <label class="label">📬 签收日期</label>
              <input v-model="c.signDate" @change="saveSignDate(c.signDate)" type="date" class="input-field" />
            </div>
            <div class="md:col-span-2">
              <label class="label">📝 备注</label>
              <textarea
                v-model="c.notes"
                @change="saveField('notes', c.notes)"
                class="input-field min-h-28 resize-none"
                placeholder="补充识别来源、店铺别名、案件说明等"
              ></textarea>
            </div>
          </div>
        </section>

        <div class="space-y-4">
          <section class="card">
            <h3 class="section-title">案件速览</h3>

            <div class="space-y-3">
              <div class="panel-card">
                <div class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">当前状态</div>
                <div class="mt-2"><StatusBadge :status="effectiveStatus" :profit="c.profit" /></div>
              </div>

              <div class="panel-card">
                <div class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">✅ 受理日期</div>
                <div class="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">{{ c.acceptanceDate || '未填写' }}</div>
              </div>

              <div class="panel-card">
                <div class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">📮 受理方式</div>
                <div class="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">{{ c.acceptanceWay || '未填写' }}</div>
              </div>

              <div class="panel-card">
                <div class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">⚖️ 举报结果摘要</div>
                <div class="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                  {{ c.reportResultStatus ? statusLabel(c.reportResultStatus) : '未填写' }}
                </div>
                <div v-if="c.reportResultDate" class="mt-1 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">结果日期：{{ c.reportResultDate }}</div>
              </div>
            </div>
          </section>

          <section class="card">
            <h3 class="section-title">填写提醒</h3>
            <div class="space-y-2 text-sm leading-6">
              <div :class="c.jurisdiction ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500'">
                {{ c.jurisdiction ? '已填写管辖局，后续生成材料会更顺。' : '建议优先补齐管辖局，后续流程会更稳。' }}
              </div>
              <div :class="c.trackingNumber ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500'">
                {{ c.trackingNumber ? '快递单号已补齐，方便后续核验签收。' : '快递单号还空着，后续查签收会少一个抓手。' }}
              </div>
              <div :class="c.notes ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500'">
                {{ c.notes ? '备注已记录，复盘时更容易回看细节。' : '有特殊情况时，建议顺手写在备注里。' }}
              </div>
            </div>
          </section>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section class="card">
          <div class="flex items-center justify-between gap-3">
            <h3 class="section-title mb-0">财务信息</h3>
            <span class="soft-tag">记录商品价格与支出</span>
          </div>

          <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label class="label">商品价格（元）</label>
              <input v-model="c.productPrice" @change="saveField('productPrice', c.productPrice)" type="number" step="0.01" class="input-field" placeholder="0.00" />
            </div>
            <div>
              <label class="label">花费总额（元）</label>
              <input v-model="c.expense" @change="saveField('expense', c.expense)" type="number" step="0.01" class="input-field" placeholder="默认可与商品价格一致" />
            </div>
          </div>
        </section>

        <section class="card">
          <div class="flex items-center justify-between gap-3">
            <h3 class="section-title mb-0">行政复议</h3>
            <span class="soft-tag">{{ c.hasAdminReview === 'yes' ? '已申请复议' : '未申请复议' }}</span>
          </div>

          <div class="mt-4 grid grid-cols-1 gap-4">
            <div>
              <label class="label">是否申请复议</label>
              <select v-model="c.hasAdminReview" @change="saveField('hasAdminReview', c.hasAdminReview)" class="input-field">
                <option value="">未申请</option>
                <option value="yes">是</option>
                <option value="no">否</option>
              </select>
            </div>

            <template v-if="c.hasAdminReview === 'yes'">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label class="label">复议结果</label>
                  <select v-model="c.adminReviewResult" @change="saveField('adminReviewResult', c.adminReviewResult)" class="input-field">
                    <option value="">请选择</option>
                    <option value="维持">维持</option>
                    <option value="撤销">撤销</option>
                    <option value="变更">变更</option>
                    <option value="责令限期履行">责令限期履行</option>
                    <option value="终止">终止</option>
                  </select>
                </div>
                <div>
                  <label class="label">复议机关</label>
                  <input v-model="c.adminReviewAuthority" @change="saveField('adminReviewAuthority', c.adminReviewAuthority)" type="text" class="input-field" placeholder="行政复议机关名称" />
                </div>
                <div>
                  <label class="label">复议申请日期</label>
                  <input v-model="c.adminReviewApplyDate" @change="saveField('adminReviewApplyDate', c.adminReviewApplyDate)" type="date" class="input-field" />
                </div>
                <div>
                  <label class="label">复议受理日期</label>
                  <input v-model="c.adminReviewAcceptDate" @change="saveField('adminReviewAcceptDate', c.adminReviewAcceptDate)" type="date" class="input-field" />
                </div>
                <div>
                  <label class="label">复议决定日期</label>
                  <input v-model="c.adminReviewDecisionDate" @change="saveField('adminReviewDecisionDate', c.adminReviewDecisionDate)" type="date" class="input-field" />
                </div>
                <div>
                  <label class="label">复议决定书编号</label>
                  <input v-model="c.adminReviewDocNo" @change="saveField('adminReviewDocNo', c.adminReviewDocNo)" type="text" class="input-field" placeholder="例：x复字〔2024〕第xx号" />
                </div>
              </div>
            </template>

            <div v-else class="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 px-4 py-6 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
              未申请复议时，无需填写后续字段。
            </div>
          </div>
        </section>
      </div>
    </template>

    <template v-else-if="activeDetailTab === 'timeline'">
      <DeadlinePanel :case-obj="caseData" @update="loadCase" />

      <div class="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <section class="card">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 class="section-title mb-1">流程时间轴</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">把建档、寄件、签收、受理、答复、结果、复议串成一条卷宗主线。</p>
            </div>
            <span class="soft-tag">已完成 {{ timelineSummary.doneCount }}/{{ timelineSummary.total }}</span>
          </div>

          <div class="space-y-4">
            <div
              v-for="item in timelineItems"
              :key="item.key"
              class="flex gap-4 rounded-2xl border p-4"
              :class="item.state === 'done'
                ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                : item.state === 'current'
                  ? 'border-blue-200 bg-blue-50/70'
                  : 'border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70'"
            >
              <div class="flex flex-col items-center">
                <div
                  class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
                  :class="item.state === 'done'
                    ? 'bg-slate-800 text-white'
                    : item.state === 'current'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 dark:text-slate-500'"
                >
                  {{ item.state === 'done' ? '✓' : item.state === 'current' ? '•' : '…' }}
                </div>
                <div v-if="item.key !== timelineItems[timelineItems.length - 1]?.key" class="mt-2 h-full w-px bg-slate-200 dark:bg-slate-700"></div>
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ item.title }}</div>
                  <div class="text-sm" :class="item.date ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'">{{ formatTimelineDate(item.date) }}</div>
                </div>
                <div class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400 dark:text-slate-500">{{ item.description }}</div>
              </div>
            </div>
          </div>
        </section>

        <div class="space-y-4">
          <section class="card">
            <h3 class="section-title">流程摘要</h3>
            <div class="space-y-3">
              <div class="panel-card">
                <div class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">当前推进到</div>
                <div class="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-100">{{ timelineSummary.currentTitle }}</div>
              </div>
              <div class="panel-card">
                <div class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">下一步建议补齐</div>
                <div class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ timelineSummary.pendingText }}</div>
              </div>
              <div class="panel-card">
                <div class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">当前状态</div>
                <div class="mt-2"><StatusBadge :status="effectiveStatus" :profit="c.profit" /></div>
              </div>
            </div>
          </section>

          <section class="card">
            <div class="flex items-center justify-between gap-3 mb-4">
              <h3 class="section-title mb-0">
                <span>💬</span>
                <span>流程答复记录</span>
              </h3>
              <button @click="showReplyModal = true" class="btn-secondary">新增答复</button>
            </div>
            <div v-if="!(c.replies || []).length" class="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
              还没有答复记录
            </div>
            <div v-else class="space-y-3">
              <div v-for="reply in c.replies" :key="reply.id" class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 dark:bg-slate-900/80 p-4">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ reply.date || '未填写日期' }}</div>
                    <div class="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">{{ reply.content }}</div>
                  </div>
                  <button @click="deleteReply(reply.id)" class="btn-ghost text-rose-500 hover:bg-rose-50 hover:text-rose-600">删除</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </template>

    <template v-else-if="activeDetailTab === 'materials'">
      <section class="card">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 class="section-title mb-1">
              <span>📁</span>
              <span>材料中心</span>
            </h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">把信封图片、官方答复、处罚决定、复议材料分开管理，卷宗会更清晰。</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button @click="showDocModal = true" class="btn-primary">新增文书</button>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div class="metric-card">
            <div class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">材料总数</div>
            <div class="mt-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">{{ materialSummary.total }}</div>
          </div>
          <div class="metric-card">
            <div class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">信封图片</div>
            <div class="mt-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">{{ materialSummary.images }}</div>
          </div>
          <div class="metric-card">
            <div class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">文书材料</div>
            <div class="mt-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">{{ materialSummary.documents }}</div>
          </div>
          <div class="metric-card">
            <div class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">最近更新</div>
            <div class="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{{ materialSummary.latestAt ? formatDate(materialSummary.latestAt) : '暂未上传' }}</div>
          </div>
        </div>

        <div class="flex gap-2 mt-4 overflow-x-auto pb-1">
          <button
            v-for="tab in materialTabs"
            :key="tab.value"
            @click="activeMaterialTab = tab.value"
            class="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition"
            :class="activeMaterialTab === tab.value ? 'bg-slate-700 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:bg-slate-700'"
          >
            {{ tab.label }} ({{ tab.count }})
          </button>
        </div>

        <div v-if="activeMaterialTab === 'all'" class="mt-4">
          <div v-if="materialItems.length === 0" class="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 px-4 py-10 text-center text-slate-400 dark:text-slate-500">
            暂无案件材料
          </div>
          <div v-else class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div
              v-for="(item, idx) in materialItems"
              :key="item.id || idx"
              class="rounded-2xl border p-4"
              :class="item.type === 'image' ? 'border-purple-200 bg-purple-50/60' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 dark:bg-slate-900/80'"
            >
              <div class="flex items-start gap-3">
                <span class="text-2xl">{{ getMaterialIcon(item.type, item.category) }}</span>
                <div class="min-w-0 flex-1">
                  <div class="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{{ item.name }}</div>
                  <div class="mt-1 flex flex-wrap gap-2 text-xs text-slate-400 dark:text-slate-500">
                    <span>{{ item.date ? formatDate(item.date) : '未记录时间' }}</span>
                    <span v-if="item.type === 'document'" class="soft-tag">{{ getDocumentCategoryLabel(item.category) }}</span>
                  </div>
                  <div v-if="item.note" class="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400 dark:text-slate-500">{{ item.note }}</div>
                  <a v-if="item.url && item.type === 'document'" :href="item.url" target="_blank" rel="noreferrer" class="mt-2 inline-flex text-sm text-blue-600 hover:text-blue-700">打开链接</a>
                </div>
                <button @click="deleteMaterial(item)" class="btn-ghost text-rose-500 hover:bg-rose-50 hover:text-rose-600">删除</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeMaterialTab === 'images'" class="mt-4">
          <div v-if="caseImages.length === 0" class="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 px-4 py-10 text-center text-slate-400 dark:text-slate-500">
            暂无上传图片
          </div>
          <div v-else class="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <div v-for="(img, idx) in caseImages" :key="idx" class="group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
              <div class="bg-slate-50 dark:bg-slate-900 p-3">
                <img :src="img.url" class="h-40 w-full rounded-xl object-contain bg-white dark:bg-slate-900 cursor-pointer hover:opacity-90" @click="previewImage(img.url)" />
              </div>
              <div class="space-y-2 px-4 py-3">
                <div class="min-w-0">
                  <div class="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{{ img.name || '信封图片' }}</div>
                  <div class="text-xs text-slate-400 dark:text-slate-500">{{ img.uploadedAt ? formatDate(img.uploadedAt) : (img.date || '未记录时间') }}</div>
                  <div v-if="img.trackingNumber" class="mt-1 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">快递单号 {{ img.trackingNumber }}</div>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <button @click="previewImage(img.url)" class="text-sm text-blue-600 hover:text-blue-700">预览</button>
                  <button @click="deleteImage(idx)" class="btn-ghost text-rose-500 hover:bg-rose-50 hover:text-rose-600">删除</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeMaterialTab === 'documents'" class="mt-4">
          <div v-if="!caseDocuments.length" class="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 px-4 py-10 text-center text-slate-400 dark:text-slate-500">
            暂无上传文书
          </div>
          <div v-else class="space-y-4">
            <section v-for="group in documentGroups" :key="group.value" class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 p-4">
              <div class="mb-3 flex items-center justify-between gap-3">
                <div class="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  <span>{{ group.icon }}</span>
                  <span>{{ group.label }}</span>
                </div>
                <span class="soft-tag">{{ group.items.length }} 项</span>
              </div>
              <div class="space-y-3">
                <div
                  v-for="d in group.items"
                  :key="d.id"
                  class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4"
                >
                  <div class="flex items-start gap-3">
                    <span class="text-2xl">{{ getMaterialIcon('document', d.category || 'other') }}</span>
                    <div class="min-w-0 flex-1">
                      <div class="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{{ d.name }}</div>
                      <div class="mt-1 text-xs text-slate-400 dark:text-slate-500">{{ formatDate(d.uploadedAt) }}</div>
                      <div v-if="d.note" class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400 dark:text-slate-500">{{ d.note }}</div>
                      <button v-if="d.url" @click="previewFile(d.url, d.name)" class="mt-2 inline-flex text-sm text-blue-600 hover:text-blue-700">预览文件</button>
                    </div>
                    <button @click="deleteDoc(d.id)" class="btn-ghost text-rose-500 hover:bg-rose-50 hover:text-rose-600">删除</button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </template>


    <div v-if="showStatusModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" @click.self="showStatusModal = false">
      <div class="flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl">
        <h3 class="shrink-0 text-lg font-bold text-slate-800 dark:text-slate-100">变更案件状态</h3>
        <div class="mt-4 min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
          <div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
            <div class="mb-3 flex items-center justify-between gap-3">
              <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">适用规则版本</div>
              <span class="text-xs text-slate-400">默认按签收日期判断，可手动覆盖</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="s in procedureVersionOptions"
                :key="s.value"
                @click="saveProcedureVersion(s.value)"
                class="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition hover:border-slate-400 dark:border-slate-600"
                :class="c.procedureVersion === s.value ? 'border-amber-400 bg-amber-50 dark:bg-amber-900 text-amber-700 dark:text-amber-200' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'"
              >
                <span>{{ s.label }}</span>
              </button>
            </div>
          </div>

          <div v-if="c.procedureVersion === 'old'" class="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
            <div class="mb-3 flex items-center justify-between gap-3">
              <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">举报立案信息（旧规案件）</div>
              <button @click="clearFilingSection" class="text-xs text-rose-500 hover:text-rose-600">清空本段状态</button>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="s in filingStatusOptions"
                :key="s.value"
                @click="changeFilingStatus(s.value)"
                class="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition hover:border-slate-400 dark:border-slate-600"
                :class="c.filingStatus === s.value ? 'border-amber-400 bg-amber-50 dark:bg-amber-900 text-amber-700 dark:text-amber-200' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'"
              >
                <span>{{ s.label }}</span>
              </button>
            </div>
            <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label class="label">立案日期</label>
                <input :value="c.filingDate || ''" @change="saveFilingDate($event.target.value)" type="date" class="input-field" />
              </div>
              <div>
                <label class="label">收到立案告知日期</label>
                <input :value="c.filingNoticeDate || ''" @change="saveFilingNoticeDate($event.target.value)" type="date" class="input-field" />
              </div>
              <div class="md:col-span-2">
                <label class="label">备注</label>
                <textarea :value="c.filingNote || ''" @change="saveFilingNote($event.target.value)" class="input-field min-h-24 resize-none" placeholder="记录旧规立案说明、机关反馈等"></textarea>
              </div>
            </div>
          </div>

          <!-- 受理状态 -->
          <div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
            <div class="mb-3 flex items-center justify-between gap-3">
              <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">① 受理状态</div>
              <button @click="clearAcceptanceStatus" class="text-xs text-rose-500 hover:text-rose-600">清空本段状态</button>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="s in acceptanceOptions"
                :key="s.value"
                @click="changeAcceptanceStatus(s.value)"
                class="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition hover:border-slate-400 dark:border-slate-600"
                :class="c.acceptanceStatus === s.value ? 'border-blue-400 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'"
              >
                <span>{{ s.icon }}</span><span>{{ s.label }}</span>
              </button>
            </div>
            <div class="mt-3">
              <label class="label">{{ c.acceptanceStatus === 'reported' ? '不予受理日期' : '受理日期' }}</label>
              <input
                :value="c.acceptanceDate || ''"
                @change="saveAcceptanceDate($event.target.value)"
                type="date"
                class="input-field"
              />
            </div>
          </div>

          <!-- 投诉跟进 -->
          <div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
            <div class="mb-3 flex items-center justify-between gap-3">
              <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">② 投诉跟进</div>
              <button @click="clearMediationStatus" class="text-xs text-rose-500 hover:text-rose-600">清空本段状态</button>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="s in mediationOptions"
                :key="s.value"
                @click="changeMediationStatus(s.value)"
                class="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition hover:border-slate-400 dark:border-slate-600"
                :class="c.mediationStatus === s.value ? 'border-purple-400 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-200' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'"
              >
                <span>{{ s.icon }}</span><span>{{ s.label }}</span>
              </button>
            </div>
            <div class="mt-3">
              <label class="label">{{ c.mediationStatus === 'mediation_terminated' ? '终止调解日期' : '调解日期' }}</label>
              <input
                :value="c.mediationDate || ''"
                @change="saveMediationDate($event.target.value)"
                type="date"
                class="input-field"
              />
            </div>
            <div v-if="c.mediationStatus === 'decided'" class="mt-3 space-y-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 p-3">
              <label class="label">赔偿金额（元）</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="amount in compensationPresets"
                  :key="amount"
                  type="button"
                  @click="saveProfit(amount)"
                  class="rounded-full border px-3 py-1.5 text-sm transition"
                  :class="Number(c.profit || 0) === amount ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-400 hover:text-slate-700 dark:text-slate-200'"
                >
                  {{ amount }}
                </button>
              </div>
              <input
                :value="c.profit ?? ''"
                @change="saveProfit($event.target.value)"
                type="number"
                step="0.01"
                class="input-field"
                placeholder="已调解后填写赔偿金额"
              />
            </div>
          </div>

          <!-- 举报结果 -->
          <div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
            <div class="mb-3 flex items-center justify-between gap-3">
              <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">③ 举报结果</div>
              <button @click="clearReportResultStatus" class="text-xs text-rose-500 hover:text-rose-600">清空本段状态</button>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="s in reportResultOptions"
                :key="s.value"
                @click="changeReportResultStatus(s.value)"
                class="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition hover:border-slate-400 dark:border-slate-600"
                :class="c.reportResultStatus === s.value ? 'border-green-400 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'"
              >
                <span>{{ s.icon }}</span><span>{{ s.label }}</span>
              </button>
            </div>
            <div class="mt-3">
              <label class="label">举报结果日期</label>
              <input
                :value="c.reportResultDate || ''"
                @change="saveReportResultDate($event.target.value)"
                type="date"
                class="input-field"
              />
            </div>
          </div>
        </div>
        <div class="mt-4 shrink-0">
          <button @click="showStatusModal = false" class="btn-secondary w-full">取消</button>
        </div>
      </div>
    </div>

    <div v-if="showReplyModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" @click.self="showReplyModal = false">
      <div class="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl">
        <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">添加答复记录</h3>
        <div class="mt-4 space-y-4">
          <div>
            <label class="label">日期</label>
            <input v-model="replyForm.date" type="date" class="input-field" />
          </div>
          <div>
            <label class="label">答复内容</label>
            <textarea v-model="replyForm.content" class="input-field min-h-32 resize-none" placeholder="官方答复内容..."></textarea>
          </div>
        </div>
        <div class="mt-6 flex flex-col-reverse gap-3 md:flex-row">
          <button @click="showReplyModal = false" class="btn-secondary flex-1">取消</button>
          <button @click="submitReply" class="btn-primary flex-1">保存</button>
        </div>
      </div>
    </div>

    <div v-if="showDocModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" @click.self="showDocModal = false">
      <div class="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl">
        <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">新增文书材料</h3>
        <div class="mt-4 space-y-4">
          <div>
            <label class="label">文件名</label>
            <input v-model="docForm.name" type="text" class="input-field" placeholder="例：处罚决定书.pdf" />
          </div>
          <div>
            <label class="label">文书分类</label>
            <select v-model="docForm.category" class="input-field">
              <option v-for="option in documentCategoryOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </div>
          <div>
            <label class="label">本地上传文件</label>
            <input ref="docFileInputRef" type="file" accept="image/*,.pdf,.doc,.docx" multiple class="input-field" @change="handleDocFileChange" />
            <div class="mt-1 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{{ selectedDocFiles.length ? (selectedDocFiles.length === 1 ? `已选择：${selectedDocFiles[0].name}` : `已选择 ${selectedDocFiles.length} 个文件`) : '支持图片、信封图片、Word、PDF' }}</div>
          </div>
          <div>
            <label class="label">材料备注</label>
            <textarea v-model="docForm.note" class="input-field min-h-24 resize-none" placeholder="补充这份材料的用途、来源或处理说明"></textarea>
          </div>
        </div>
        <div class="mt-6 flex flex-col-reverse gap-3 md:flex-row">
          <button @click="showDocModal = false" class="btn-secondary flex-1">取消</button>
          <button @click="submitDoc" :disabled="docUploading" class="btn-primary flex-1 disabled:opacity-60 disabled:cursor-not-allowed">{{ docUploading ? '上传中...' : '保存' }}</button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="rounded-2xl border border-slate-100 bg-white dark:bg-slate-900 py-32 text-center shadow-sm">
    <span class="text-8xl">🔍</span>
    <p class="mt-4 mb-6 text-xl text-slate-400 dark:text-slate-500">案件不存在</p>
    <router-link to="/" class="btn-primary inline-flex items-center gap-2">返回列表</router-link>
  </div>

  <!-- 图片预览弹窗 -->
  <div v-if="showImagePreview" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" @click="showImagePreview = false">
    <button @click="showImagePreview = false" class="absolute top-4 right-4 text-white text-3xl hover:text-gray-300">×</button>
    <div v-if="previewImageUrl" class="flex items-center justify-center">
      <img :src="previewImageUrl" class="max-w-[90vw] max-h-[90vh] object-contain" @click.stop />
    </div>
    <div v-else-if="previewPdfUrl" class="h-[88vh] w-[92vw] max-w-6xl overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl" @click.stop>
      <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
        <span class="truncate">{{ previewFileName || 'PDF 预览' }}</span>
        <a :href="previewPdfUrl" target="_blank" class="text-blue-600 hover:text-blue-700">新窗口打开</a>
      </div>
      <iframe :src="previewPdfUrl" class="h-[calc(88vh-56px)] w-full bg-white dark:bg-slate-900"></iframe>
    </div>
    <div v-else class="flex flex-col items-center justify-center gap-4 p-8 text-center text-white" @click.stop>
      <div class="text-7xl">{{ getFileIconByUrl(previewNonImageUrl) }}</div>
      <div class="text-lg">{{ previewFileName || '当前格式暂不支持弹窗内预览' }}</div>
      <div class="text-sm text-slate-300">Word 等文件先展示文件信息，不会直接自动下载。</div>
      <a :href="previewNonImageUrl" target="_blank" class="underline text-blue-300 hover:text-blue-200">点击打开文件</a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCaseStore } from '@/stores/case'
import StatusBadge from '@/components/StatusBadge.vue'
import DeadlinePanel from '@/components/DeadlinePanel.vue'
import dayjs from 'dayjs'
import { formatAmount } from '@/lib/case-status'
import { uploadBase64ToTos, uploadWordToTos } from '@/lib/tos'
import { readFileAsDataUrl } from '@/lib/document-processing'

const route = useRoute()
const router = useRouter()
const store = useCaseStore()

const showStatusModal = ref(false)
const showReplyModal = ref(false)
const showDocModal = ref(false)
const activeDetailTab = ref('info')
const activeMaterialTab = ref('all')
const showImagePreview = ref(false)
const previewImageUrl = ref('')
const previewPdfUrl = ref('')
const previewNonImageUrl = ref('')
const previewFileName = ref('')

const replyForm = ref({ date: dayjs().format('YYYY-MM-DD'), content: '' })
const docFileInputRef = ref(null)
const selectedDocFiles = ref([])
const docUploading = ref(false)
const docForm = ref({ name: '', url: '', type: 'other', category: 'other', note: '' })
const compensationPresets = [100, 150, 200, 300, 500]
const documentCategoryOptions = [
  { value: 'reply', label: '官方答复' },
  { value: 'decision', label: '处罚/调解决定' },
  { value: 'review', label: '行政复议材料' },
  { value: 'evidence', label: '证据材料' },
  { value: 'other', label: '其他文书' },
]
const c = ref(null)

const caseData = computed(() => store.getCase(route.params.id))

const detailTabs = [
  { value: 'info', label: '案件信息' },
  { value: 'timeline', label: '流程时间轴' },
  { value: 'materials', label: '案件材料' },
]

onMounted(() => {
  c.value = caseData.value
})

watch(caseData, (newVal) => {
  if (newVal) {
    c.value = newVal
  }
}, { immediate: true })

const primaryTitle = computed(() => c.value?.licenseName || c.value?.shopName || '未命名案件')
const secondaryTitle = computed(() => {
  const pieces = [c.value?.shopName, c.value?.productName].filter(Boolean)
  return pieces.length > 0 ? pieces.join(' · ') : '补充商品、店铺、材料后可形成完整案件档案'
})

// 终态综合状态：已调解最优先，其次举报结果，其次终止调解，最后受理状态
// 如果所有子状态字段都为空，则直接视为"未受理"，不受原 c.status 影响
const effectiveStatus = computed(() => {
  const cv = caseData.value
  if (!cv) return 'pending_report'
  if (cv.mediationStatus === 'decided') return 'decided'
  if (cv.reportResultStatus) return cv.reportResultStatus
  if (cv.mediationStatus) return cv.mediationStatus
  if (cv.acceptanceStatus) return cv.acceptanceStatus
  return 'pending_report'
})
const statusOptions = [
  { value: 'pending_report', label: '未受理', icon: '⏳' },
  { value: 'accepted', label: '已受理', icon: '✅' },
  { value: 'reported', label: '不予受理', icon: '📝' },
  { value: 'decided', label: '已调解', icon: '🤝' },
  { value: 'closed', label: '已处罚', icon: '⚖️' },
  { value: 'rejected', label: '不予立案', icon: '❌' },
  { value: 'not_punished', label: '责令改正', icon: '🚫' },
  { value: 'exempted', label: '不予处罚', icon: '🚫' },
  { value: 'mediation_terminated', label: '终止调解', icon: '✖️' },
]

const procedureVersionOptions = [
  { value: 'old', label: '旧规案件（2026-04-15 前）' },
  { value: 'new', label: '新规案件（2026-04-15 后）' },
]

const filingStatusOptions = [
  { value: 'filed', label: '已立案' },
  { value: 'not_filed', label: '不予立案' },
  { value: 'not_notified', label: '未告知' },
  { value: 'not_applicable', label: '不适用' },
]

const acceptanceOptions = [
  { value: 'accepted', label: '已受理', icon: '✅' },
  { value: 'reported', label: '不予受理', icon: '📝' },
]

const mediationOptions = [
  { value: 'decided', label: '已调解', icon: '🤝' },
  { value: 'mediation_terminated', label: '终止调解', icon: '✖️' },
]

const reportResultOptions = [
  { value: 'closed', label: '已处罚', icon: '⚖️' },
  { value: 'rejected', label: '不予立案', icon: '❌' },
  { value: 'not_punished', label: '责令改正', icon: '🚫' },
  { value: 'exempted', label: '不予处理', icon: '🚫' },
]

const statusLabels = {
  pending_report: '未受理',
  accepted: '已受理',
  reported: '不予受理',
  decided: '已调解',
  closed: '已处罚',
  rejected: '不予立案',
  not_punished: '责令改正',
  exempted: '不予处理',
  mediation_terminated: '终止调解',
}

const timelineItems = computed(() => {
  if (!c.value) return []

  const statusHistory = Array.isArray(c.value.statusHistory) ? c.value.statusHistory : []
  const getStatusChangedAt = (...statuses) => {
    const target = statusHistory.find(entry => statuses.includes(entry.to))
    return target?.changedAt || ''
  }

  const replies = Array.isArray(c.value.replies) ? c.value.replies : []
  const latestReply = replies.length > 0 ? [...replies].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))[0] : null
  const hasAdminReviewProgress = Boolean(c.value.adminReviewApplyDate || c.value.adminReviewAcceptDate || c.value.adminReviewDecisionDate || c.value.adminReviewDocNo)
  const finalStatusDate = c.value.decisionDate || getStatusChangedAt('decided', 'closed', 'rejected', 'not_punished')
  const currentStatusLabel = statusLabel(c.value.status)

  const items = [
    {
      key: 'created',
      title: '案件建档',
      date: c.value.createdAt,
      description: c.value.caseNumber ? `卷宗编号 ${c.value.caseNumber}` : '已创建案件卷宗',
    },
    {
      key: 'report',
      title: '举报寄件',
      date: c.value.reportDate,
      description: c.value.trackingNumber ? `快递单号 ${c.value.trackingNumber}` : '补录寄件日期后可进入签收跟进',
    },
    {
      key: 'sign',
      title: '签收完成',
      date: c.value.signDate,
      description: c.value.signDate ? '已记录签收时间' : '签收后建议立即补日期',
    },
    {
      key: 'acceptance',
      title: '受理跟进',
      date: c.value.acceptanceDate || (c.value.acceptanceStatus ? new Date().toISOString().split('T')[0] : ''),
      description: c.value.acceptanceStatus
        ? statusLabel(c.value.acceptanceStatus)
        : (c.value.acceptanceWay ? `受理方式：${c.value.acceptanceWay}` : '等待受理状态变更'),
    },
    {
      key: 'mediation',
      title: '投诉跟进',
      date: c.value.mediationStatus ? (c.value.mediationDate || new Date().toISOString().split('T')[0]) : '',
      description: c.value.mediationStatus
        ? statusLabel(c.value.mediationStatus)
        : '等待投诉跟进状态变更',
    },
    {
      key: 'report_result',
      title: '举报结果',
      date: c.value.reportResultStatus ? (c.value.reportResultDate || new Date().toISOString().split('T')[0]) : '',
      description: c.value.reportResultStatus
        ? statusLabel(c.value.reportResultStatus)
        : '等待举报结果状态变更',
    },
    {
      key: 'decision',
      title: '处置结果',
      date: finalStatusDate,
      description: (() => {
        const parts = []
        if (c.value.mediationStatus) parts.push(`投诉结果：${statusLabel(c.value.mediationStatus)}`)
        if (c.value.reportResultStatus) parts.push(`举报结果：${statusLabel(c.value.reportResultStatus)}`)
        return parts.length > 0 ? parts.join('；') : (finalStatusDate ? `处置结果：${currentStatusLabel}` : '调解、处罚或不予立案后补齐结果日期')
      })(),
    },
    {
      key: 'review',
      title: '行政复议',
      date: c.value.adminReviewDecisionDate || c.value.adminReviewAcceptDate || c.value.adminReviewApplyDate,
      description: hasAdminReviewProgress
        ? `复议结果：${c.value.adminReviewResult || '处理中'}`
        : '未进入复议时可暂不处理',
    },
  ]

  const firstPendingIndex = items.findIndex(item => !item.date)

  return items.map((item, index) => ({
    ...item,
    state: item.date ? 'done' : index === (firstPendingIndex === -1 ? items.length : firstPendingIndex) ? 'current' : 'pending',
  }))
})

const timelineSummary = computed(() => {
  const doneCount = timelineItems.value.filter(item => item.date).length
  const pendingTitles = timelineItems.value.filter(item => !item.date).slice(0, 3).map(item => item.title)
  const current = timelineItems.value.find(item => item.state === 'current') || timelineItems.value[timelineItems.value.length - 1]

  return {
    doneCount,
    total: timelineItems.value.length,
    currentTitle: current?.title || '流程时间轴',
    pendingText: pendingTitles.length > 0 ? pendingTitles.join('、') : '主要节点已补齐',
  }
})

const caseImages = computed(() => c.value?.images || [])
const caseDocuments = computed(() => c.value?.documents || [])

const documentCategoryMeta = {
  reply: { label: '官方答复', icon: '💬' },
  decision: { label: '处罚/调解决定', icon: '⚖️' },
  review: { label: '行政复议材料', icon: '📚' },
  evidence: { label: '证据材料', icon: '🧾' },
  other: { label: '其他文书', icon: '📄' },
}

const materialItems = computed(() => {
  const materials = []

  caseDocuments.value.forEach(d => {
    materials.push({
      id: d.id,
      type: 'document',
      category: d.category || 'other',
      name: d.name,
      date: d.uploadedAt || '',
      url: d.url,
      note: d.note || '',
      data: d,
    })
  })

  caseImages.value.forEach((img, idx) => {
    materials.push({
      id: `img-${idx}`,
      type: 'image',
      category: 'image',
      name: img.name || '信封图片',
      date: img.uploadedAt || img.date || '',
      url: img.url,
      note: img.trackingNumber ? `快递单号 ${img.trackingNumber}` : '',
      data: img,
    })
  })

  return materials.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
})

const materialSummary = computed(() => ({
  total: materialItems.value.length,
  images: caseImages.value.length,
  documents: caseDocuments.value.length,
  latestAt: materialItems.value[0]?.date || '',
}))

const documentGroups = computed(() => {
  const groups = documentCategoryOptions.map(option => ({
    ...option,
    icon: documentCategoryMeta[option.value]?.icon || '📄',
    items: caseDocuments.value.filter(item => (item.category || 'other') === option.value),
  }))

  return groups.filter(group => group.items.length > 0)
})

const materialTabs = computed(() => [
  { label: '全部', value: 'all', count: materialItems.value.length },
  { label: '信封图片', value: 'images', count: caseImages.value.length },
  { label: '文书分组', value: 'documents', count: caseDocuments.value.length },
])

function getDocumentCategoryLabel(category = 'other') {
  return documentCategoryMeta[category]?.label || documentCategoryMeta.other.label
}

function getMaterialIcon(type, category = 'other') {
  if (type === 'image') return '🖼️'
  return documentCategoryMeta[category]?.icon || '📄'
}

function deleteMaterial(item) {
  if (item.type === 'document') {
    deleteDoc(item.id)
  } else if (item.type === 'image') {
    const idx = caseImages.value.findIndex(img => img.url === item.url)
    if (idx !== -1) deleteImage(idx)
  }
}

function deleteImage(idx) {
  const images = [...(c.value.images || [])]
  images.splice(idx, 1)
  saveField('images', images)
}

function previewFile(url, name = '') {
  const isImage = /\.(png|jpe?g|gif|webp|bmp|heic|heif)(\?|$)/i.test(url)
  const isPdf = /\.(pdf)(\?|$)/i.test(url)
  previewFileName.value = name || ''
  previewImageUrl.value = isImage ? url : ''
  previewPdfUrl.value = isPdf ? url : ''
  previewNonImageUrl.value = !isImage && !isPdf ? url : ''
  showImagePreview.value = true
}

function previewImage(url) {
  previewFile(url)
}

function getFileIconByUrl(url) {
  if (!url) return '📄'
  const lower = url.toLowerCase()
  if (lower.endsWith('.pdf')) return '📕'
  if (lower.endsWith('.doc') || lower.endsWith('.docx')) return '📄'
  if (lower.endsWith('.txt') || lower.endsWith('.md')) return '📝'
  if (lower.endsWith('.xls') || lower.endsWith('.xlsx')) return '📊'
  return '📎'
}

function statusLabel(s) {
  return statusLabels[s] || s
}

function formatDate(iso) {
  if (!iso) return '未记录时间'
  return dayjs(iso).format('YYYY-MM-DD HH:mm')
}

function formatTimelineDate(value) {
  if (!value) return '待补充'
  const parsed = dayjs(value)
  if (!parsed.isValid()) return String(value)
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    return parsed.format('YYYY-MM-DD')
  }
  return parsed.format('YYYY-MM-DD HH:mm')
}

function formatCurrency(value) {
  return formatAmount(value)
}

function escapeHtml(value = '') {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function downloadBlob(content, fileName, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function buildCaseSummaryText() {
  if (!c.value) return ''

  const baseInfo = [
    ['案件编号', c.value.caseNumber || ''],
    ['当前状态', statusLabel(c.value.status)],
    ['执照名称', c.value.licenseName || ''],
    ['店铺名称', c.value.shopName || ''],
    ['商品名称', c.value.productName || ''],
    ['管辖局', c.value.jurisdiction || ''],
    ['快递单号', c.value.trackingNumber || ''],
    ['举报寄件日期', c.value.reportDate || ''],
    ['签收日期', c.value.signDate || ''],
    ['受理日期', c.value.acceptanceDate || ''],
    ['受理方式', c.value.acceptanceWay || ''],
    ['结果日期', c.value.decisionDate || ''],
    ['商品价格', formatCurrency(c.value.productPrice)],
    ['花费总额', formatCurrency(c.value.expense)],
    ['赔偿金额', formatCurrency(c.value.profit)],
    ['复议情况', c.value.hasAdminReview === 'yes' ? '已申请' : '未申请'],
    ['复议结果', c.value.adminReviewResult || ''],
    ['复议机关', c.value.adminReviewAuthority || ''],
    ['复议决定书编号', c.value.adminReviewDocNo || ''],
    ['备注', c.value.notes || ''],
    ['创建时间', formatDate(c.value.createdAt)],
    ['更新时间', formatDate(c.value.updatedAt)],
  ]

  const lines = [
    '案件卷宗摘要',
    '====================',
    ...baseInfo.map(([label, value]) => `${label}：${value || '-'}`),
    '',
    '流程时间轴',
    '--------------------',
    ...timelineItems.value.map(item => `${item.title}｜${formatTimelineDate(item.date)}｜${item.description}`),
    '',
    '答复记录',
    '--------------------',
    ...(Array.isArray(c.value.replies) && c.value.replies.length > 0
      ? c.value.replies.map((reply, index) => `${index + 1}. ${reply.date || '未填写日期'}\n${reply.content || '无内容'}`)
      : ['暂无答复记录']),
    '',
    '案件材料',
    '--------------------',
    `图片：${caseImages.value.length} 项`,
    `文书：${c.value.documents?.length || 0} 项`,
  ]

  return lines.join('\n')
}

function downloadCaseSummary() {
  if (!c.value) return
  const fileName = `${c.value.caseNumber || '案件卷宗'}_摘要_${dayjs().format('YYYYMMDD_HHmmss')}.txt`
  downloadBlob(buildCaseSummaryText(), fileName)
}

function printCaseDossier() {
  if (!c.value) return
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=960,height=900')
  if (!printWindow) {
    alert('打印窗口被拦截了，请允许浏览器打开新窗口后重试')
    return
  }

  const content = escapeHtml(buildCaseSummaryText()).replace(/\n/g, '<br />')
  printWindow.document.write(`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(c.value.caseNumber || '案件卷宗')}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Microsoft YaHei', sans-serif; padding: 32px; color: #1e293b; line-height: 1.7; }
    h1 { font-size: 24px; margin: 0 0 16px; }
    .meta { margin-bottom: 20px; color: #64748b; font-size: 14px; }
    .content { white-space: normal; font-size: 14px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>案件卷宗摘要</h1>
  <div class="meta">${escapeHtml(c.value.caseNumber || '')} ${escapeHtml(primaryTitle.value || '')}</div>
  <div class="content">${content}</div>
</body>
</html>`)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => printWindow.print(), 300)
}

const PROCEDURE_RULE_CUTOFF = '2026-04-15'

function inferProcedureVersion(signDate) {
  if (!signDate) return 'new'
  const parsed = dayjs(signDate)
  if (!parsed.isValid()) return 'new'
  return parsed.isBefore(dayjs(PROCEDURE_RULE_CUTOFF), 'day') ? 'old' : 'new'
}

function saveField(field, value) {
  store.updateCase(c.value.id, { [field]: value })
}

function saveSignDate(value) {
  const patch = { signDate: value || null }
  if (!c.value.procedureVersion) {
    patch.procedureVersion = inferProcedureVersion(value)
  }
  store.updateCase(c.value.id, patch)
  loadCase()
}

function saveProcedureVersion(value) {
  store.updateCase(c.value.id, { procedureVersion: value })
  loadCase()
}

function changeFilingStatus(value) {
  const patch = { filingStatus: value }
  if (value === 'filed' && !c.value.filingDate) {
    patch.filingDate = dayjs().format('YYYY-MM-DD')
  }
  store.updateCase(c.value.id, patch)
  loadCase()
}

function clearFilingSection() {
  store.updateCase(c.value.id, {
    filingStatus: '',
    filingDate: null,
    filingNoticeDate: null,
    filingNote: '',
  })
  loadCase()
}

function saveFilingDate(value) {
  store.updateCase(c.value.id, { filingDate: value || null })
  loadCase()
}

function saveFilingNoticeDate(value) {
  store.updateCase(c.value.id, { filingNoticeDate: value || null })
  loadCase()
}

function saveFilingNote(value) {
  store.updateCase(c.value.id, { filingNote: value || '' })
  loadCase()
}

async function saveProfit(value) {
  const normalized = value === '' || value === null || value === undefined ? '' : Number(value)
  c.value.profit = normalized
  await store.updateCase(c.value.id, { profit: normalized })
  loadCase()
}

function loadCase() {
  c.value = caseData.value
}

function updateStatusSection(statusField, dateField, newStatus) {
  const nextDate = c.value?.[dateField] || dayjs().format('YYYY-MM-DD')
  store.updateCase(c.value.id, {
    [statusField]: newStatus,
    [dateField]: nextDate,
  })
  loadCase()
}

function clearStatusSection(statusField, dateField) {
  store.updateCase(c.value.id, {
    [statusField]: null,
    [dateField]: null,
  })
  loadCase()
}

function changeAcceptanceStatus(newStatus) {
  updateStatusSection('acceptanceStatus', 'acceptanceDate', newStatus)
}

function clearAcceptanceStatus() {
  clearStatusSection('acceptanceStatus', 'acceptanceDate')
}

function saveAcceptanceDate(value) {
  store.updateCase(c.value.id, { acceptanceDate: value || null })
  loadCase()
}

function changeMediationStatus(newStatus) {
  updateStatusSection('mediationStatus', 'mediationDate', newStatus)
}

function clearMediationStatus() {
  clearStatusSection('mediationStatus', 'mediationDate')
}

function saveMediationDate(value) {
  store.updateCase(c.value.id, { mediationDate: value || null })
  loadCase()
}

function changeReportResultStatus(newStatus) {
  updateStatusSection('reportResultStatus', 'reportResultDate', newStatus)
}

function clearReportResultStatus() {
  clearStatusSection('reportResultStatus', 'reportResultDate')
}

function saveReportResultDate(value) {
  store.updateCase(c.value.id, { reportResultDate: value || null })
  loadCase()
}

function changeStatus(newStatus) {
  const updates = {}
  store.changeStatus(c.value.id, newStatus, updates)
  loadCase()
  showStatusModal.value = false
}

function undoStatus(index) {
  let targetStatus = c.value.statusHistory[index].from
  if (!targetStatus) {
    targetStatus = 'pending_report'
  }
  let newHistory = c.value.statusHistory.slice(0, index)
  if (newHistory.length === 0) {
    newHistory = [{ from: '', to: 'pending_report', changedAt: c.value.statusHistory[index].changedAt }]
  }
  store.updateCase(c.value.id, {
    status: targetStatus,
    statusHistory: newHistory,
  })
  loadCase()
}

function submitReply() {
  if (!replyForm.value.content.trim()) return
  store.addReply(c.value.id, replyForm.value)
  replyForm.value = { date: dayjs().format('YYYY-MM-DD'), content: '' }
  showReplyModal.value = false
  loadCase()
}

function deleteReply(replyId) {
  c.value.replies = c.value.replies.filter(r => r.id !== replyId)
  store.updateCase(c.value.id, { replies: c.value.replies })
  loadCase()
}

function inferDocTypeByName(name = '') {
  const lowerName = String(name).toLowerCase()
  if (/\.(pdf)$/i.test(lowerName)) return 'pdf'
  if (/\.(png|jpe?g|webp|gif|bmp|heic|heif)$/i.test(lowerName)) return 'image'
  return 'other'
}

function handleDocFileChange(event) {
  const files = Array.from(event.target.files || [])
  selectedDocFiles.value = files
  if (files.length === 0) return

  if (files.length === 1 && !docForm.value.name.trim()) {
    docForm.value.name = files[0].name || ''
  }
  if (!docForm.value.category) {
    docForm.value.category = 'other'
  }
  const sampleName = files.length === 1 ? (docForm.value.name || files[0].name || '') : (files[0].name || '')
  docForm.value.type = inferDocTypeByName(sampleName)
}

async function submitDoc() {
  if (selectedDocFiles.value.length === 0) return
  if (!docForm.value.category) {
    docForm.value.category = 'other'
  }

  docUploading.value = true
  let successCount = 0
  let failCount = 0

  try {
    for (const file of selectedDocFiles.value) {
      try {
        const isSingleFile = selectedDocFiles.value.length === 1
        const finalName = isSingleFile
          ? (docForm.value.name.trim() || file.name || '未命名材料')
          : (file.name || '未命名材料')
        const lowerName = finalName.toLowerCase()
        const originalLower = (file.name || '').toLowerCase()
        const isWord = /\.(doc|docx)$/i.test(originalLower)
        const type = inferDocTypeByName(lowerName)
        const dataUrl = await readFileAsDataUrl(file)
        const uploadedUrl = isWord
          ? await uploadWordToTos(dataUrl, file.name)
          : await uploadBase64ToTos(dataUrl, file.name)

        if (!uploadedUrl) throw new Error('上传失败，请重试')

        await store.addDocument(c.value.id, {
          ...docForm.value,
          name: finalName,
          url: uploadedUrl,
          type,
        })
        successCount += 1
      } catch (error) {
        console.error('[submitDoc] 上传失败:', file?.name, error)
        failCount += 1
      }
    }

    alert(`上传完成：成功 ${successCount} 个，失败 ${failCount} 个`)
    if (successCount > 0) {
      docForm.value = { name: '', url: '', type: 'other', category: 'other', note: '' }
      selectedDocFiles.value = []
      if (docFileInputRef.value) docFileInputRef.value.value = ''
      showDocModal.value = false
      loadCase()
    }
  } finally {
    docUploading.value = false
  }
}

function deleteDoc(docId) {
  c.value.documents = c.value.documents.filter(d => d.id !== docId)
  store.updateCase(c.value.id, { documents: c.value.documents })
  loadCase()
}

function confirmDelete() {
  if (confirm('确认删除此案件？删除后不可恢复。')) {
    store.deleteCase(c.value.id)
    router.push('/')
  }
}
</script>

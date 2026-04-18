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
            <div class="text-xs uppercase tracking-[0.24em] text-slate-400">案件卷宗</div>
            <h2 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{{ primaryTitle }}</h2>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{{ secondaryTitle }}</p>
          </div>

          <div class="flex flex-wrap gap-2">
            <StatusBadge :status="c.status" :profit="c.profit" />
            <span class="soft-tag">编号 {{ c.caseNumber || '待生成' }}</span>
            <span class="soft-tag">管辖局 {{ c.jurisdiction || '未填写' }}</span>
            <span class="soft-tag">快递单号 {{ c.trackingNumber || '暂无' }}</span>
            <span class="soft-tag">修改后自动保存</span>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div class="metric-card">
              <div class="text-xs text-slate-500">当前状态</div>
              <div class="mt-2"><StatusBadge :status="c.status" :profit="c.profit" /></div>
            </div>
            <div class="metric-card">
              <div class="text-xs text-slate-500">商品价格</div>
              <div class="mt-2 text-2xl font-semibold text-slate-800">¥{{ formatCurrency(c.productPrice) }}</div>
            </div>
            <div class="metric-card">
              <div class="text-xs text-slate-500">花费总额</div>
              <div class="mt-2 text-2xl font-semibold text-slate-800">¥{{ formatCurrency(c.expense) }}</div>
            </div>
            <div class="metric-card">
              <div class="text-xs text-slate-500">赔偿金额</div>
              <div class="mt-2 text-2xl font-semibold text-slate-800">¥{{ formatCurrency(c.profit) }}</div>
            </div>
          </div>
        </div>

        <div class="w-full xl:max-w-sm">
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <div class="text-sm font-semibold text-slate-800">处置操作</div>
            <p class="mt-1 text-xs leading-5 text-slate-500">围绕状态流转、答复补录与材料补充集中操作，基础字段在下方卷宗中直接维护。</p>

            <div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <button @click="showStatusModal = true" class="btn-primary w-full">变更状态</button>
              <button @click="showReplyModal = true" class="btn-secondary w-full">添加答复</button>
              <button @click="showDocModal = true" class="btn-secondary w-full">上传文书</button>
              <button @click="downloadCaseSummary" class="btn-secondary w-full">导出卷宗摘要</button>
              <button @click="printCaseDossier" class="btn-secondary w-full">打印卷宗</button>
              <button @click="confirmDelete" class="btn-danger w-full">删除案件</button>
            </div>

            <div class="mt-4 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-400">
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
          :class="activeDetailTab === tab.value ? 'bg-slate-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
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
              <input :value="c.caseNumber || '待生成'" type="text" class="input-field bg-slate-50 text-slate-500" readonly />
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
              <input v-model="c.signDate" @change="saveField('signDate', c.signDate)" type="date" class="input-field" />
            </div>
            <div>
              <label class="label">📨 举报寄件日期</label>
              <input v-model="c.reportDate" @change="saveField('reportDate', c.reportDate)" type="date" class="input-field" />
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
                <div class="text-xs text-slate-500">当前状态</div>
                <div class="mt-2"><StatusBadge :status="c.status" :profit="c.profit" /></div>
              </div>

              <div class="panel-card">
                <div class="text-xs text-slate-500">受理跟进</div>
                <div class="mt-3 grid grid-cols-1 gap-3">
                  <div>
                    <label class="label">✅ 受理日期</label>
                    <input v-model="c.acceptanceDate" @change="saveField('acceptanceDate', c.acceptanceDate)" type="date" class="input-field" />
                  </div>
                  <div>
                    <label class="label">📮 受理方式</label>
                    <input v-model="c.acceptanceWay" @change="saveField('acceptanceWay', c.acceptanceWay)" type="text" class="input-field" placeholder="电话、书面、平台等" />
                  </div>
                  <div>
                    <label class="label">⚖️ 结果日期</label>
                    <input v-model="c.decisionDate" @change="saveField('decisionDate', c.decisionDate)" type="date" class="input-field" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="card">
            <h3 class="section-title">填写提醒</h3>
            <div class="space-y-2 text-sm leading-6">
              <div :class="c.jurisdiction ? 'text-slate-700' : 'text-slate-500'">
                {{ c.jurisdiction ? '已填写管辖局，后续生成材料会更顺。' : '建议优先补齐管辖局，后续流程会更稳。' }}
              </div>
              <div :class="c.trackingNumber ? 'text-slate-700' : 'text-slate-500'">
                {{ c.trackingNumber ? '快递单号已补齐，方便后续核验签收。' : '快递单号还空着，后续查签收会少一个抓手。' }}
              </div>
              <div :class="c.notes ? 'text-slate-700' : 'text-slate-500'">
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
            <span class="soft-tag">赔偿金额支持快捷填写</span>
          </div>

          <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label class="label">商品价格（元）</label>
              <input v-model="c.productPrice" @change="saveField('productPrice', c.productPrice)" type="number" step="0.01" class="input-field" placeholder="0.00" />
            </div>
            <div>
              <label class="label">花费总额（元）</label>
              <input v-model="c.expense" @change="saveField('expense', c.expense)" type="number" step="0.01" class="input-field" placeholder="默认可与商品价格一致" />
            </div>
            <div class="md:col-span-3">
              <label class="label">赔偿金额（元）</label>
              <div class="space-y-3">
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="amount in compensationPresets"
                    :key="amount"
                    type="button"
                    @click="selectCompensation(amount)"
                    class="rounded-full border px-3 py-1.5 text-sm transition"
                    :class="Number(c.profit || 0) === amount ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-700'"
                  >
                    {{ amount }}
                  </button>
                </div>
                <input v-model="c.profit" @change="applyCompensation($event.target.value)" type="number" step="0.01" class="input-field" placeholder="已赔付时填写，也可手动输入" />
              </div>
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

            <div v-else class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-sm text-slate-500">
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
              <p class="text-sm text-slate-500">把建档、寄件、签收、受理、答复、结果、复议串成一条卷宗主线。</p>
            </div>
            <span class="soft-tag">已完成 {{ timelineSummary.doneCount }}/{{ timelineSummary.total }}</span>
          </div>

          <div class="space-y-4">
            <div
              v-for="item in timelineItems"
              :key="item.key"
              class="flex gap-4 rounded-2xl border p-4"
              :class="item.state === 'done'
                ? 'border-slate-200 bg-white'
                : item.state === 'current'
                  ? 'border-blue-200 bg-blue-50/70'
                  : 'border-dashed border-slate-200 bg-slate-50/70'"
            >
              <div class="flex flex-col items-center">
                <div
                  class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
                  :class="item.state === 'done'
                    ? 'bg-slate-800 text-white'
                    : item.state === 'current'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-500'"
                >
                  {{ item.state === 'done' ? '✓' : item.state === 'current' ? '•' : '…' }}
                </div>
                <div v-if="item.key !== timelineItems[timelineItems.length - 1]?.key" class="mt-2 h-full w-px bg-slate-200"></div>
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div class="text-sm font-semibold text-slate-800">{{ item.title }}</div>
                  <div class="text-sm" :class="item.date ? 'text-slate-700' : 'text-slate-400'">{{ formatTimelineDate(item.date) }}</div>
                </div>
                <div class="mt-2 text-sm leading-6 text-slate-500">{{ item.description }}</div>
              </div>
            </div>
          </div>
        </section>

        <div class="space-y-4">
          <section class="card">
            <h3 class="section-title">流程摘要</h3>
            <div class="space-y-3">
              <div class="panel-card">
                <div class="text-xs text-slate-500">当前推进到</div>
                <div class="mt-2 text-lg font-semibold text-slate-800">{{ timelineSummary.currentTitle }}</div>
              </div>
              <div class="panel-card">
                <div class="text-xs text-slate-500">下一步建议补齐</div>
                <div class="mt-2 text-sm leading-6 text-slate-600">{{ timelineSummary.pendingText }}</div>
              </div>
              <div class="panel-card">
                <div class="text-xs text-slate-500">当前状态</div>
                <div class="mt-2"><StatusBadge :status="c.status" :profit="c.profit" /></div>
              </div>
            </div>
          </section>

          <section class="card">
            <div class="flex items-center justify-between gap-3 mb-4">
              <h3 class="section-title mb-0">
                <span>📊</span>
                <span>状态流转记录</span>
              </h3>
              <span class="soft-tag">共 {{ c.statusHistory?.length || 0 }} 条</span>
            </div>
            <div v-if="!c.statusHistory?.length" class="text-sm text-slate-400">暂无状态记录</div>
            <div v-else class="space-y-3">
              <div
                v-for="(h, idx) in c.statusHistory"
                :key="h.changedAt + idx"
                class="rounded-2xl border p-4"
                :class="idx === 0 ? 'border-blue-200 bg-blue-50/70' : 'border-slate-200 bg-slate-50/80'"
              >
                <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div class="text-xs text-slate-400">{{ formatDate(h.changedAt) }}</div>
                    <div class="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <span class="soft-tag">{{ statusLabel(h.from) || '初始' }}</span>
                      <span class="text-slate-400">→</span>
                      <span class="soft-tag">{{ statusLabel(h.to) }}</span>
                    </div>
                  </div>
                  <button v-if="idx > 0" @click="undoStatus(idx)" class="btn-secondary">撤销此步</button>
                </div>
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
            <div v-if="!(c.replies || []).length" class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-400">
              还没有答复记录
            </div>
            <div v-else class="space-y-3">
              <div v-for="reply in c.replies" :key="reply.id" class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="text-sm font-semibold text-slate-800">{{ reply.date || '未填写日期' }}</div>
                    <div class="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{{ reply.content }}</div>
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
            <p class="text-sm text-slate-500">把信封图片、官方答复、处罚决定、复议材料分开管理，卷宗会更清晰。</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button @click="showDocModal = true" class="btn-primary">新增文书</button>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div class="metric-card">
            <div class="text-xs text-slate-500">材料总数</div>
            <div class="mt-2 text-2xl font-semibold text-slate-800">{{ materialSummary.total }}</div>
          </div>
          <div class="metric-card">
            <div class="text-xs text-slate-500">信封图片</div>
            <div class="mt-2 text-2xl font-semibold text-slate-800">{{ materialSummary.images }}</div>
          </div>
          <div class="metric-card">
            <div class="text-xs text-slate-500">文书材料</div>
            <div class="mt-2 text-2xl font-semibold text-slate-800">{{ materialSummary.documents }}</div>
          </div>
          <div class="metric-card">
            <div class="text-xs text-slate-500">最近更新</div>
            <div class="mt-2 text-sm font-semibold text-slate-800">{{ materialSummary.latestAt ? formatDate(materialSummary.latestAt) : '暂未上传' }}</div>
          </div>
        </div>

        <div class="flex gap-2 mt-4 overflow-x-auto pb-1">
          <button
            v-for="tab in materialTabs"
            :key="tab.value"
            @click="activeMaterialTab = tab.value"
            class="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition"
            :class="activeMaterialTab === tab.value ? 'bg-slate-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          >
            {{ tab.label }} ({{ tab.count }})
          </button>
        </div>

        <div v-if="activeMaterialTab === 'all'" class="mt-4">
          <div v-if="materialItems.length === 0" class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center text-slate-400">
            暂无案件材料
          </div>
          <div v-else class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div
              v-for="(item, idx) in materialItems"
              :key="item.id || idx"
              class="rounded-2xl border p-4"
              :class="item.type === 'image' ? 'border-purple-200 bg-purple-50/60' : 'border-slate-200 bg-slate-50/80'"
            >
              <div class="flex items-start gap-3">
                <span class="text-2xl">{{ getMaterialIcon(item.type, item.category) }}</span>
                <div class="min-w-0 flex-1">
                  <div class="truncate text-sm font-semibold text-slate-800">{{ item.name }}</div>
                  <div class="mt-1 flex flex-wrap gap-2 text-xs text-slate-400">
                    <span>{{ item.date ? formatDate(item.date) : '未记录时间' }}</span>
                    <span v-if="item.type === 'document'" class="soft-tag">{{ getDocumentCategoryLabel(item.category) }}</span>
                  </div>
                  <div v-if="item.note" class="mt-2 text-xs leading-5 text-slate-500">{{ item.note }}</div>
                  <a v-if="item.url && item.type === 'document'" :href="item.url" target="_blank" rel="noreferrer" class="mt-2 inline-flex text-sm text-blue-600 hover:text-blue-700">打开链接</a>
                </div>
                <button @click="deleteMaterial(item)" class="btn-ghost text-rose-500 hover:bg-rose-50 hover:text-rose-600">删除</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeMaterialTab === 'images'" class="mt-4">
          <div v-if="caseImages.length === 0" class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center text-slate-400">
            暂无上传图片
          </div>
          <div v-else class="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <div v-for="(img, idx) in caseImages" :key="idx" class="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div class="bg-slate-50 p-3">
                <img :src="img.url" class="h-40 w-full rounded-xl object-contain bg-white" />
              </div>
              <div class="space-y-2 px-4 py-3">
                <div class="min-w-0">
                  <div class="truncate text-sm font-medium text-slate-700">{{ img.name || '信封图片' }}</div>
                  <div class="text-xs text-slate-400">{{ img.uploadedAt ? formatDate(img.uploadedAt) : (img.date || '未记录时间') }}</div>
                  <div v-if="img.trackingNumber" class="mt-1 text-xs text-slate-500">快递单号 {{ img.trackingNumber }}</div>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <a v-if="img.url" :href="img.url" target="_blank" rel="noreferrer" class="text-sm text-blue-600 hover:text-blue-700">查看原图</a>
                  <button @click="deleteImage(idx)" class="btn-ghost text-rose-500 hover:bg-rose-50 hover:text-rose-600">删除</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeMaterialTab === 'documents'" class="mt-4">
          <div v-if="!caseDocuments.length" class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center text-slate-400">
            暂无上传文书
          </div>
          <div v-else class="space-y-4">
            <section v-for="group in documentGroups" :key="group.value" class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div class="mb-3 flex items-center justify-between gap-3">
                <div class="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <span>{{ group.icon }}</span>
                  <span>{{ group.label }}</span>
                </div>
                <span class="soft-tag">{{ group.items.length }} 项</span>
              </div>
              <div class="space-y-3">
                <div
                  v-for="d in group.items"
                  :key="d.id"
                  class="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div class="flex items-start gap-3">
                    <span class="text-2xl">{{ getMaterialIcon('document', d.category || 'other') }}</span>
                    <div class="min-w-0 flex-1">
                      <div class="truncate text-sm font-semibold text-slate-800">{{ d.name }}</div>
                      <div class="mt-1 text-xs text-slate-400">{{ formatDate(d.uploadedAt) }}</div>
                      <div v-if="d.note" class="mt-2 text-sm leading-6 text-slate-500">{{ d.note }}</div>
                      <a v-if="d.url" :href="d.url" target="_blank" rel="noreferrer" class="mt-2 inline-flex text-sm text-blue-600 hover:text-blue-700">打开链接</a>
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
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 class="text-lg font-bold text-slate-800">变更案件状态</h3>
        <div class="mt-4 space-y-2">
          <button
            v-for="s in statusOptions"
            :key="s.value"
            @click="changeStatus(s.value)"
            class="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left transition hover:bg-slate-100"
          >
            <span>{{ s.icon }}</span>
            <span>{{ s.label }}</span>
          </button>
        </div>
        <button @click="showStatusModal = false" class="btn-secondary mt-4 w-full">取消</button>
      </div>
    </div>

    <div v-if="showReplyModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" @click.self="showReplyModal = false">
      <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <h3 class="text-lg font-bold text-slate-800">添加答复记录</h3>
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
      <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <h3 class="text-lg font-bold text-slate-800">新增文书材料</h3>
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
            <label class="label">文件链接（阿里云盘分享链接）</label>
            <input v-model="docForm.url" type="text" class="input-field" placeholder="https://alipan.com/..." />
          </div>
          <div>
            <label class="label">材料备注</label>
            <textarea v-model="docForm.note" class="input-field min-h-24 resize-none" placeholder="补充这份材料的用途、来源或处理说明"></textarea>
          </div>
        </div>
        <div class="mt-6 flex flex-col-reverse gap-3 md:flex-row">
          <button @click="showDocModal = false" class="btn-secondary flex-1">取消</button>
          <button @click="submitDoc" class="btn-primary flex-1">保存</button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="rounded-2xl border border-slate-100 bg-white py-32 text-center shadow-sm">
    <span class="text-8xl">🔍</span>
    <p class="mt-4 mb-6 text-xl text-slate-400">案件不存在</p>
    <router-link to="/" class="btn-primary inline-flex items-center gap-2">返回列表</router-link>
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

const route = useRoute()
const router = useRouter()
const store = useCaseStore()

const showStatusModal = ref(false)
const showReplyModal = ref(false)
const showDocModal = ref(false)
const activeDetailTab = ref('info')
const activeMaterialTab = ref('all')

const replyForm = ref({ date: dayjs().format('YYYY-MM-DD'), content: '' })
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

const statusOptions = [
  { value: 'pending_report', label: '未受理', icon: '⏳' },
  { value: 'accepted', label: '已受理', icon: '✅' },
  { value: 'reported', label: '不予受理', icon: '📝' },
  { value: 'decided', label: '已调解', icon: '🤝' },
  { value: 'closed', label: '已处罚', icon: '⚖️' },
  { value: 'rejected', label: '不予立案', icon: '❌' },
  { value: 'not_punished', label: '不予处罚', icon: '🚫' },
]

const statusLabels = {
  pending_report: '未受理',
  accepted: '已受理',
  reported: '不予受理',
  decided: '已调解',
  closed: '已处罚',
  rejected: '不予立案',
  not_punished: '不予处罚',
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
      date: c.value.acceptanceDate || getStatusChangedAt('accepted', 'reported'),
      description: c.value.acceptanceWay ? `受理方式：${c.value.acceptanceWay}` : `当前状态：${currentStatusLabel}`,
    },
    {
      key: 'reply',
      title: '官方答复',
      date: latestReply?.date || '',
      description: latestReply?.content ? latestReply.content.slice(0, 32) : '收到答复后可沉淀流程依据',
    },
    {
      key: 'decision',
      title: '处置结果',
      date: finalStatusDate,
      description: finalStatusDate ? `当前结果：${currentStatusLabel}` : '调解、处罚或不予立案后补齐结果日期',
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
    '状态流转记录',
    '--------------------',
    ...(Array.isArray(c.value.statusHistory) && c.value.statusHistory.length > 0
      ? c.value.statusHistory.map((item, index) => `${index + 1}. ${formatDate(item.changedAt)}  ${statusLabel(item.from) || '初始'} -> ${statusLabel(item.to)}`)
      : ['暂无状态流转记录']),
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

function saveField(field, value) {
  store.updateCase(c.value.id, { [field]: value })
}

async function applyCompensation(value) {
  const normalized = value === '' || value === null || value === undefined ? '' : Number(value)
  c.value.profit = normalized
  await store.updateCase(c.value.id, { profit: normalized })

  if (normalized !== '' && c.value.status !== 'decided') {
    await store.changeStatus(c.value.id, 'decided')
  }

  if (normalized === '' && c.value.status === 'decided') {
    const history = Array.isArray(c.value.statusHistory) ? [...c.value.statusHistory] : []
    const lastEntry = history[history.length - 1]

    if (lastEntry?.to === 'decided') {
      const targetStatus = lastEntry.from || 'pending_report'
      const newHistory = history.slice(0, -1)
      await store.updateCase(c.value.id, {
        status: targetStatus,
        statusHistory: newHistory.length > 0 ? newHistory : [{ from: '', to: targetStatus, changedAt: lastEntry.changedAt }],
      })
    }
  }

  loadCase()
}

function selectCompensation(amount) {
  applyCompensation(amount)
}

function loadCase() {
  c.value = caseData.value
}

function changeStatus(newStatus) {
  const updates = {}
  if (newStatus === 'accepted') {
    updates.acceptanceDate = dayjs().format('YYYY-MM-DD')
  }
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
  router.push('/')
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

function submitDoc() {
  if (!docForm.value.name.trim()) return
  const lowerName = docForm.value.name.toLowerCase()
  const type = lowerName.endsWith('.pdf') ? 'pdf' : (lowerName.match(/\.(png|jpe?g|webp|gif)$/) ? 'image' : 'other')
  store.addDocument(c.value.id, { ...docForm.value, type })
  docForm.value = { name: '', url: '', type: 'other', category: 'other', note: '' }
  showDocModal.value = false
  loadCase()
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

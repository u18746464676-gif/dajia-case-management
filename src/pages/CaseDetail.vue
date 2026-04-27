<template>
  <div v-if="c" class="case-detail-page page-shell case-detail-shell">
    <section class="case-detail-page__header detail-saas-card">
      <button @click="$router.back()" class="case-detail-page__back">
        <span>←</span>
        <span>返回列表</span>
      </button>

      <h1 class="case-detail-page__title">{{ primaryTitle }}</h1>
      <p class="case-detail-page__subtitle">{{ secondaryTitle }}</p>

      <div class="case-detail-page__pills">
        <span class="detail-pill detail-pill-status" :class="statusToneClass(effectiveStatus)">{{ statusLabel(effectiveStatus) }}</span>
        <span class="detail-pill">编号 {{ c.caseNumber || '待生成' }}</span>
        <span class="detail-pill">管辖局 {{ c.jurisdiction || '未填写' }}</span>
        <span class="detail-pill">快递单号 {{ c.trackingNumber || '暂无' }}</span>
        <span class="detail-pill">修改后自动保存</span>
      </div>
    </section>

    <section class="case-detail-page__metrics detail-metrics">
      <article class="detail-metric-card">
        <div class="detail-metric-card__icon"><span v-html="detailMetricIcons.status"></span></div>
        <div class="detail-metric-card__body">
          <div class="detail-metric-card__label">当前状态</div>
          <div class="detail-metric-card__value">
            <span class="detail-pill detail-pill-status" :class="statusToneClass(effectiveStatus)">{{ statusLabel(effectiveStatus) }}</span>
          </div>
        </div>
      </article>
      <article class="detail-metric-card">
        <div class="detail-metric-card__icon"><span v-html="detailMetricIcons.price"></span></div>
        <div class="detail-metric-card__body">
          <div class="detail-metric-card__label">商品价格</div>
          <div class="detail-metric-card__value detail-metric-card__value-gold">¥{{ formatCurrency(c.productPrice) }}</div>
        </div>
      </article>
      <article class="detail-metric-card">
        <div class="detail-metric-card__icon"><span v-html="detailMetricIcons.expense"></span></div>
        <div class="detail-metric-card__body">
          <div class="detail-metric-card__label">花费总额</div>
          <div class="detail-metric-card__value detail-metric-card__value-gold">¥{{ formatCurrency(c.expense) }}</div>
        </div>
      </article>
      <article class="detail-metric-card">
        <div class="detail-metric-card__icon"><span v-html="detailMetricIcons.compensation"></span></div>
        <div class="detail-metric-card__body">
          <div class="detail-metric-card__label">赔偿金额</div>
          <div class="detail-metric-card__value detail-metric-card__value-gold">¥{{ formatCurrency(c.profit) }}</div>
        </div>
      </article>
    </section>

    <div class="detail-tabs detail-saas-card">
      <button
        v-for="tab in detailTabs"
        :key="tab.value"
        type="button"
        @click="selectDetailTab(tab.value)"
        class="detail-tab"
        :class="activeDetailTab === tab.value || (tab.value === 'disposal' && activeDetailTab === 'info') && disposalTabSelected ? 'detail-tab-active' : ''"
      >
        {{ tab.label }}
      </button>
    </div>

    <template v-if="activeDetailTab === 'info'">
      <div class="main-detail-grid">
        <div class="case-detail-page__main-col">
          <div class="info-row">
            <section class="detail-section detail-section overview detail-saas-card">
              <div class="detail-section__head">
                <div>
                  <h3 class="detail-section-title">案件速览</h3>
                  <p class="detail-section-desc">顶部只读摘要，快速确认当前状态、关键节点和期限风险。</p>
                </div>
                <span class="detail-chip-muted">只读摘要</span>
              </div>

              <div class="detail-overview-grid">
                <div class="detail-panel">
                  <div class="detail-panel-label">当前状态</div>
                  <div class="detail-panel-value"><span class="detail-pill detail-pill-status" :class="statusToneClass(effectiveStatus)">{{ statusLabel(effectiveStatus) }}</span></div>
                </div>
                <div class="detail-panel">
                  <div class="detail-panel-label">受理状态 / 日期</div>
                  <div class="detail-panel-value">{{ c.acceptanceStatus ? statusLabel(c.acceptanceStatus) : '未填写' }}</div>
                  <div class="detail-panel-sub">{{ c.acceptanceDate || '日期未填写' }}</div>
                </div>
                <div class="detail-panel">
                  <div class="detail-panel-label">举报结果 / 日期</div>
                  <div class="detail-panel-value">{{ c.reportResultStatus ? statusLabel(c.reportResultStatus) : '未填写' }}</div>
                  <div class="detail-panel-sub">{{ c.reportResultDate || '日期未填写' }}</div>
                </div>
                <div class="detail-panel">
                  <div class="detail-panel-label">关键期限风险</div>
                  <div class="detail-panel-value detail-panel-value-risk">{{ keyRiskSummary.title }}</div>
                  <div class="detail-panel-sub">{{ keyRiskSummary.detail }}</div>
                </div>
              </div>
            </section>

            <section class="detail-section detail-saas-card">
              <div class="detail-section__head">
                <div>
                  <h3 class="detail-section-title">基础信息</h3>
                  <p class="detail-section-desc">案件主字段保持两列布局，方便桌面端快速浏览，窄屏自动回落为一列。</p>
                </div>
                <span class="detail-chip-muted">主档信息</span>
              </div>

              <div class="detail-fields">
                <div class="detail-field">
                  <label>案件编号</label>
                  <div class="detail-field__value">{{ c.caseNumber || '待生成' }}</div>
                </div>
                <div class="detail-field">
                  <label>执照名称</label>
                  <input v-model="c.licenseName" @change="saveField('licenseName', c.licenseName)" type="text" class="detail-field__input" placeholder="营业执照上的名称" />
                </div>
                <div class="detail-field">
                  <label>店铺名称</label>
                  <input v-model="c.shopName" @change="saveField('shopName', c.shopName)" type="text" class="detail-field__input" placeholder="例：xxx旗舰店" />
                </div>
                <div class="detail-field">
                  <label>商品名称 / 涉案事项</label>
                  <input v-model="c.productName" @change="saveField('productName', c.productName)" type="text" class="detail-field__input" placeholder="例：美白祛斑面膜" />
                </div>
                <div class="detail-field">
                  <label>管辖局</label>
                  <input v-model="c.jurisdiction" @change="saveField('jurisdiction', c.jurisdiction)" type="text" class="detail-field__input" placeholder="例：市场监督管理局" />
                </div>
                <div class="detail-field">
                  <label>快递单号</label>
                  <input v-model="c.trackingNumber" @change="saveField('trackingNumber', c.trackingNumber)" type="text" class="detail-field__input" placeholder="有单号时可直接录入" />
                </div>
                <div class="detail-field">
                  <label>签收日期</label>
                  <input v-model="c.signDate" @change="saveSignDate(c.signDate)" type="date" class="detail-field__input" />
                </div>
                <div class="detail-field detail-field--full">
                  <label>备注</label>
                  <textarea v-model="c.notes" @change="saveField('notes', c.notes)" class="detail-field__textarea" placeholder="补充识别来源、店铺别名、案件说明等"></textarea>
                </div>
              </div>
            </section>
          </div>

          <div class="detail-lower-grid">
            <section class="detail-section detail-saas-card">
              <div class="detail-section__head">
                <div>
                  <h3 class="detail-section-title">流程状态摘要</h3>
                  <p class="detail-section-desc">这里只展示摘要和入口，完整编辑仍然只在“变更状态”弹窗中处理。</p>
                </div>
                <button @click="openStatusModal" class="detail-btn detail-btn-primary">变更状态</button>
              </div>

              <div class="detail-flow-grid">
                <div class="detail-panel detail-panel-compact">
                  <div class="detail-panel-label">受理状态 + 日期</div>
                  <div class="detail-panel-value">{{ c.acceptanceStatus ? statusLabel(c.acceptanceStatus) : '未填写' }}</div>
                  <div class="detail-panel-sub">{{ c.acceptanceDate || '日期未填写' }}</div>
                </div>
                <div class="detail-panel detail-panel-compact">
                  <div class="detail-panel-label">投诉跟进 + 日期</div>
                  <div class="detail-panel-value">{{ c.mediationStatus ? statusLabel(c.mediationStatus) : '未填写' }}</div>
                  <div class="detail-panel-sub">{{ c.mediationDate || '日期未填写' }}</div>
                </div>
                <div class="detail-panel detail-panel-compact">
                  <div class="detail-panel-label">举报结果 + 日期</div>
                  <div class="detail-panel-value">{{ c.reportResultStatus ? statusLabel(c.reportResultStatus) : '未填写' }}</div>
                  <div class="detail-panel-sub">{{ c.reportResultDate || '日期未填写' }}</div>
                </div>
                <div class="detail-panel detail-panel-compact">
                  <div class="detail-panel-label">旧规 / 新规</div>
                  <div class="detail-panel-value">{{ c.procedureVersion === 'old' ? '旧规案件' : '新规案件' }}</div>
                </div>
                <div class="detail-panel detail-panel-compact detail-panel-span-2">
                  <div class="detail-panel-label">旧规立案状态 + 日期</div>
                  <div class="detail-panel-value">{{ c.filingStatus ? filingStatusLabel(c.filingStatus) : '未填写' }}</div>
                  <div class="detail-panel-sub">{{ c.filingDate || c.filingNoticeDate || '日期未填写' }}</div>
                </div>
              </div>
            </section>

            <div class="detail-side-stack">
              <section class="detail-section detail-saas-card">
                <div class="detail-section__head">
                  <div>
                    <h3 class="detail-section-title">财务信息</h3>
                    <p class="detail-section-desc">压缩成小卡片，只保留商品价格和花费总额。</p>
                  </div>
                  <span class="detail-chip-muted">简版</span>
                </div>
                <div class="detail-finance-grid">
                  <div class="detail-panel detail-panel-compact">
                    <div class="detail-panel-label">商品价格（元）</div>
                    <div class="detail-finance-value">{{ formatCurrency(c.productPrice) }}</div>
                  </div>
                  <div class="detail-panel detail-panel-compact">
                    <div class="detail-panel-label">花费总额（元）</div>
                    <div class="detail-finance-value">{{ formatCurrency(c.expense) }}</div>
                  </div>
                </div>
              </section>

              <section class="detail-section detail-saas-card">
                <div class="detail-section__head">
                  <div>
                    <h3 class="detail-section-title">填写提醒</h3>
                  </div>
                </div>
                <div class="detail-reminders">
                  <div v-for="(item, idx) in filingReminders" :key="`reminder-${idx}`" class="detail-reminder-item">
                    <span class="detail-reminder-dot" :class="item.done ? 'detail-reminder-dot-ok' : 'detail-reminder-dot-warn'"></span>
                    <span>{{ item.text }}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <section ref="disposalSectionRef" class="detail-section detail-disposal-section detail-saas-card">
            <div class="detail-section__head">
              <div>
                <h3 class="detail-section-title">后续处置 / 救济监督</h3>
                <p class="detail-section-desc">全宽展示程序类型，新增/编辑表单和已保存记录，维护字段精简，便于持续追踪。</p>
              </div>
              <span class="detail-chip-muted">已记录 {{ disposalRecords.length }} 条</span>
            </div>

            <div class="detail-type-grid">
              <template v-for="group in disposalTypeGroups" :key="group.name">
                <button
                  v-for="item in group.items"
                  :key="item"
                  type="button"
                  class="detail-type-pill"
                  :class="disposalDraft.disposalType === item ? 'detail-type-pill-active' : ''"
                  @click="openNewDisposalForm(item)"
                >
                  {{ item }}
                </button>
              </template>
            </div>

            <div v-if="hasLegacyAdminReview" class="detail-legacy-bar">
              <span v-for="item in legacyAdminReviewFields" :key="item.label">{{ item.label }}：{{ item.value || '未填写' }}</span>
            </div>

            <div class="detail-disposal-form-wrap">
              <div class="detail-disposal-form-head">
                <div>
                  <div class="detail-disposal-form-title">{{ editingDisposalId ? '编辑后续处置记录' : '新增后续处置记录' }}</div>
                  <div class="detail-disposal-form-subtitle">保存、编辑、删除仍沿用现有记录逻辑，只调整布局表现。</div>
                </div>
                <button type="button" class="detail-form-link" @click="resetDisposalDraft()">清空表单</button>
              </div>
              <div v-if="showDisposalForm" class="detail-form-grid">
                <div>
                  <label class="label">处置类型</label>
                  <select v-model="disposalDraft.disposalType" class="input-field" @change="selectDisposalType(disposalDraft.disposalType)">
                    <option value="">请选择</option>
                    <optgroup v-for="group in disposalTypeGroups" :key="group.name" :label="group.name">
                      <option v-for="item in group.items" :key="item" :value="item">{{ item }}</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label class="label">提交机关 / 部门</label>
                  <input v-model="disposalDraft.targetOrgan" type="text" class="input-field" placeholder="根据处置类型自动带出，可手动修改" />
                </div>
                <div>
                  <label class="label">卷件单号</label>
                  <input v-model="disposalDraft.mailTrackingNo" type="text" class="input-field" placeholder="如有可填写" />
                </div>
                <div>
                  <label class="label">签收日期</label>
                  <input v-model="disposalDraft.mailSignedDate" type="date" class="input-field" />
                </div>
                <div>
                  <label class="label">受理日期</label>
                  <input v-model="disposalDraft.acceptDate" type="date" class="input-field" />
                </div>
                <div>
                  <label class="label">办理状态</label>
                  <select v-model="disposalDraft.status" class="input-field">
                    <option value="">请选择</option>
                    <option v-for="s in disposalStatusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
                  </select>
                </div>
                <div>
                  <label class="label">截止日期</label>
                  <input v-model="disposalDraft.deadlineDate" type="date" class="input-field" />
                </div>
                <div class="full-width">
                  <label class="label">结果说明 / 备注</label>
                  <textarea v-model="disposalDraft.note" rows="3" class="input-field min-h-[88px]" placeholder="简要记录结果说明、备注和跟进情况"></textarea>
                </div>
                <div class="full-width detail-form-actions">
                  <button type="button" class="detail-btn detail-btn-primary detail-btn-inline" @click="saveDisposal()">保存处置记录</button>
                  <button type="button" class="detail-btn detail-btn-inline" @click="resetDisposalDraft()">取消</button>
                </div>
              </div>
              <div v-else class="detail-record-empty">
                先选择上方处置类型，或点击右侧、列表中的入口开始新增记录。
              </div>
            </div>

            <div class="detail-record-block">
              <div class="detail-record-block__head">
                <div class="text-sm font-semibold text-slate-800 dark:text-slate-100">后续处置记录</div>
                <button type="button" class="text-xs text-slate-500 hover:text-blue-600" @click="openNewDisposalForm()">新增一条</button>
              </div>
              <div v-if="disposalRecords.length" class="mt-3 space-y-3">
                <div v-for="item in disposalRecords" :key="item.id" class="detail-record-card">
                  <div class="min-w-0">
                    <div class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ item.disposalType || '未命名处置' }}</div>
                    <div class="mt-2 space-y-1 text-xs leading-5 text-slate-500 dark:text-slate-400 dark:text-slate-500">
                      <div v-if="item.targetOrgan">提交机关：{{ item.targetOrgan }}</div>
                      <div v-if="item.submitDate">提交日期：{{ item.submitDate }}</div>
                      <div v-if="item.status">办理状态：{{ item.status }}</div>
                    </div>
                  </div>
                  <div class="min-w-0 text-xs leading-5 text-slate-500 dark:text-slate-400 dark:text-slate-500">
                    <div v-if="item.acceptDate">受理日期：{{ item.acceptDate }}</div>
                    <div v-if="item.deadlineDate">截止日期：{{ item.deadlineDate }}</div>
                    <div v-if="item.resultSummary" class="mt-2">结果摘要：{{ item.resultSummary }}</div>
                    <div v-if="item.note" class="mt-2 whitespace-pre-line">备注：{{ item.note }}</div>
                  </div>
                  <div class="detail-record-actions">
                    <button type="button" class="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:border-blue-300 hover:text-blue-600" @click="editDisposal(item)">编辑</button>
                    <button type="button" class="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:border-blue-300 hover:text-blue-600" @click="copyDisposal(item)">复制</button>
                    <button type="button" class="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50" @click="deleteDisposal(item)">删除</button>
                  </div>
                </div>
              </div>
              <div v-else class="detail-record-empty">
                开始新增你的第一条后续处置记录，形成案件救济链路。
              </div>
            </div>
          </section>
        </div>

        <aside class="detail-action-panel detail-saas-card">
          <div class="detail-action-title">处置操作</div>
          <button @click="openStatusModal" class="detail-btn detail-btn-primary">变更状态</button>
          <button @click="openReplyModal" class="detail-btn">添加答复</button>
          <button @click="openDocModal" class="detail-btn">上传文书</button>
          <button @click="() => { if (openAINextStepDrawer) openAINextStepDrawer({ source: 'case-detail', caseNumber: c.caseNumber || '待生成', status: statusLabel(effectiveStatus), originalResult: c.reportResultStatus ? statusLabel(c.reportResultStatus) : '未登记', resultDate: c.reportResultDate || '-', currentReliefStatus: disposalRecords.length ? '已建立后续处置记录' : '未建立救济记录', relatedPathCount: disposalRecords.length, deadlineRisk: keyRiskSummary.title + '，' + keyRiskSummary.detail, priorityActions: ['准备行政复议', '建议优先级：高'], basis: ['已登记不利处理结果', '当前仍在可救济期限内', '建议优先准备复议材料'] }); else console.warn('openAINextStepDrawer not provided') }" class="detail-btn">AI分析下一步</button>
          <button @click="downloadCaseSummary" class="detail-btn">导出卷宗摘要</button>
          <button @click="printCaseDossier" class="detail-btn">打印卷宗</button>
          <button @click="confirmDelete" class="detail-btn detail-btn-danger">删除案件</button>
          <div class="detail-action-meta">
            创建于 {{ formatDate(c.createdAt) }}<br />
            更新于 {{ formatDate(c.updatedAt) }}
          </div>
        </aside>
      </div>
    </template>

    <template v-else-if="activeDetailTab === 'timeline'">
      <DeadlinePanel :case-obj="caseData" @update="loadCase" @open-disposal="handleOpenDisposal" />

      <div class="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <section class="detail-section detail-saas-card">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 class="detail-section-title mb-1">流程时间轴</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">把建档、寄件、签收、受理、答复、结果、复议串成一条卷宗主线。</p>
            </div>
            <span class="detail-tag">已完成 {{ timelineSummary.doneCount }}/{{ timelineSummary.total }}</span>
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
          <section class="detail-section detail-saas-card">
            <h3 class="detail-section-title">流程摘要</h3>
            <div class="space-y-3">
              <div class="detail-panel">
                <div class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">当前推进到</div>
                <div class="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-100">{{ timelineSummary.currentTitle }}</div>
              </div>
              <div class="detail-panel">
                <div class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">下一步建议补齐</div>
                <div class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ timelineSummary.pendingText }}</div>
              </div>
              <div class="detail-panel">
                <div class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">当前状态</div>
                <div class="mt-2"><StatusBadge :status="effectiveStatus" :profit="c.profit" /></div>
              </div>
            </div>
          </section>

          <section class="card">
            <div class="flex items-center justify-between gap-3 mb-4">
              <h3 class="detail-section-title mb-0">
                <span>💬</span>
                <span>流程答复记录</span>
              </h3>
              <button @click="openReplyModal" class="btn-secondary">新增答复</button>
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
      <section class="detail-section detail-saas-card">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 class="detail-section-title mb-1 detail-inline-title">
              <span>📁</span>
              <span>材料中心</span>
            </h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">把信封图片、官方答复、处罚决定、复议材料分开管理，卷宗会更清晰。</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button @click="openDocModal" class="btn-primary">新增文书</button>
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
                    <span v-if="item.type === 'document'" class="detail-tag">{{ getDocumentCategoryLabel(item.category) }}</span>
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
                <span class="detail-tag">{{ group.items.length }} 项</span>
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


    <div v-if="showStatusModal" class="modal-mask" @click.self="closeStatusModal">
      <div class="case-modal">
        <div class="case-modal-header">
          <span class="case-modal-title">变更案件状态</span>
          <button class="case-modal-close" @click="openStatusModal">×</button>
        </div>
        <div class="case-modal-body">
          <div class="case-modal-section">
            <div class="case-modal-section-title">适用规则版本</div>
            <div class="status-choice-row">
              <button
                v-for="s in procedureVersionOptions"
                :key="s.value"
                @click="saveProcedureVersion(s.value)"
                class="status-choice"
                :class="c.procedureVersion === s.value ? 'active' : ''"
              ><span>{{ s.label }}</span></button>
            </div>
          </div>

          <div class="case-modal-section">
            <div class="case-modal-section-title">① 受理状态</div>
            <div class="status-choice-row">
              <button
                v-for="s in acceptanceOptions"
                :key="s.value"
                @click="changeAcceptanceStatus(s.value)"
                class="status-choice"
                :class="c.acceptanceStatus === s.value ? 'active' : ''"
              ><span>{{ s.icon }}</span><span>{{ s.label }}</span></button>
            </div>
            <div class="case-form-field" style="margin-top:10px">
              <label>{{ c.acceptanceStatus === 'reported' ? '不予受理日期' : '受理日期' }}</label>
              <input :value="c.acceptanceDate || ''" @change="saveAcceptanceDate($event.target.value)" type="date" style="width:100%;min-height:36px;border:1px solid #d1d5db;border-radius:6px;padding:8px 10px;font-size:14px;background:#fff;color:#111827" />
            </div>
          </div>

          <div class="case-modal-section">
            <div class="case-modal-section-title">② 投诉跟进</div>
            <div class="status-choice-row">
              <button
                v-for="s in mediationOptions"
                :key="s.value"
                @click="changeMediationStatus(s.value)"
                class="status-choice"
                :class="c.mediationStatus === s.value ? 'active' : ''"
              ><span>{{ s.icon }}</span><span>{{ s.label }}</span></button>
            </div>
            <div class="case-form-field" style="margin-top:10px">
              <label>{{ c.mediationStatus === 'mediation_terminated' ? '终止调解日期' : '调解日期' }}</label>
              <input :value="c.mediationDate || ''" @change="saveMediationDate($event.target.value)" type="date" style="width:100%;min-height:36px;border:1px solid #d1d5db;border-radius:6px;padding:8px 10px;font-size:14px;background:#fff;color:#111827" />
            </div>
            <div v-if="c.mediationStatus === 'decided'" style="margin-top:10px">
              <label style="display:block;margin-bottom:6px;font-size:13px;color:#374151;font-weight:500">赔偿金额（元）</label>
              <div class="status-choice-row">
                <button
                  v-for="amount in compensationPresets"
                  :key="amount"
                  type="button"
                  @click="saveProfit(amount)"
                  class="status-choice"
                  :class="Number(c.profit || 0) === amount ? 'active' : ''"
                >{{ amount }}</button>
              </div>
              <input :value="c.profit ?? ''" @change="saveProfit($event.target.value)" type="number" step="0.01" style="width:100%;min-height:36px;border:1px solid #d1d5db;border-radius:6px;padding:8px 10px;font-size:14px;background:#fff;color:#111827;margin-top:8px" placeholder="已调解后填写赔偿金额" />
            </div>
          </div>

          <div class="case-modal-section">
            <div class="case-modal-section-title">③ 举报结果</div>
            <div class="status-choice-row">
              <button
                v-for="s in reportResultOptions"
                :key="s.value"
                @click="changeReportResultStatus(s.value)"
                class="status-choice"
                :class="c.reportResultStatus === s.value ? 'active' : ''"
              ><span>{{ s.icon }}</span><span>{{ s.label }}</span></button>
              <button
                v-if="c.procedureVersion === 'old'"
                v-for="s in filingQuickOptions"
                :key="s.value"
                @click="changeFilingQuickStatus(s.value)"
                class="status-choice"
                :class="c.filingStatus === s.value ? 'active' : ''"
              ><span>{{ s.icon }}</span><span>{{ s.label }}</span></button>
            </div>
            <div class="case-form-field" style="margin-top:10px">
              <label>{{ reportDateLabel }}</label>
              <input
                v-if="c.procedureVersion === 'old' && c.filingStatus === 'filed' && !c.reportResultStatus"
                :value="c.filingDate || ''"
                @change="saveFilingDate($event.target.value)"
                type="date"
                style="width:100%;min-height:36px;border:1px solid #d1d5db;border-radius:6px;padding:8px 10px;font-size:14px;background:#fff;color:#111827"
              />
              <input
                v-else
                :value="c.reportResultDate || ''"
                @change="saveReportResultDate($event.target.value)"
                type="date"
                style="width:100%;min-height:36px;border:1px solid #d1d5db;border-radius:6px;padding:8px 10px;font-size:14px;background:#fff;color:#111827"
              />
            </div>
          </div>
        </div>
        <div class="case-modal-footer">
          <button @click="closeStatusModal" class="btn-secondary">取消</button>
        </div>
      </div>
    </div>

    <div v-if="showReplyModal" class="modal-mask" @click.self="closeReplyModal">
      <div class="case-modal" style="width:480px">
        <div class="case-modal-header">
          <span class="case-modal-title">添加答复记录</span>
          <button class="case-modal-close" @click="openReplyModal">×</button>
        </div>
        <div class="case-modal-body">
          <div class="case-form-grid">
            <div class="case-form-field">
              <label>日期</label>
              <input v-model="replyForm.date" type="date" style="width:100%;min-height:36px;border:1px solid #d1d5db;border-radius:6px;padding:8px 10px;font-size:14px;background:#fff;color:#111827" />
            </div>
          </div>
          <div class="case-form-field full" style="margin-top:14px">
            <label>答复内容</label>
            <textarea v-model="replyForm.content" style="width:100%;min-height:96px;border:1px solid #d1d5db;border-radius:6px;padding:8px 10px;font-size:14px;background:#fff;color:#111827;resize:vertical" placeholder="官方答复内容..."></textarea>
          </div>
        </div>
        <div class="case-modal-footer">
          <button @click="closeReplyModal" class="btn-secondary">取消</button>
          <button @click="submitReply" class="btn-primary">保存</button>
        </div>
      </div>
    </div>

    <div v-if="showDocModal" class="modal-mask" @click.self="closeDocModal">
      <div class="case-modal" style="width:520px">
        <div class="case-modal-header">
          <span class="case-modal-title">新增文书材料</span>
          <button class="case-modal-close" @click="openDocModal">×</button>
        </div>
        <div class="case-modal-body">
          <div class="case-form-grid">
            <div class="case-form-field">
              <label>文件名</label>
              <input v-model="docForm.name" type="text" style="width:100%;min-height:36px;border:1px solid #d1d5db;border-radius:6px;padding:8px 10px;font-size:14px;background:#fff;color:#111827" placeholder="例：处罚决定书.pdf" />
            </div>
            <div class="case-form-field">
              <label>文书分类</label>
              <select v-model="docForm.category" style="width:100%;min-height:36px;border:1px solid #d1d5db;border-radius:6px;padding:8px 10px;font-size:14px;background:#fff;color:#111827">
                <option v-for="option in documentCategoryOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
            </div>
            <div class="case-form-field full">
              <label>本地上传文件</label>
              <input ref="docFileInputRef" type="file" accept="image/*,.pdf,.doc,.docx" multiple style="width:100%;min-height:36px;border:1px solid #d1d5db;border-radius:6px;padding:6px 10px;font-size:14px;background:#fff;color:#111827" @change="handleDocFileChange" />
              <div style="margin-top:4px;font-size:12px;color:#6b7280">{{ selectedDocFiles.length ? (selectedDocFiles.length === 1 ? `已选择：${selectedDocFiles[0].name}` : `已选择 ${selectedDocFiles.length} 个文件`) : '支持图片、信封图片、Word、PDF' }}</div>
            </div>
            <div class="case-form-field full">
              <label>材料备注</label>
              <textarea v-model="docForm.note" style="width:100%;min-height:72px;border:1px solid #d1d5db;border-radius:6px;padding:8px 10px;font-size:14px;background:#fff;color:#111827;resize:vertical" placeholder="补充这份材料的用途、来源或处理说明"></textarea>
            </div>
          </div>
        </div>
        <div class="case-modal-footer">
          <button @click="closeDocModal" class="btn-secondary">取消</button>
          <button @click="submitDoc" :disabled="docUploading" class="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">{{ docUploading ? '上传中...' : '保存' }}</button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="rounded-2xl border border-slate-100 bg-white dark:bg-slate-900 py-32 text-center shadow-sm">
    <span class="text-8xl">🔍</span>
    <p class="mt-4 mb-6 text-xl text-slate-400 dark:text-slate-500">案件不存在</p>
    <router-link to="/cases" class="btn-primary inline-flex items-center gap-2">返回列表</router-link>
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
import { inject, ref, computed, watch, onMounted, nextTick } from 'vue'
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
const openAINextStepDrawer = inject('openAINextStepDrawer', null)

const showStatusModal = ref(false)
const showReplyModal = ref(false)
const showDocModal = ref(false)

function openStatusModal() { showStatusModal.value = true; showReplyModal.value = false; showDocModal.value = false }
function openReplyModal() { showStatusModal.value = false; showReplyModal.value = true; showDocModal.value = false }
function openDocModal() { showStatusModal.value = false; showReplyModal.value = false; showDocModal.value = true }
function closeStatusModal() { showStatusModal.value = false }
function closeReplyModal() { showReplyModal.value = false }
function closeDocModal() { showDocModal.value = false }
const activeDetailTab = ref('info')
const disposalTabSelected = ref(false)
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
const disposalSectionRef = ref(null)
const editingDisposalId = ref('')
const relatedMaterialsText = ref('')
const disposalContext = ref(null)
const disposalTypeGroups = [
  { name: '法定救济', items: ['行政复议', '行政诉讼', '政府信息公开'] },
  { name: '监督督办', items: ['上级主管机关反映', '行政执法监督', '政府督查', '人大监督', '人大代表建议 / 反映渠道', '政协民主监督 / 委员反映渠道'] },
  { name: '问责线索', items: ['纪检监察举报', '派驻纪检监察组反映'] },
  { name: '检察监督', items: ['检察监督', '行政公益诉讼线索', '行政诉讼监督'] },
  { name: '信访协调', items: ['信访', '12345 政务服务热线', '领导信箱', '政府网站留言'] },
  { name: '其他', items: ['其他监督 / 救济路径'] },
]
const deadlineBasisOptions = [
  { value: 'petition_60', label: '信访事项60日' },
  { value: 'gov_info_20wd', label: '政府信息公开20个工作日' },
  { value: 'admin_review_apply_60', label: '行政复议申请期限60日' },
  { value: 'admin_review_handle_60', label: '行政复议办理期限60日' },
  { value: 'law_enforcement_supervision_60_90', label: '行政执法监督60/90日' },
  { value: 'discipline_inspection_3m', label: '纪检监察交办件3个月' },
  { value: 'gov_inspection_specified', label: '政府督查/督办指定期限' },
  { value: 'npc_petition_60', label: '人大信访60日' },
  { value: 'npc_deputy_suggestion_3m', label: '人大代表建议3个月' },
  { value: 'custom_followup', label: '人工跟进提醒' },
]

const disposalStatusOptions = [
  { value: '拟提交', label: '拟提交' },
  { value: '已寄出', label: '已寄出' },
  { value: '已签收', label: '已签收' },
  { value: '已受理', label: '已受理' },
  { value: '办理中', label: '办理中' },
  { value: '已办结', label: '已办结' },
  { value: '已反馈', label: '已反馈' },
  { value: '已退回', label: '已退回' },
  { value: '已撤回', label: '已撤回' },
  { value: '已超期', label: '已超期' },
]

// 提取行政区划名称：运城市市场监督管理局 → 运城市
function extractRegionName(jurisdiction = '') {
  const match = String(jurisdiction).match(/^(.+?(?:市|区|县|旗))/)
  return match ? match[1] : ''
}

// 根据处置类型和管辖局获取默认提交机关
function getDefaultOrgan(disposalType, jurisdiction) {
  const region = extractRegionName(jurisdiction)
  const map = {
    '行政复议': region ? `${region}人民政府` : '有管辖权的复议机关',
    '政府信息公开': jurisdiction || '',
    '行政执法监督': region ? `${region}司法局 / 行政执法监督机构` : '有管辖权的司法行政机关',
    '政府督查': region ? `${region}人民政府办公室督查室` : '有管辖权的政府督查机构',
    '人大监督': region ? `${region}人大常委会 / 人大信访渠道` : '有管辖权的人大常委会',
    '人大代表建议 / 反映渠道': region ? `${region}人大常委会 / 人大代表联络渠道` : '有管辖权的人大代表联络机构',
    '政协民主监督 / 委员反映渠道': region ? `${region}政协 / 政协委员反映渠道` : '有管辖权的政协渠道',
    '纪检监察举报': region ? `${region}纪委监委 / 派驻纪检监察组` : '有管辖权的纪检监察机关',
    '派驻纪检监察组反映': region ? `派驻市场监管部门纪检监察组` : '派驻纪检监察组',
    '信访': region ? `${region}信访局` : '有管辖权的信访局',
    '12345 政务服务热线': '12345 政务服务热线',
    '领导信箱': region ? `${region}人民政府领导信箱` : '有管辖权的政府领导信箱',
    '政府网站留言': region ? `${region}人民政府网站留言` : '有管辖权的政府网站',
    '检察监督': region ? `${region}人民检察院 / 12309 检察服务中心` : '有管辖权的人民检察院',
    '行政公益诉讼线索': region ? `${region}人民检察院 / 公益诉讼部门` : '有管辖权的检察院公益诉讼部门',
    '行政诉讼监督': region ? `${region}人民检察院` : '有管辖权的检察院',
    '上级主管机关反映': jurisdiction || '',
    '行政诉讼': '有管辖权的人民法院',
    '其他监督 / 救济路径': '',
  }
  return map[disposalType] || ''
}

const showDisposalForm = ref(false)
const showDisposalMore = ref(false)

// 管辖局 computed
const disposalJurisdiction = computed(() => c.value?.jurisdiction || '')

function createEmptyDisposalDraft() {
  return {
    disposalType: '',
    targetOrgan: '',
    submitDate: dayjs().format('YYYY-MM-DD'),
    status: '拟提交',
    resultDate: '',
    resultSummary: '',
    // 内部标记，不写入 disposals
    statusTouched: false,
    targetOrganTouched: false,
    note: '',
    reviewStartDate: '',
    reviewDeadline60: '',
    reviewLongStopDate: '',
    reviewStatusText: '',
    deadlineBasis: '',
    acceptDate: '',
    mailSignedDate: '',
    deadlineDate: '',
    followUpDate: '',
    deadlineNote: '',
    mailTrackingNo: '',
    mailSentDate: '',
    deliveryStatus: '',
  }
}

const disposalDraft = ref(createEmptyDisposalDraft())
const caseData = computed(() => store.getCase(route.params.id))
const disposalRecords = computed(() => Array.isArray(c.value?.disposals) ? c.value.disposals : [])
const hasLegacyAdminReview = computed(() => Boolean(
  c.value?.hasAdminReview === 'yes'
  || c.value?.adminReviewResult
  || c.value?.adminReviewApplyDate
  || c.value?.adminReviewAuthority
  || c.value?.adminReviewAcceptDate
  || c.value?.adminReviewDecisionDate
  || c.value?.adminReviewDocNo,
))
const legacyAdminReviewFields = computed(() => ([
  { label: '是否申请复议', value: c.value?.hasAdminReview === 'yes' ? '是' : c.value?.hasAdminReview === 'no' ? '否' : '' },
  { label: '复议结果', value: c.value?.adminReviewResult || '' },
  { label: '复议机关', value: c.value?.adminReviewAuthority || '' },
  { label: '复议申请日期', value: c.value?.adminReviewApplyDate || '' },
  { label: '复议受理日期', value: c.value?.adminReviewAcceptDate || '' },
  { label: '复议决定日期', value: c.value?.adminReviewDecisionDate || '' },
  { label: '复议决定书编号', value: c.value?.adminReviewDocNo || '' },
]).filter(item => item.value))
const disposalContextLines = computed(() => {
  const ctx = disposalContext.value || {}
  return [
    ctx.caseNumber ? `案件编号：${ctx.caseNumber}` : '',
    ctx.jurisdiction ? `管辖局：${ctx.jurisdiction}` : '',
    ctx.reportResultLabel ? `举报结果：${ctx.reportResultLabel}` : '',
    ctx.reportResultDate ? `举报结果日期：${ctx.reportResultDate}` : '',
    ctx.reviewDeadline60 ? `60 日复议截止日：${ctx.reviewDeadline60}` : '',
    ctx.reviewLongStopDate ? `一年保护期日期：${ctx.reviewLongStopDate}` : '',
    ctx.reviewStatusText ? `当前期限状态：${ctx.reviewStatusText}` : '',
    ctx.acceptanceDate ? `受理日期：${ctx.acceptanceDate}` : '',
    ctx.mediationDeadline ? `调解截止日：${ctx.mediationDeadline}` : '',
    ctx.mediationOverdueText ? `超期状态：${ctx.mediationOverdueText}` : '',
    ctx.mediationRiskHint ? `风险提示：${ctx.mediationRiskHint}` : '',
  ].filter(Boolean)
})

const detailTabs = [
  { value: 'info', label: '案件信息' },
  { value: 'timeline', label: '流程时间轴' },
  { value: 'materials', label: '案件材料' },
  { value: 'disposal', label: '后续处置' },
]

const detailMetricIcons = {
  status: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
  price: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  expense: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/></svg>`,
  compensation: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
}

onMounted(() => {
  c.value = caseData.value
})

// ---------- 办理状态自动联动 ----------
watch(() => disposalDraft.value.mailTrackingNo, (val) => {
  if (val && !disposalDraft.value.statusTouched) {
    const s = disposalDraft.value.status || ''
    if (['', '拟提交'].includes(s)) {
      disposalDraft.value.status = '已寄出'
    }
  }
})

watch(() => disposalDraft.value.mailSignedDate, (val) => {
  if (val && !disposalDraft.value.statusTouched) {
    const s = disposalDraft.value.status || ''
    if (['', '拟提交', '已寄出'].includes(s)) {
      disposalDraft.value.status = '已签收'
    }
  }
})

watch(() => disposalDraft.value.acceptDate, (val) => {
  if (val && !disposalDraft.value.statusTouched) {
    const s = disposalDraft.value.status || ''
    if (['', '拟提交', '已寄出', '已签收'].includes(s)) {
      disposalDraft.value.status = '已受理'
    }
  }
})

watch([() => disposalDraft.value.resultDate, () => disposalDraft.value.resultSummary], ([resultDate, resultSummary]) => {
  if (!disposalDraft.value.statusTouched && (resultDate || resultSummary)) {
    const s = disposalDraft.value.status || ''
    if (!['已办结', '已反馈', '已退回', '已撤回'].includes(s)) {
      disposalDraft.value.status = '已办结'
    }
  }
})

// 用户手动填写 targetOrgan 时标记为已手动修改
watch(() => disposalDraft.value.targetOrgan, (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    disposalDraft.value.targetOrganTouched = true
  }
})

watch(caseData, (newVal) => {
  if (newVal) {
    c.value = newVal
  }
}, { immediate: true })

watch(() => route.params.id, () => {
  loadCase()
  activeDetailTab.value = 'info'
  disposalTabSelected.value = false
  resetDisposalDraft()
})

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
  if (cv.procedureVersion === 'old' && cv.filingStatus === 'filed' && !cv.reportResultStatus) return 'filed'
  if (cv.acceptanceStatus) return cv.acceptanceStatus
  if (cv.mediationStatus === 'mediation_terminated') return 'mediation_terminated'
  return cv.status || 'pending_report'
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

const keyRiskSummary = computed(() => {
  const cv = c.value || {}
  if (['rejected', 'exempted'].includes(cv.reportResultStatus) && cv.reportResultDate) {
    const deadline60 = dayjs(cv.reportResultDate).add(60, 'day')
    const daysLeft = deadline60.diff(dayjs(), 'day')
    return {
      title: daysLeft >= 0 ? `复议期限${daysLeft === 0 ? '今日到期' : `剩余 ${daysLeft} 天`}` : `复议期限已超期 ${Math.abs(daysLeft)} 天`,
      detail: `结果日期：${cv.reportResultDate}，60 日节点：${deadline60.format('YYYY-MM-DD')}`,
    }
  }
  if (cv.acceptanceStatus === 'accepted' && cv.acceptanceDate && !cv.mediationStatus) {
    const isOld = cv.procedureVersion === 'old'
    const deadline = isOld ? addWorkdayForDetail(cv.acceptanceDate, 45) : dayjs(cv.acceptanceDate).add(60, 'day')
    const daysLeft = deadline.diff(dayjs(), 'day')
    return {
      title: isOld ? '关注调解 45 个工作日' : '关注调解 60 日时限',
      detail: `截止：${deadline.format('YYYY-MM-DD')}，${daysLeft >= 0 ? `剩余 ${daysLeft} 天` : `已超期 ${Math.abs(daysLeft)} 天`}`,
    }
  }
  return {
    title: '当前暂无高优先级风险',
    detail: '关键期限会随受理、调解、举报结果自动变化，这里只做摘要提示。',
  }
})

function statusToneClass(status) {
  if (['rejected', 'reported', 'exempted', 'mediation_terminated'].includes(status)) return 'detail-pill-danger'
  if (status === 'filed') return 'detail-pill-info'
  if (['closed', 'decided'].includes(status)) return 'detail-pill-success'
  return 'detail-pill-neutral'
}

function selectDetailTab(tab) {
  disposalTabSelected.value = tab === 'disposal'
  if (tab === 'disposal') {
    activeDetailTab.value = 'info'
    nextTick(() => {
      disposalSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return
  }
  activeDetailTab.value = tab
}

const filingReminders = computed(() => {
  const cv = c.value || {}
  const hasReviewDisposal = disposalRecords.value.some(item => item.disposalType === '行政复议')
  return [
    {
      done: Boolean(cv.trackingNumber),
      text: cv.trackingNumber ? '快递单号已填写，后续核验签收会更顺。' : '快递单号还未填写，建议补齐。',
    },
    {
      done: Boolean(cv.signDate),
      text: cv.signDate ? '签收日期已填写。' : '签收日期还未填写，后续期限判断会少一个基准点。',
    },
    {
      done: cv.procedureVersion !== 'old' || Boolean(cv.filingDate),
      text: cv.procedureVersion === 'old'
        ? (cv.filingDate ? '旧规案件立案日期已填写。' : '旧规案件建议补齐立案日期。')
        : '当前为新规案件，无需补旧规立案日期。',
    },
    {
      done: cv.mediationStatus !== 'decided' || Boolean(cv.profit),
      text: cv.mediationStatus === 'decided'
        ? (cv.profit ? '已调解案件赔偿金额已填写。' : '已调解案件建议补齐赔偿金额。')
        : '当前不是已调解案件，无需填写赔偿金额。',
    },
    {
      done: !['rejected', 'exempted'].includes(cv.reportResultStatus) || hasReviewDisposal,
      text: ['rejected', 'exempted'].includes(cv.reportResultStatus)
        ? (hasReviewDisposal ? '可复议案件已建立后续处置记录。' : '可复议案件建议建立后续处置记录。')
        : '当前案件暂不属于默认可复议提醒范围。',
    },
  ]
})

const acceptanceOptions = [
  { value: 'accepted', label: '已受理', icon: '✅' },
  { value: 'reported', label: '不予受理', icon: '📝' },
]

const mediationOptions = [
  { value: 'decided', label: '已调解', icon: '🤝' },
  { value: 'mediation_terminated', label: '终止调解', icon: '✖️' },
]

const filingQuickOptions = [
  { value: 'filed', label: '已立案', icon: '📋' },
]

// 举报结果区域日期框 label：已立案时显示“立案日期”，其他显示“举报结果日期”
const reportDateLabel = computed(() => {
  const cv = c.value || {}
  if (cv.procedureVersion === 'old' && cv.filingStatus === 'filed' && !cv.reportResultStatus) {
    return '立案日期'
  }
  return '举报结果日期'
})

const reportResultOptions = [
  { value: 'closed', label: '已处罚', icon: '⚖️' },
  { value: 'rejected', label: '不予立案', icon: '❌' },
  { value: 'not_punished', label: '责令改正', icon: '🚫' },
  { value: 'exempted', label: '不予处罚', icon: '🚫' },
]

const statusLabels = {
  pending_report: '未受理',
  accepted: '已受理',
  reported: '不予受理',
  decided: '已调解',
  closed: '已处罚',
  rejected: '不予立案',
  not_punished: '责令改正',
  exempted: '不予处罚',
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
  const latestDisposal = Array.isArray(c.value.disposals) && c.value.disposals.length > 0
    ? [...c.value.disposals].sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))[0]
    : null
  const hasAdminReviewProgress = Boolean(latestDisposal || c.value.adminReviewApplyDate || c.value.adminReviewAcceptDate || c.value.adminReviewDecisionDate || c.value.adminReviewDocNo)
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
      title: '后续处置 / 救济监督',
      date: latestDisposal?.updatedAt || c.value.adminReviewDecisionDate || c.value.adminReviewAcceptDate || c.value.adminReviewApplyDate,
      description: latestDisposal
        ? `${latestDisposal.disposalType || '后续处置'}：${latestDisposal.status || latestDisposal.resultSummary || '已记录'}`
        : hasAdminReviewProgress
          ? `复议结果：${c.value.adminReviewResult || '处理中'}`
          : '尚未记录后续处置时可暂不处理',
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

function filingStatusLabel(value) {
  return filingStatusOptions.find(item => item.value === value)?.label || value || '未填写'
}

function addWorkdayForDetail(startDate, days) {
  let current = dayjs(startDate)
  let added = 0
  while (added < days) {
    current = current.add(1, 'day')
    if (![0, 6].includes(current.day())) {
      added += 1
    }
  }
  return current
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

function parseRelatedMaterials(text = '') {
  return String(text)
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [name = '', url = '', type = ''] = line.split('|').map(part => part.trim())
      return { name, url, type: type || (url ? 'link' : 'note') }
    })
}

function formatRelatedMaterials(materials = []) {
  if (!Array.isArray(materials) || materials.length === 0) return ''
  return materials.map(item => [item.name, item.url, item.type].filter(Boolean).join(' | ')).join('；')
}

function getDefaultDeadlineBasis(type = '', source = '', draft = {}) {
  if (source === 'review_deadline') return 'admin_review_apply_60'
  const mapping = {
    '信访': 'petition_60',
    '12345 政务服务热线': 'petition_60',
    '12345 / 信访': 'petition_60',
    '领导信箱': 'petition_60',
    '政府网站留言': 'petition_60',
    '政府信息公开': 'gov_info_20wd',
    '行政执法监督': 'law_enforcement_supervision_60_90',
    '政府督查': 'gov_inspection_specified',
    '纪检监察举报': 'discipline_inspection_3m',
    '派驻纪检监察组反映': 'discipline_inspection_3m',
    '人大监督': 'npc_petition_60',
    '人大信访室': 'npc_petition_60',
    '人大代表建议 / 反映渠道': 'npc_deputy_suggestion_3m',
    '其他监督 / 救济路径': 'custom_followup',
  }
  if (type === '行政复议') {
    return draft.acceptDate ? 'admin_review_handle_60' : 'admin_review_apply_60'
  }
  return mapping[type] || 'custom_followup'
}

function deadlineBasisLabel(value = '') {
  return deadlineBasisOptions.find(item => item.value === value)?.label || (value || '待补充期限依据')
}

function fillDisposalDraft(draft = {}, context = null) {
  disposalDraft.value = {
    ...createEmptyDisposalDraft(),
    ...draft,
    statusTouched: false,
    targetOrganTouched: false,
  }
  if (!disposalDraft.value.deadlineBasis && disposalDraft.value.disposalType) {
    disposalDraft.value.deadlineBasis = getDefaultDeadlineBasis(disposalDraft.value.disposalType, context?.source || '', disposalDraft.value)
  }
  relatedMaterialsText.value = Array.isArray(draft.relatedMaterials)
    ? draft.relatedMaterials.map(item => [item.name, item.url, item.type].filter(Boolean).join(' | ')).join('\n')
    : ''
  disposalContext.value = context
}

function resetDisposalDraft() {
  editingDisposalId.value = ''
  showDisposalForm.value = false
  showDisposalMore.value = false
  fillDisposalDraft(createEmptyDisposalDraft(), null)
}

function selectDisposalType(type) {
  disposalDraft.value.disposalType = type
  if (!disposalDraft.value.submitDate) {
    disposalDraft.value.submitDate = dayjs().format('YYYY-MM-DD')
  }
  if (!disposalDraft.value.deadlineBasis) {
    disposalDraft.value.deadlineBasis = getDefaultDeadlineBasis(type, disposalContext.value?.source || '', disposalDraft.value)
  }
  // 只要用户没手动改过提交机关，切换类型时自动建议
  if (!disposalDraft.value.targetOrganTouched) {
    disposalDraft.value.targetOrgan = getDefaultOrgan(type, disposalJurisdiction.value)
  }
}

function openNewDisposalForm(type = '') {
  resetDisposalDraft()
  showDisposalForm.value = true
  if (type) {
    selectDisposalType(type)
  }
}

function startNewDisposal(type = '') {
  openNewDisposalForm(type)
}

function editDisposal(item) {
  editingDisposalId.value = item.id
  showDisposalForm.value = true
  fillDisposalDraft({ ...item, relatedMaterials: item.relatedMaterials || [] }, null)
}

function buildDisposalPayload() {
  const { statusTouched, targetOrganTouched, ...draft } = disposalDraft.value
  const now = dayjs().toISOString()
  return {
    id: editingDisposalId.value || draft.id || crypto.randomUUID(),
    disposalType: draft.disposalType || '',
    targetOrgan: draft.targetOrgan || '',
    submitDate: draft.submitDate || '',
    status: draft.status || '',
    resultDate: draft.resultDate || '',
    resultSummary: draft.resultSummary || '',
    relatedMaterials: parseRelatedMaterials(relatedMaterialsText.value),
    note: draft.note || '',
    reviewStartDate: draft.reviewStartDate || '',
    reviewDeadline60: draft.reviewDeadline60 || '',
    reviewLongStopDate: draft.reviewLongStopDate || '',
    reviewStatusText: draft.reviewStatusText || '',
    deadlineBasis: draft.deadlineBasis || '',
    acceptDate: draft.acceptDate || '',
    mailSignedDate: draft.mailSignedDate || '',
    deadlineDate: draft.deadlineDate || '',
    followUpDate: draft.followUpDate || '',
    deadlineNote: draft.deadlineNote || '',
    mailTrackingNo: draft.mailTrackingNo || '',
    mailSentDate: draft.mailSentDate || '',
    deliveryStatus: draft.deliveryStatus || '',
    createdAt: editingDisposalId.value
      ? (disposalRecords.value.find(item => item.id === editingDisposalId.value)?.createdAt || now)
      : now,
    updatedAt: now,
  }
}

function saveDisposal() {
  if (!disposalDraft.value.disposalType) {
    alert('请先选择处置类型')
    return
  }
  const payload = buildDisposalPayload()
  const next = editingDisposalId.value
    ? disposalRecords.value.map(item => (item.id === editingDisposalId.value ? payload : item))
    : [payload, ...disposalRecords.value]
  store.updateCase(c.value.id, { disposals: next })
  loadCase()
  resetDisposalDraft()
}

function deleteDisposal(item) {
  if (!confirm(`确认删除“${item.disposalType || '后续处置'}”这条记录吗？`)) return
  const next = disposalRecords.value.filter(entry => entry.id !== item.id)
  store.updateCase(c.value.id, { disposals: next })
  loadCase()
  if (editingDisposalId.value === item.id) {
    resetDisposalDraft()
  }
}

function copyDisposal(item) {
  const copy = { ...item }
  delete copy.id
  delete copy.createdAt
  delete copy.updatedAt
  // 清空时效字段
  copy.mailTrackingNo = ''
  copy.mailSentDate = ''
  copy.mailSignedDate = ''
  copy.acceptDate = ''
  copy.resultDate = ''
  copy.resultSummary = ''
  // 办理状态重置为拟提交
  copy.status = '拟提交'
  copy.statusTouched = false
  copy.targetOrganTouched = false
  editingDisposalId.value = ''
  showDisposalForm.value = true
  fillDisposalDraft(copy, null)
}

async function scrollToDisposalSection() {
  disposalTabSelected.value = true
  activeDetailTab.value = 'info'
  await nextTick()
  disposalSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function handleOpenDisposal(payload = {}) {
  await scrollToDisposalSection()
  if (!payload?.type) return
  editingDisposalId.value = ''
  showDisposalForm.value = true
  fillDisposalDraft({
    ...createEmptyDisposalDraft(),
    ...(payload.draft || {}),
  }, { ...(payload.caseContext || {}), source: payload.source || '' })
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
  // 只写举报结果字段，不触碰 filingStatus / filingDate
  store.updateCase(c.value.id, {
    reportResultStatus: newStatus,
    reportResultDate: c.value.reportResultDate || dayjs().format('YYYY-MM-DD'),
  })
  loadCase()
}

function clearReportResultStatus() {
  // 只清举报结果字段，不触碰 filingStatus / filingDate
  store.updateCase(c.value.id, {
    reportResultStatus: null,
    reportResultDate: null,
  })
  loadCase()
}

// 点击「已立案」——只写立案字段，绝不触碰 reportResultStatus / reportResultDate
function changeFilingQuickStatus(value) {
  store.updateCase(c.value.id, {
    filingStatus: value, // 'filed'
    filingDate: c.value.filingDate || dayjs().format('YYYY-MM-DD'),
  })
  loadCase()
}

// 清空已立案——只清立案字段，不触碰 reportResultStatus / reportResultDate
function clearFilingQuickStatus() {
  store.updateCase(c.value.id, {
    filingStatus: '',
    filingDate: null,
  })
  loadCase()
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
    router.push('/cases')
  }
}
</script>

<template>
  <transition name="ai-drawer-fade">
    <div v-if="visible" class="ai-drawer-mask" @click.self="$emit('close')">
      <aside class="ai-next-step-drawer">
        <div class="ai-drawer-head">
          <div>
            <h3>AI 下一步建议</h3>
            <p>仅生成草稿或待确认记录，不会自动提交任何文书。</p>
          </div>
          <button class="ai-drawer-close" @click="$emit('close')">×</button>
        </div>

        <div class="ai-drawer-body">
          <section class="ai-block">
            <div class="ai-block-label">当前案件状态</div>
            <div class="ai-kv-grid">
              <div><span>案件编号</span><strong>{{ context.caseNumber }}</strong></div>
              <div><span>当前进度</span><strong>{{ context.status }}</strong></div>
              <div><span>原处理结果</span><strong>{{ context.originalResult }}</strong></div>
              <div><span>结果日期</span><strong>{{ context.resultDate }}</strong></div>
              <div><span>当前救济状态</span><strong>{{ context.currentReliefStatus }}</strong></div>
              <div><span>已有相关路径数量</span><strong>{{ context.relatedPathCount }}</strong></div>
            </div>
          </section>

          <section class="ai-block">
            <div class="ai-block-label">优先建议动作</div>
            <ul class="ai-list">
              <li v-for="item in context.priorityActions" :key="item">{{ item }}</li>
            </ul>
          </section>

          <section class="ai-block">
            <div class="ai-block-label">判断依据</div>
            <ul class="ai-list muted">
              <li v-for="item in context.basis" :key="item">{{ item }}</li>
            </ul>
          </section>

          <section class="ai-block">
            <div class="ai-block-label">期限风险</div>
            <div class="status-chip badge-red">{{ context.deadlineRisk }}</div>
          </section>

          <section class="ai-block">
            <div class="ai-block-label">建议材料清单</div>
            <ul class="ai-list muted">
              <li v-for="item in context.materials" :key="item">{{ item }}</li>
            </ul>
          </section>

          <section class="ai-block">
            <div class="ai-block-label">可选路径</div>
            <div class="path-grid">
              <span v-for="item in context.paths" :key="item" class="path-pill">{{ item }}</span>
            </div>
          </section>

          <section class="ai-block warning-box">
            <div class="ai-block-label">风险提示</div>
            <p>{{ context.riskNotice }}</p>
          </section>
        </div>

        <div class="ai-drawer-foot">
          <button class="btn-secondary">生成复议材料</button>
          <button class="btn-secondary">建立信息公开记录</button>
          <button class="btn-secondary">建立监督记录</button>
          <button class="btn-secondary">暂不处理</button>
          <button class="btn-primary">采纳建议</button>
        </div>
      </aside>
    </div>
  </transition>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  context: {
    type: Object,
    default: () => ({
      caseNumber: 'AJ202604230018',
      status: '已签收未答复',
      originalResult: '不予立案',
      resultDate: '2026-04-21',
      currentReliefStatus: '未建立救济记录',
      relatedPathCount: 0,
      priorityActions: ['准备行政复议', '建议优先级：高'],
      basis: ['已登记不利处理结果', '当前仍在可救济期限内', '建议优先准备复议材料'],
      deadlineRisk: '复议剩余 57 天，建议优先处理。',
      materials: ['原举报信', '购买凭证', '商品宣传截图', '邮寄签收记录', '机关答复', '程序问题说明', '事实理由说明'],
      paths: ['行政复议', '政府信息公开', '上级复议机构监督', '纪检监察举报', '人大信访', '行政诉讼准备', '更多路径'],
      riskNotice: '纪检监察、人大信访、信访督办等路径应基于具体事实和证据，不得仅因不服处理结果而认定工作人员违法违纪。',
    }),
  },
})

defineEmits(['close'])
</script>

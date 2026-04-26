<template>
  <div class="page-shell">
    <!-- 顶部案件定位区 -->
    <div class="page-header page-header-row relief-header">
      <div class="breadcrumb-area">
        <span class="breadcrumb-link">案件详情</span>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">AJ202604240021</span>
      </div>
      <div class="header-actions">
        <button class="btn-secondary sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg>
          返回列表
        </button>
        <button class="btn-secondary sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          编辑案件
        </button>
        <span class="status-badge badge-orange">救济跟进中</span>
      </div>
    </div>

    <!-- 案件主卡 -->
    <div class="case-main-card">
      <div class="case-main-title">1989潮牌鞋服集合店</div>
      <div class="case-main-grid">
        <div class="case-field"><span class="field-label">平台</span><span class="field-value">淘宝</span></div>
        <div class="case-field"><span class="field-label">商品</span><span class="field-value">耐克运动鞋</span></div>
        <div class="case-field full-width"><span class="field-label">订单号</span><span class="field-value">2456789123456789123</span></div>
        <div class="case-field"><span class="field-label">金额</span><span class="field-value badge-money">¥699.00</span></div>
        <div class="case-field"><span class="field-label">案件类型</span><span class="field-value">举报</span></div>
        <div class="case-field"><span class="field-label">主要问题</span><span class="field-value">虚假宣传</span></div>
        <div class="case-field"><span class="field-label">提交日期</span><span class="field-value">2026-04-18</span></div>
        <div class="case-field"><span class="field-label">签收日期</span><span class="field-value">2026-04-20</span></div>
        <div class="case-field"><span class="field-label">当前状态</span><span class="field-value badge-blue-sm">已签收未答复</span></div>
        <div class="case-field"><span class="field-label">超期天数</span><span class="field-value badge-red-sm">5天</span></div>
        <div class="case-field full-width"><span class="field-label">关联机关</span><span class="field-value">新抚区市场监督管理局</span></div>
        <div class="case-field"><span class="field-label">处理结果</span><span class="field-value badge-red-sm">不予立案</span></div>
        <div class="case-field"><span class="field-label">结果日期</span><span class="field-value">2026-04-23</span></div>
        <div class="case-field full-width"><span class="field-label">答复文书</span><span class="field-value link-blue">不予立案告知书.pdf</span></div>
        <div class="case-field full-width"><span class="field-label">是否可复议</span><span class="field-value badge-green-sm">是（剩余57天）</span></div>
      </div>
    </div>

    <!-- 案件详情 tab -->
    <div class="detail-tabs">
      <button class="detail-tab">案件信息</button>
      <button class="detail-tab">证据材料 <span class="tab-count">12</span></button>
      <button class="detail-tab">邮寄台账 <span class="tab-count">2</span></button>
      <button class="detail-tab">机关答复 <span class="tab-count">1</span></button>
      <button class="detail-tab active">救济监督 <span class="tab-count">3</span></button>
      <button class="detail-tab">办理记录</button>
      <button class="detail-tab">提醒记录</button>
    </div>

    <!-- 主内容两列布局 -->
    <div class="detail-layout relief-layout">
      <!-- 左侧主区域 -->
      <div class="detail-main-column">
        <div class="section-head">
          <h3>关联的救济监督记录（3）</h3>
          <button class="btn-primary sm"><span>＋</span>新增救济记录</button>
        </div>

        <div class="relief-cards">
          <div class="relief-card card-blue">
            <div class="relief-card-left-bar" style="background: #1677ff"></div>
            <div class="relief-card-body">
              <div class="relief-card-top">
                <div class="relief-type">行政复议</div>
                <span class="status-badge badge-orange">准备材料</span>
              </div>
              <div class="relief-fields">
                <div class="relief-field"><span class="relief-label">提交对象</span><span class="relief-value">新抚区人民政府</span></div>
                <div class="relief-field"><span class="relief-label">提交方式</span><span class="relief-value">邮寄</span></div>
                <div class="relief-field"><span class="relief-label">提交日期</span><span class="relief-value">2026-04-24</span></div>
                <div class="relief-field"><span class="relief-label">期限提醒</span><span class="relief-value text-orange">复议剩余57天</span></div>
                <div class="relief-field"><span class="relief-label">我方下一步</span><span class="relief-value">补齐复议申请材料</span></div>
                <div class="relief-field"><span class="relief-label">关联材料</span><span class="relief-value">5份</span></div>
              </div>
              <div class="relief-actions">
                <button class="btn-link sm">查看</button>
                <button class="btn-link sm">编辑</button>
                <button class="btn-link sm">更多</button>
              </div>
            </div>
          </div>

          <div class="relief-card card-purple">
            <div class="relief-card-left-bar" style="background: #8b5cf6"></div>
            <div class="relief-card-body">
              <div class="relief-card-top">
                <div class="relief-type">政府信息公开</div>
                <span class="status-badge badge-blue">待提交</span>
              </div>
              <div class="relief-fields">
                <div class="relief-field"><span class="relief-label">提交对象</span><span class="relief-value">新抚区市场监督管理局</span></div>
                <div class="relief-field"><span class="relief-label">提交方式</span><span class="relief-value">线上申请</span></div>
                <div class="relief-field"><span class="relief-label">提交日期</span><span class="relief-value">2026-04-25</span></div>
                <div class="relief-field"><span class="relief-label">期限提醒</span><span class="relief-value text-blue">建议3日内提交</span></div>
                <div class="relief-field"><span class="relief-label">我方下一步</span><span class="relief-value">申请公开核查记录和不予立案依据</span></div>
                <div class="relief-field"><span class="relief-label">关联材料</span><span class="relief-value">3份</span></div>
              </div>
              <div class="relief-actions">
                <button class="btn-link sm">查看</button>
                <button class="btn-link sm">编辑</button>
                <button class="btn-link sm">更多</button>
              </div>
            </div>
          </div>

          <div class="relief-card card-green">
            <div class="relief-card-left-bar" style="background: #10b981"></div>
            <div class="relief-card-body">
              <div class="relief-card-top">
                <div class="relief-type">上级机关监督</div>
                <span class="status-badge badge-gray">待评估</span>
              </div>
              <div class="relief-fields">
                <div class="relief-field"><span class="relief-label">提交对象</span><span class="relief-value">抚顺市市场监督管理局</span></div>
                <div class="relief-field"><span class="relief-label">提交方式</span><span class="relief-value">网上反映</span></div>
                <div class="relief-field"><span class="relief-label">提交日期</span><span class="relief-value">未提交</span></div>
                <div class="relief-field"><span class="relief-label">期限提醒</span><span class="relief-value text-gray">复议材料优先</span></div>
                <div class="relief-field"><span class="relief-label">我方下一步</span><span class="relief-value">视复议准备情况决定是否同步反映</span></div>
                <div class="relief-field"><span class="relief-label">关联材料</span><span class="relief-value">0份</span></div>
              </div>
              <div class="relief-actions">
                <button class="btn-link sm">查看</button>
                <button class="btn-link sm">编辑</button>
                <button class="btn-link sm">更多</button>
              </div>
            </div>
          </div>
        </div>

        <div class="collapse-section">
          <button class="collapse-btn">已完成的救济记录（0）<span class="collapse-arrow">▾</span></button>
        </div>
      </div>

      <!-- 右侧 AI 建议栏 -->
      <div class="detail-sidebar ai-sidebar">
        <div class="side-card">
          <div class="side-card-head"><h3>AI 下一步建议</h3></div>
          <div class="ai-body">
            <div class="ai-block">
              <div class="ai-block-label">优先建议动作</div>
              <div class="ai-primary-action">
                <div class="action-main">准备行政复议</div>
                <div class="action-priority">建议优先级：<strong>高</strong></div>
              </div>
            </div>
            <div class="ai-block">
              <div class="ai-block-label">判断依据</div>
              <ul class="ai-list">
                <li>已登记不利处理结果</li>
                <li>当前仍在可救济期限内</li>
                <li>建议优先准备复议材料</li>
              </ul>
            </div>
            <div class="ai-block">
              <div class="ai-block-label">材料清单</div>
              <div class="ai-tags">
                <span class="ai-tag">原举报信</span>
                <span class="ai-tag">购买凭证</span>
                <span class="ai-tag">商品宣传截图</span>
                <span class="ai-tag">邮寄签收记录</span>
                <span class="ai-tag">机关答复</span>
                <span class="ai-tag">程序问题说明</span>
                <span class="ai-tag">事实理由说明</span>
              </div>
            </div>
            <div class="ai-block">
              <div class="ai-block-label">可选救济路径</div>
              <div class="ai-path-pills">
                <span class="path-pill">行政复议</span>
                <span class="path-pill">政府信息公开</span>
                <span class="path-pill">上级机关监督</span>
                <span class="path-pill">纪检监察举报</span>
                <span class="path-pill">人大信访</span>
                <span class="path-pill">行政诉讼准备</span>
              </div>
            </div>
            <div class="ai-block ai-warning">
              <div class="ai-block-label">风险提示</div>
              <p class="ai-warning-text">纪检监察、人大信访、信访督办等路径应基于具体事实和证据，不得仅因不服处理结果而认定工作人员违法违纪。</p>
            </div>
            <div class="ai-actions">
              <button class="btn-secondary sm full">暂不处理</button>
              <button class="btn-primary sm full">采纳建议</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
# BASELINE.md - 稳定基线记录

> 更新时间：2026-04-27 08:57

## 当前稳定版本

- **commit**: `f5a759d`
- **JS**: `index-yZ3ZQfCG.js`
- **CSS**: `index-CWJ6rqJm.css`
- **上线时间**: 2026-04-27 08:57
- **线上目录**: `/var/www/case-management`

---

## 本次上线内容

**案件状态逻辑统一 + 布局与按钮修复**

### 本次修复（10 项）
1. 统一案件状态逻辑（新增 `src/utils/caseStatus.js`，含 getEffectiveStatusLabel / getNextAction / getDeadlineText / getStatusBadgeClass）
2. 工作台待跟进案件状态、期限提醒、我方下一步按真实状态显示
3. 工作台"查看"按钮跳转案件详情修复
4. 案件详情页弹窗按钮验收（变更状态/添加答复/上传文书 三按钮事件绑定恢复）
5. 证据库材料夹点击切换（folder card @click + selected-case 选中态）
6. 案件档案 6 列筛选 grid 布局（`.archive-filter-grid` CSS class）
7. 救济监督两列布局（`.detail-layout.relief-layout` CSS class，653px+360px）
8. 流程时间轴卡片化（白色圆角卡片，非裸文本）
9. 案件材料卡片化（材料中心白色卡片，非裸文本）
10. 保持真实数据绑定，不恢复假数据（store.cases computed 全部保留）

### 本次截图（9 张真实验收）
- `case-archive-filter-expanded.png` — 案件档案筛选展开 6 列
- `case-archive-real-check.png` — 案件档案页
- `relief-real-check.png` — 救济监督两列布局
- `evidence-real-check.png` — 证据库页
- `evidence-folder-real-check.png` — 证据库材料夹点击切换
- `case-detail-info-real-check.png` — 案件信息 Tab
- `case-detail-timeline-real-check.png` — 流程时间轴卡片
- `case-detail-materials-real-check.png` — 案件材料卡片
- `case-detail-modal-real-check.png` — 变更状态弹窗

### 本次实际改动文件
- `src/pages/WorkbenchView.vue` — 状态逻辑统一调用
- `src/pages/EvidenceView.vue` — 材料夹点击绑定
- `src/style.css` — 新增 .archive-filter-grid / .relief-layout / .timeline-* / .material-* 等布局 class
- `src/utils/caseStatus.js` — 新增（159 行）

---

## 上次上线内容（导航修复 + 侧边栏统一 + 工作台筛选）

### 本次修复（8 项）
1. `/` 默认进入 `/workbench`（redirect）
2. 案件档案迁移到 `/cases`（原 `/` 不再指向案件档案）
3. 左侧菜单高亮修复（用 menu key 精确匹配，不再误高亮）
4. 全部 10 个页面侧边栏统一浅色（`sidebar-light` 固定）
5. 工作台统计卡点击筛选修复（案件总数=全量，不再过滤 pending_report；已寄出=有单号，不再额外加签收条件）
6. 工作台"查看"按钮跳转案件详情（`router.push('/case/${id}')`）
7. CaseDetail/CaseForm 返回列表 → `/cases`（不再返回 `/`）
8. ReliefSupervision 空状态「去案件档案」→ `/cases`

---

## 上上次上线内容（真实数据绑定 + 假数据清理）

### UI 改造（10 页）
1. 工作台 — page-header-row + header-actions
2. 案件档案 — page-header-row + header-actions
3. 证据库 — page-header-row + header-actions
4. 邮寄台账 — header-actions
5. 机关答复 — page-header-row + header-actions
6. 救济监督 — 完全重构为案件详情视图 + AI 建议栏
7. 收支统计 — header-actions
8. 提醒中心 — 数据绑定
9. 文书生成中心 — header-actions
10. 设置中心 — 截图验收

### 真实数据绑定（8 个页面）
1. 工作台 — 6 格统计 + feeStats 均来自 store.cases computed
2. 收支统计 — totalBuy / totalCompensation / netProfit 真实计算
3. 邮寄台账 — pending / inTransit / signed / signedNoReply 真实计算
4. 机关答复 — total / unfavorable / favorable / unresolved 真实计算
5. 提醒中心 — 过期/临期/未回复过滤
6. 证据库 — 材料数 / 材料夹 / 完整度 真实绑定
7. 救济监督 — selectedCase + disposals 真实数据

### 假数据清理（6 处）
1. EvidenceView.vue — "共 12 个案件" → materialCases.length
2. EvidenceView.vue — "AJ202604240021 1989潮牌..." → 动态标题
3. EvidenceView.vue — "6 / 8" → selectedCompleteness
4. EvidenceView.vue — "width: 75%" → 动态 percent
5. DocumentTemplatesView.vue — 5 处硬编码统计 → computed
6. SettingsCenterView.vue — 硬编码备份/更新时间 → null

---

## 验收结果

- 全站假数据审计通过（无效果图假数字 / 无假案件）
- build 通过（仅 chunk size warning，无 error）
- 13 条路由本地验收全部通过（200 OK，无白屏）
- 线上 10 个菜单全部可打开
- 线上首页 HTTP 200，引用正确 JS/CSS
- 真实验收截图 9 张全部生成
- 所有弹窗按钮经真实点击验证（dispatchEvent 触发 Vue 事件）

---

## 线上资源校验

| 项 | 状态 |
|---|---|
| JS 文件大小 | 1,292,888 bytes |
| CSS 文件大小 | 40,925 bytes |
| JS 权限 644 | ✅ |
| CSS 权限 644 | ✅ |
| JS HTTP 200（服务器本地） | ✅ |
| CSS HTTP 200（服务器本地） | ✅ |
| 首页引用正确 JS/CSS | ✅ |

---

## 当前回滚点

- **commit**: `a614b04`
- **备份文件**: `index.html.bak-before-nav-filter-fix-20260426-2157`
- **本次备份文件**: `index.html.bak-before-detail-function-layout-fix-20260427-085726`
- **说明**: 回滚仅切 bundle 引用，不需要重新构建

---

## 回滚命令

### 仅回滚线上 bundle 引用（最快）

```bash
# 线上目录
cd /var/www/case-management
cp index.html.bak-before-detail-function-layout-fix-20260427-085726 index.html
```

### 回滚到上一稳定版本（本次 bundle）

```bash
# 线上目录
# 上次的 JS/CSS 仍在线上 assets/ 目录
# 只需切回旧引用
# JS: index-DY5OGi-E.js
# CSS: index-B1qeXMdA.css
```

### 需要同时回滚源码

```bash
# 本地源码
cd /Users/huangcheng/.agents/skills/case-management
git reset --hard a614b04
npm run build
# 然后重新上传新的 bundle 到 /var/www/case-management/assets/
```

---

## 历史基线

<details>
<summary>展开历史基线记录</summary>

### v2026-04-27-0857 案件状态逻辑统一 + 布局按钮修复（当前）

- commit: `f5a759d`
- JS: `index-yZ3ZQfCG.js`
- CSS: `index-CWJ6rqJm.css`
- 上线时间: 2026-04-27 08:57
- 备份文件: `index.html.bak-before-detail-function-layout-fix-20260427-085726`

### v2026-04-26-2159 导航修复 + 侧边栏统一 + 工作台筛选

- commit: `17b56bd`
- JS: `index-DY5OGi-E.js`
- CSS: `index-B1qeXMdA.css`
- 上线时间: 2026-04-26 21:59
- 备份文件: `index.html.bak-before-nav-filter-fix-20260426-2157`

### v2026-04-26-2113 真实数据绑定 + 假数据清理（已回滚）

- commit: `06601d9`
- JS: `index-_xsBaZb8.js`
- CSS: `index-Dm9aJsKk.css`
- 上线时间: 2026-04-26 21:13
- 备份文件: `index.html.bak-before-real-data-20260426-2113`

### v2026-04-26-1830 浅色 SaaS UI（已回滚）

- commit: `2c15d0d`
- JS: `index-BZi5hnmu.js`
- CSS: `index-Dm9aJsKk.css`
- 上线时间: 2026-04-26 18:28
- 备份文件: `index.html.bak-before-light-saas-20260426-1828`

### v2026-04-25 深蓝灰法律工作台（已废弃）

- JS: `index-CRno7W-R.js`
- CSS: `index-DuaOLktS.css`
- Git commit: `f5419f5`

</details>

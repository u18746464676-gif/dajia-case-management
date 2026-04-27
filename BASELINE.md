# BASELINE.md - 稳定基线记录

> 更新时间：2026-04-27 18:51

## 当前稳定版本

- **commit**: `d2ae074`
- **JS**: `index-Cf5gZIxR.js`
- **CSS**: `index-BY2WTL0l.css`
- **上线时间**: 2026-04-27 18:51
- **线上目录**: `/var/www/case-management`

---

## 本次上线内容

**案件详情页三类操作弹窗 modal 化**

### 本次修复（3 项）
1. 工作台顶部统计卡从流程辅助项改为 9 张案件状态统计卡：案件总数 / 已受理 / 未受理 / 不予受理 / 已立案 / 不予立案 / 不予处罚 / 已处罚 / 已调解
2. 未受理口径修正为 `!isAccepted(c) && !isNotAccepted(c)`（长期稳定逻辑，不会与"不予受理"重叠）
3. 9 张统计卡点击筛选已全部逐张验证一致

### 本次实际改动文件
- `src/pages/WorkbenchView.vue` — statCards 改为 9 张，新增 isAccepted/isNotAccepted helper，filteredWorkbenchCases switch 新增 9 个 case
- `src/style.css` — 新增 .stat9-grid 规则（3列，gap 12px）+ 媒体查询响应式

### 统计卡口径
| 统计卡 | 字段 | 枚举 |
|---|---|---|
| 已受理 | acceptanceStatus | 'accepted' / '已受理' |
| 未受理 | acceptanceStatus | !isAccepted && !isNotAccepted（含空值） |
| 不予受理 | acceptanceStatus | 'not_accepted' / 'rejected_acceptance' / '不予受理' |
| 已立案 | filingStatus | 'filed' / '已立案' |
| 不予立案 | reportResultStatus | 'rejected' / 'not_filed' / '不予立案' |
| 不予处罚 | reportResultStatus | 'not_punished' / 'exempted' / '违法事实不成立' / '不予处罚' |
| 已处罚 | reportResultStatus | 'penalty' / 'punished' / '已处罚' |
| 已调解 | mediationStatus | 'decided' / 'mediation_success' / '已调解' |

### 验收结果
- 已受理 17 + 未受理 5 + 不予受理 0 = 案件总数 22 ✅
- 9 张统计卡点击筛选全部逐张验证一致

---

## 上次上线内容（案件状态逻辑统一 + 布局按钮修复）

### 本次修复（10 项）
1. 统一案件状态逻辑（新增 `src/utils/caseStatus.js`）
2. 工作台待跟进案件状态、期限提醒、我方下一步按真实状态显示
3. 工作台"查看"按钮跳转案件详情修复
4. 案件详情页弹窗按钮验收
5. 证据库材料夹点击切换
6. 案件档案 6 列筛选 grid 布局
7. 救济监督两列布局
8. 流程时间轴卡片化
9. 案件材料卡片化
10. 保持真实数据绑定，不恢复假数据

---

## 上上次上线内容（导航修复 + 侧边栏统一 + 工作台筛选）

### 本次修复（8 项）
1. `/` 默认进入 `/workbench`
2. 案件档案迁移到 `/cases`
3. 左侧菜单高亮修复
4. 10 个页面侧边栏统一浅色
5. 工作台统计卡点击筛选修复
6. 工作台"查看"按钮跳转案件详情
7. CaseDetail/CaseForm 返回列表 → `/cases`
8. ReliefSupervision 空状态 → `/cases`

---

## 历史基线

<details>
<summary>展开历史基线记录</summary>

### v2026-04-27-1851 案件详情页三类操作弹窗 modal 化（当前）

- commit: `d2ae074`
- JS: `index-Cf5gZIxR.js`
- CSS: `index-BY2WTL0l.css`
- 上线时间: 2026-04-27 18:51
- 备份文件: `index.html.bak-before-case-detail-modal-fix-20260427-185127`

### v2026-04-27-1023 工作台 9 张状态统计卡

- commit: `6847a7c`
- JS: `index-BFQnEph3.js`
- CSS: `index-BhznxOu7.css`
- 上线时间: 2026-04-27 10:23
- 备份文件: `index.html.bak-before-workbench-stat9-20260427-102333`

### v2026-04-27-0857 案件状态逻辑统一 + 布局按钮修复

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

</details>
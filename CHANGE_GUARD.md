# CHANGE_GUARD.md - 主链路封板规则

> 生效时间：2026-04-21，第一阶段确立
> 更新：2026-04-22，第二阶段新增（三段独立状态 + effectiveStatus 规范）

---

## 第一阶段：冻结区（2026-04-21 确立）

### 冻结区模块（默认禁止改）

- 上传主链路
- `/api/storage/upload`
- `/api/register-cloud-file`
- 本地 `/uploads/` 存储规则
- `cloud_files` 作为云端文件管理唯一数据源
- 云端文件列表加载逻辑
- 云端文件删除逻辑
- 三通道隔离
- 预览主分支逻辑
- nginx 关键路由

### 触碰冻结区的强制规则

1. 改动范围
2. 风险点
3. 回滚方案
4. 全链路回归清单
5. 上线后验证项

### 固定冒烟测试清单

1. 上传信封
2. 上传文书
3. 上传 Word
4. `/api/register-cloud-file` 入库
5. 云端文件管理列表
6. 云端单个删除
7. 云端批量删除
8. 材料中心预览

### 新功能开发原则

- 默认不侵入主链路
- 优先新组件 / 新接口 / 新字段
- 不允许为了新功能顺手改上传、删除、列表、预览主逻辑
- 能加开关就加开关
- 能旁路实现就不要侵入实现

### 部署规则

- 不允许同名 bundle 覆盖作为长期方案
- 每次 build 生成新 bundle 文件名
- 部署后必须核对 `index.html` 实际引用
- 必须保留上一个可回滚版本
- nginx 配置必须保留备份

---

## 第二阶段：三段独立状态联动规范（2026-04-22 新增）

### 背景

详情页"变更状态"由原来的单一 `c.status` 字段，改为三个独立子状态字段：
- `acceptanceStatus` — 受理状态（已受理 / 不予受理）
- `mediationStatus` — 调解状态（已调解 / 终止调解）
- `reportResultStatus` — 举报结果（已处罚 / 不予立案 / 责令改正 / 不予处罚）

### effectiveStatus 计算规则（统一，所有读取处必须遵循）

优先级从高到低：
1. `mediationStatus === 'decided'` → `"decided"`（已调解，最优先，忽略举报结果）
2. `reportResultStatus` 有值（非 null/undefined）→ 显示对应胶囊
3. `mediationStatus` 有值（非 null/undefined，非 decided）→ `"mediation_terminated"`（终止调解）
4. `acceptanceStatus` 有值 → 显示"已受理"或"不予受理"
5. 所有子状态为空 → `"pending_report"`（强制返回"未受理"，不 fallback 到 c.status）

### 涉及文件及规范

| 文件 | 规范 |
|------|------|
| `CaseDetail.vue` | 读取 `caseData`（store.getCase）触发响应式，直接用 caseData.value 计算 |
| `CaseList.vue` | 列表 StatusBadge / 筛选过滤均用 `getEffectiveStatus(caseItem)` |
| `case.js`（store stats） | stats 统计用 `getEffectiveStatus(c)` 计算 |
| `AIChat.vue` | AI 统计摘要用 `getEffectiveStatus(c)` 计算 |
| `DeadlinePanel.vue` | 法定时限倒计时联动，用 acceptanceStatus / mediationStatus / reportResultStatus 分支判断 |
| `DeadlineAlert.vue` | 逾期铃铛，用 acceptanceStatus 判断是否显示受理超期 |
| `notification.js`（铃铛提醒） | 与 DeadlinePanel 联动逻辑保持一致 |
| `case-status.js` | StatusBadge 样式表须包含所有状态：exempted / mediation_terminated |

### effectiveStatus 的 Vue 响应式说明

- `CaseDetail.vue` 中的 `effectiveStatus` 直接读取 `caseData.value`（computed），不读 `c.value` 的缓存
- 这样在 `changeAcceptanceStatus` 等函数通过 `store.updateCase` 修改数据后，响应式会自动更新
- 不需要额外 `loadCase()` 或手动刷新

### 禁止事项

- ❌ 禁止用 `c.status` 作为 StatusBadge 的值（所有 StatusBadge 必须用 effectiveStatus）
- ❌ 禁止在所有子状态为空时 fallback 到 `c.status`
- ❌ 禁止在 `mediationStatus === 'decided'` 时还被举报结果覆盖

### 变更状态函数规范

- `changeAcceptanceStatus(newStatus)` — 切换 acceptanceStatus，点击已选中的选项则清除（置 null）
- `changeMediationStatus(newStatus)` — 切换 mediationStatus，点击已选中则清除
- `changeReportResultStatus(newStatus)` — 切换 reportResultStatus，点击已选中则清除
- 不允许用旧的 `changeStatus()` 一次性修改 `c.status` 字段来"变更状态"

---

## 回滚点清单

| 类型 | 标识 | 说明 |
|------|------|------|
| Git 回滚点 | `53ef8e8` | feat: add batch envelope image picker entry（三段联动前） |
| 当前稳定 bundle | `index-DPLhptBW.js` | 2026-04-22 00:44，三段联动 |
| 上一稳定 bundle | `index-BC0ZOJVL.js` | 多选上传稳定版 |
| nginx 备份 | `/etc/nginx/conf.d/case-management-ssl.conf.bak` | 始终保留 |

## 执行要求

1. 先判断是否触碰冻结区
2. 若触碰，先提交变更说明与回滚方案
3. 先做最小改动
4. 必须跑固定冒烟清单
5. 验证通过后才允许继续扩展功能

**三段独立状态相关改动，先确认 effectiveStatus 计算规则不被破坏。**
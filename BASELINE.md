# BASELINE.md - 稳定基线记录

> 更新时间：2026-04-25 22:34

## 当前稳定 Bundle

- **JS**: `index-CRno7W-R.js`（2026-04-25 22:34，首页 UI 改版——深蓝灰法律工作台风格、左侧竖向导航、金色点缀、玻璃态卡片）
- **CSS**: `index-DuaOLktS.css`
- **构建时间**: 2026-04-25 22:34
- **Git commit**: `f5419f5`
- **源码变更**: `src/App.vue`（布局重构）、`src/style.css`（深蓝灰 CSS 变量体系）

## 首页视觉基线（2026-04-25 确立）

### 视觉风格
- 深蓝灰法律工作台风格
- 主色：深蓝 `#07111f`、藏青、蓝灰
- 点缀色：金色 `#d6a650`、浅金 `#f3c77b`
- 视觉关键词：法律专业感、克制、高级、玻璃态卡片、圆角 18px、细边框
- **禁止**：红金政务风、普通白底后台风

### 背景规范
```css
background-image:
  radial-gradient(circle at 82% 4%, rgba(59,130,246,0.13), transparent 32%),
  radial-gradient(circle at 18% 0%, rgba(214,166,80,0.08), transparent 28%),
  linear-gradient(135deg, #06101f 0%, #0a1930 45%, #07111f 100%);
```

### 页面布局
- 左侧 88px 竖向导航栏（藏青背景 + 金色天平图标 + 金色左侧选中高亮）
- 顶部工具栏（搜索框 + 通知铃铛 + 管理员入口）
- Hero 标题区
- 五个核心统计卡片（案件总数 / 待受理 / 已立案 / 复议跟进 / 本月办结）
- 状态筛选条（横向长条，深色胶囊 + 金色边框当前选中态）
- 待跟进案件模块（玻璃卡片 + 金色主按钮 + 数据胶囊）
- 经营数据卡片（4 列）
- 检索与筛选区 + 案件列表表格

### 固定文案
| 位置 | 文案 |
|------|------|
| 主标题 | 案件处置工作台 |
| 副标题 | 循法而行，据证而断 |
| 说明文案 | 围绕案件建档、材料归集、流程处置与复议跟踪形成统一工作界面，保持信息清晰、处置有据、留痕完整。 |
| 面包屑 | 案件治理 / 合规处置 / 复议跟踪 |
| 页脚 | 案件处置工作台 · 法律事务管理 |

### 核心统计卡片
案件总数 / 待受理 / 已立案 / 复议跟进 / 本月办结

### 玻璃态卡片统一样式
```css
background: rgba(15, 30, 52, 0.72);
border: 1px solid rgba(148, 163, 184, 0.18);
border-radius: 18px;
box-shadow: 0 20px 60px rgba(0,0,0,0.24);
backdrop-filter: blur(18px);
```

### 主按钮样式（金色渐变）
```css
background: linear-gradient(135deg, #f3c77b, #d6a650);
color: #09111f;
border-radius: 12px;
font-weight: 700;
```

## 三段独立状态联动（2026-04-22 确立）

详见 `CHANGE_GUARD.md` 第二阶段新增内容。

### 终态综合状态 effectiveStatus 计算规则（2026-04-25 修订）

优先级（从高到低）：
1. `mediationStatus === 'decided'` → "已调解"（优先级最高，即使同时有举报终局结果也显示已调解）
2. `reportResultStatus` 有值 → 显示对应举报终局结果（已处罚/不予立案/责令改正/不予处罚）
3. `procedureVersion === 'old' && filingStatus === 'filed' && !reportResultStatus` → "已立案"
4. `mediationStatus === 'mediation_terminated'` → "终止调解"
5. `acceptanceStatus` 有值 → "已受理" / "不予受理"
6. 默认 → "pending_report"（不 fallback 到 c.status）

### 涉及文件（已统一 getEffectiveStatus 逻辑）

- `src/pages/CaseDetail.vue` — 直接读取 caseData 触发响应式更新
- `src/pages/CaseList.vue` — 列表 StatusBadge + 筛选过滤
- `src/stores/case.js` — store.stats 统计
- `src/components/AIChat.vue` — AI 智能统计摘要
- `src/components/DeadlinePanel.vue` — 法定时限倒计时联动
- `src/components/DeadlineAlert.vue` — 逾期铃铛提醒联动
- `src/lib/notification.js` — 铃铛提醒逻辑
- `src/lib/case-status.js` — StatusBadge 样式（补全 exempted / mediation_terminated）

### 详情页已删除功能（2026-04-22）

- ❌ 状态流转记录模块（从 CaseDetail.vue 模板和打印摘要中移除）

### style.css 深色模式（2026-04-21）

- `.metric-card` 深色背景覆盖（`bg-slate-900/80`）

### 后续处置 / 救济监督模块（2026-04-25 确立）

#### 模块结构
- 「后续处置 / 救济监督」与「新建后续处置记录」已合并为单一模块
- 右上角使用「+ 新增处置」按钮控制新建表单展开/收起
- 已有记录以卡片展示，支持编辑、复制一条、删除（删除必须 confirm）

#### 主表单——8 个核心字段
1. 处置类型（select，按组分类）
2. 提交机关 / 部门（input，根据类型自动建议，可手动修改）
3. 寄件单号（input）
4. 签收日期（date）
5. 受理日期（date）
6. 办理状态（select 下拉，10 选项）
7. 结果日期（date）
8. 结果摘要（textarea，xl:col-span-3 占满一行）

#### 系统测算 / 更多字段（折叠区）
- 提交日期
- 期限依据（select）
- 到期日期
- 跟进日期
- 寄件日期
- 送达状态
- 复议相关字段（仅行政复议类型时显示：复议起算日、60日截止日、一年保护期、期限状态）
- 期限说明
- 关联材料说明
- 备注

#### 办理状态规则
- 下拉菜单，选项：拟提交 / 已寄出 / 已签收 / 已受理 / 办理中 / 已办结 / 已反馈 / 已退回 / 已撤回 / 已超期
- 自动联动（均受 `statusTouched` 保护，用户手动选择后不得强制覆盖）：
  - 填寄件单号：拟提交/空 → 已寄出
  - 填签收日期：拟提交/已寄出/空 → 已签收
  - 填受理日期：拟提交/已寄出/已签收/空 → 已受理
  - 填结果日期或摘要：非终态（已办结/已反馈/已退回/已撤回）→ 建议已办结

#### 提交机关默认规则
- 根据案件 `jurisdiction`（管辖局）和处置类型自动建议
- `extractRegionName` 正则：`^(.+?(?:市|区|县|旗))` → 提取完整行政区划
- 例：「运城市市场监督管理局」→ 提取「运城市」→ 建议「运城市人民政府」
- 切换处置类型时，只要 `targetOrganTouched` 为 false 即可自动覆盖，不要求原值非空
- 用户手动修改后 `targetOrganTouched` 标记为 true，不再自动覆盖

#### 内部标记不落库
- `statusTouched`、`targetOrganTouched` 仅为表单内部控制标记
- `buildDisposalPayload` 第一行解构剔除：`const { statusTouched, targetOrganTouched, ...draft } = disposalDraft.value`
- 复制记录时也重置为 false

## 回滚方案（正式）

> 不做同名 bundle 覆盖回滚。回滚时恢复 index.html 引用旧文件名。

```bash
# 1. 源码回滚
git stash
git checkout <目标 commit>
npm run build

# 2. 取旧 bundle 文件名，更新 index.html 引用后部署
# 假设目标 bundle 是 index-CLevM67z.js：
scp dist/assets/index-CLevM67z.js root@hzyhmz.top:/var/www/case-management/assets/
chmod 644 /var/www/case-management/assets/index-CLevM67z.js
# 修改 /var/www/case-management/index.html 中 script src 为 index-CLevM67z.js

# 3. 如需恢复 nginx
cp /etc/nginx/conf.d/case-management-ssl.conf.bak /etc/nginx/conf.d/
nginx -t && nginx -s reload
```

## 当前回滚点

| 类型 | 标识 | 说明 |
|------|------|------|
| Git 回滚点 | `f5419f5` | feat: 首页 UI 改版——深蓝灰法律工作台风格、左侧竖向导航、金色点缀、玻璃态卡片 |
| 当前稳定 bundle | `index-CRno7W-R.js` | 2026-04-25 22:34 |
| 回滚目标 | `index-DUetpow8.js` | Git `4bcb07f`——后续处置模块 + getEffectiveStatus 修正稳定版 |

## "已立案"最终规则（2026-04-25 确立）

### UI 布局
- 独立「举报立案信息（旧规案件）」区块已从 UI 彻底移除（不清空历史数据）
- 「已立案」按钮放在「变更状态 → ③ 举报结果」区域内，仅 `procedureVersion === 'old'` 时显示
- 点击「已立案」只写 `filingStatus = 'filed'` 和 `filingDate`（取当前日期或已有值），不写 `reportResultStatus` / `reportResultDate`

### 倒计时规则
- 旧规立案 90/120 日倒计时只被 `reportResultStatus`（举报终局结果）压制
- 调解终局状态（`decided` / `mediation_terminated`）不压制旧规立案倒计时
- 调解终局只压制普通受理链路 120 日，不压旧规立案 90/120 日

### "已立案"当前状态规则（2026-04-25 确立）

- 旧规已立案且无举报终局结果时，当前状态显示"已立案"
- `mediation_terminated` 不得覆盖"已立案"（调解终止只压制普通受理链路，不压旧规立案）
- 有举报终局结果时（`reportResultStatus`），举报结果优先于"已立案"
- `mediationStatus = decided` 时已调解优先级最高，即使同时存在举报终局结果也显示"已调解"
- 字段值统一为 `"filed"`，不得出现 `"filled"`

### 文案规范（2026-04-25 确立）

- UI 显示统一使用"不予处罚"
- 底层字段值仍为 `"exempted"`，不做字段迁移
- 不改变保存逻辑、筛选逻辑和复议期限触发规则
- 涉及文件：`case-status.js`、`DeadlinePanel.vue`、`CaseDetail.vue`、`CaseList.vue`

### 首页胶囊筛选
- 统计口径：`procedureVersion === 'old' && filingStatus === 'filed' && !reportResultStatus`
- 筛选逻辑：同统计口径
- 字段值统一为 `"filed"`，不得出现 `"filled"`

## 部署规则（新增，2026-04-25）

> 每次上传新 bundle 后必须确认文件权限为 **644**，HTTP 返回 **200** 后方可切换正式 index.html。

1. **上传后立即查权限**：`ls -lh /var/www/case-management/assets/index-XXX.js` → 必须是 `-rw-r--r--`
2. **切包前必须 curl -I 验证**：`curl -I https://hzyhmz.top/assets/index-XXX.js` → 必须返回 `HTTP 200`
3. **禁止在 JS 为 403 时切正式 index.html**（403 = nginx 无权读取，权限仍为 600，需先 `chmod 644`）
4. **切包后再次验证线上实际返回**：防止浏览器缓存导致仍拉旧包

## 本次未改（2026-04-25 确认冻结）

- ❌ 变更状态弹窗保存逻辑
- ❌ 倒计时规则
- ❌ 已立案保存逻辑
- ❌ 上传、入库、删除、云端文件、OCR
- ❌ nginx、三通道、disposals
- ❌ 文书生成、ZIP

## nginx 路由基线（无变更）

- `/api/storage/upload` → `http://127.0.0.1:8787`（storage-server）
- `GET /api/storage/files` → `http://127.0.0.1:3001`（cloud_files 查询）
- `DELETE /api/storage/file` → `http://127.0.0.1:3001`（软删本地+DB）
- `/api/` → `http://127.0.0.1:3001/api/`（case-management-api）

## 关键文件版本

| 文件 | 版本/说明 |
|------|-----------|
| 前端入口 | index.html（引用 index-mSCsfelu.js） |
| 后端服务 | server/combined-server.cjs |
| nginx 配置 | server/nginx-production.conf |
| 云端文件数据源 | cloud_files（DB，deleted_at IS NULL） |
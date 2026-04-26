# BASELINE.md - 稳定基线记录

> 更新时间：2026-04-26 21:59

## 当前稳定版本

- **commit**: `17b56bd`
- **JS**: `index-DY5OGi-E.js`
- **CSS**: `index-B1qeXMdA.css`
- **上线时间**: 2026-04-26 21:59
- **线上目录**: `/var/www/case-management`

---

## 本次上线内容

**导航修复 + 侧边栏统一 + 工作台筛选修复**

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

## 上次上线内容（真实数据绑定 + 假数据清理）

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
- MD5 本地与线上完全一致
- Playwright 截图 3 张全部生成（case-archive / relief / workbench-filter），0 控制台错误

---

## 线上资源校验

| 项 | 状态 |
|---|---|
| JS 文件大小 | 1,291,323 bytes |
| CSS 文件大小 | 33,980 bytes |
| JS 权限 644 | ✅ |
| CSS 权限 644 | ✅ |
| JS HTTP 200 | ✅ |
| CSS HTTP 200 | ✅ |
| 首页引用正确 JS/CSS | ✅ |
| MD5 本地=线上 | ✅ (`8e11e22424486b3f6ba6bbd848f516b1` / `f851d71809c5abce5f007316baff74f1`) |

---

## 当前回滚点

- **commit**: `37f3187`
- **备份文件**: `index.html.bak-before-nav-filter-fix-20260426-2157`
- **说明**: 回滚仅切 bundle 引用，不需要重新构建

---

## 回滚命令

### 仅回滚线上 bundle 引用（最快）

```bash
# 线上目录
cd /var/www/case-management
cp index.html.bak-before-nav-filter-fix-20260426-2157 index.html
```

### 需要同时回滚源码

```bash
# 本地源码
cd /Users/huangcheng/.agents/skills/case-management
git reset --hard 37f3187
npm run build
# 然后重新上传新的 bundle 到 /var/www/case-management/assets/
```

---

## 历史基线

<details>
<summary>展开历史基线记录</summary>

### v2026-04-26-2159 导航修复 + 侧边栏统一 + 工作台筛选（当前）

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
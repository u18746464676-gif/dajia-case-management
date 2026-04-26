# BASELINE.md - 稳定基线记录

> 更新时间：2026-04-26 21:14

## 当前稳定版本

- **commit**: `06601d9`
- **JS**: `index-_xsBaZb8.js`
- **CSS**: `index-Dm9aJsKk.css`
- **上线时间**: 2026-04-26 21:13
- **线上目录**: `/var/www/case-management`

---

## 本次上线内容

**浅色 SaaS UI + 真实数据绑定 + 假数据清理**

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

---

## 线上资源校验

| 项 | 状态 |
|---|---|
| JS 文件大小 | 1,290,496 bytes |
| CSS 文件大小 | 33,902 bytes |
| JS 权限 644 | ✅ |
| CSS 权限 644 | ✅ |
| JS HTTP 200 | ✅ |
| CSS HTTP 200 | ✅ |
| 首页引用正确 JS/CSS | ✅ |
| MD5 本地=线上 | ✅ (`d64149f6c291db740f117b15a2be7280`) |

---

## 当前回滚点

- **commit**: `4c34f30`
- **备份文件**: `index.html.bak-before-real-data-20260426-2113`
- **说明**: 回滚仅切 bundle 引用，不需要重新构建

---

## 回滚命令

### 仅回滚线上 bundle 引用（最快）

```bash
# 线上目录
cd /var/www/case-management
cp index.html.bak-before-real-data-20260426-2113 index.html
```

### 需要同时回滚源码

```bash
# 本地源码
cd /Users/huangcheng/.agents/skills/case-management
git reset --hard 4c34f30
npm run build
# 然后重新上传新的 bundle 到 /var/www/case-management/assets/
```

---

## 历史基线

<details>
<summary>展开历史基线记录</summary>

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
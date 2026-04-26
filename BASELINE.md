# BASELINE.md - 稳定基线记录

> 更新时间：2026-04-26 18:30

## 当前稳定版本

- **commit**: `2c15d0d`
- **JS**: `index-BZi5hnmu.js`
- **CSS**: `index-Dm9aJsKk.css`
- **上线时间**: 2026-04-26 18:28
- **线上目录**: `/var/www/case-management`

---

## 本次上线内容

**左侧 10 个菜单页面高保真浅色 SaaS UI**

1. 工作台（commit `e0bed66`）— 表格操作列移除"AI分析下一步"仅保留"查看"；跟进提醒数字修正
2. 案件档案（commit `397405f`）— page-header-row + header-actions（搜索图标/问号/通知铃铛/打假人下拉）
3. 证据库（commit `b3e4245`）— page-header-row + header-actions（搜索框/通知铃铛/打假人下拉）
4. 邮寄台账（commit `8d7d97a`）— header-actions（通知铃铛/打假人下拉）；签收提醒数据修正
5. 机关答复（commit `453e37b`）— page-header-row + header-actions（搜索图标/通知铃铛/打假人下拉）
6. 救济监督（commit `6a9a7ed`）— 完全重构为"案件详情救济监督视图"（含面包屑、案件主卡、detail tabs、3张救济记录卡、右侧AI建议栏）
7. 收支统计（commit `32178a9`）— header-actions（使用说明/更新数据）；日期筛选占位符
8. 提醒中心（commit `885469f`）— 截图验收通过，无代码修改
9. 文书生成中心（commit `aa8d69e`）— header-actions（使用说明/模板管理/生成记录）
10. 设置中心（commit `2c15d0d`）— 截图验收通过，无代码修改

---

## 验收结果

- 10 页达到 95%
- 10 张截图均已生成（`screenshots/` 目录下）
- build 通过（仅 chunk size warning，无 error）
- 13 条路由验收全部通过
- `/case/new` 可打开
- 真实案件详情可打开
- AI 抽屉入口此前已验收通过

---

## 线上资源校验

| 项 | 状态 |
|---|---|
| JS 权限 644 | ✅ |
| CSS 权限 644 | ✅ |
| JS HTTP 200 | ✅ |
| CSS HTTP 200 | ✅ |
| 首页不白屏 | ✅ |

---

## 当前回滚点

- **commit**: `019bcab`
- **备份文件**: `index.html.bak-before-light-saas-20260426-1828`
- **说明**: 回滚仅切 bundle 引用，不需要重新构建

---

## 回滚命令

### 仅回滚线上 bundle 引用（最快）

```bash
# 线上目录
cd /var/www/case-management
cp index.html.bak-before-light-saas-20260426-1828 index.html
```

### 需要同时回滚源码

```bash
# 本地源码
cd /Users/huangcheng/.agents/skills/case-management
git reset --hard 019bcab
npm run build
# 然后重新上传新的 bundle 到 /var/www/case-management/assets/
```

---

## 历史基线

<details>
<summary>展开历史基线记录</summary>

### v2026-04-25 深蓝灰法律工作台（已废弃）

- JS: `index-CRno7W-R.js`
- CSS: `index-DuaOLktS.css`
- Git commit: `f5419f5`

</details>

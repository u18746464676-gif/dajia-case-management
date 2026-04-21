# BASELINE.md - 稳定基线记录

> 更新时间：2026-04-22 00:57

## 当前稳定 Bundle

- **JS**: `index-DPLhptBW.js`（2026-04-22，三段独立状态联动 + effectiveStatus 全链路统一）
- **CSS**: `index-Cm4ahCJB.css`
- **构建时间**: 2026-04-22 00:44

## 三段独立状态联动（2026-04-22 确立）

详见 `CHANGE_GUARD.md` 第二阶段新增内容。

### 终态综合状态 effectiveStatus 计算规则

优先级（从高到低）：
1. `mediationStatus === 'decided'` → "已调解"
2. `reportResultStatus` 有值 → 显示对应胶囊（不予立案/不予处罚/责令改正/已处罚）
3. `mediationStatus` 有值（非 decided）→ "终止调解"
4. `acceptanceStatus` 有值 → "已受理" / "不予受理"
5. 所有子状态为空 → "未受理"（强制，不 fallback 到 c.status）

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

## 回滚方案（正式）

> 不做同名 bundle 覆盖回滚。回滚时恢复 index.html 引用旧文件名。

```bash
# 1. 源码回滚
git stash
git checkout <目标 commit>
npm run build

# 2. 取旧 bundle 文件名，更新 index.html 引用后部署
# 假设目标 bundle 是 index-BC0ZOJVL.js：
scp dist/assets/index-BC0ZOJVL.js root@hzyhmz.top:/var/www/case-management/assets/
# 修改 /var/www/case-management/index.html 中 script src 为 index-BC0ZOJVL.js

# 3. 如需恢复 nginx
cp /etc/nginx/conf.d/case-management-ssl.conf.bak /etc/nginx/conf.d/
nginx -t && nginx -s reload
```

## 当前回滚点

| 类型 | 标识 | 说明 |
|------|------|------|
| Git 回滚点 | `53ef8e8` | feat: add batch envelope image picker entry（三段联动前） |
| 当前稳定 bundle | `index-DPLhptBW.js` | 2026-04-22 00:44 |
| 上一稳定 bundle | `index-BC0ZOJVL.js` | BASELINE.md 旧记录（多选上传稳定版） |

## nginx 路由基线（无变更）

- `/api/storage/upload` → `http://127.0.0.1:8787`（storage-server）
- `GET /api/storage/files` → `http://127.0.0.1:3001`（cloud_files 查询）
- `DELETE /api/storage/file` → `http://127.0.0.1:3001`（软删本地+DB）
- `/api/` → `http://127.0.0.1:3001/api/`（case-management-api）

## 关键文件版本

| 文件 | 版本/说明 |
|------|-----------|
| 前端入口 | index.html（引用 index-DPLhptBW.js） |
| 后端服务 | server/combined-server.cjs |
| nginx 配置 | server/nginx-production.conf |
| 云端文件数据源 | cloud_files（DB，deleted_at IS NULL） |
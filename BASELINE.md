# BASELINE.md - 稳定基线记录

## 当前稳定 Bundle

- **JS**: `index-CP0fHGGy.js`（= 源码 build `index-3kbFiamx.js`，修复云端列表数据源，2026-04-21）
- **CSS**: `index-_zZAD9Z_.css`
- **构建时间**: 2026-04-21

## nginx 路由基线

- `/api/storage/upload` → `http://127.0.0.1:8787`（storage-server，线上上传主链路）
- `GET /api/storage/files` → `http://127.0.0.1:3001`（3001，查询 cloud_files 数据库）
- `DELETE /api/storage/file` → `http://127.0.0.1:3001`（3001，删除本地文件并软删数据库）
- `/api/` → `http://127.0.0.1:3001/api/`（case-management-api）

## 当前线上上传基线

- 上传信封、上传文书、上传 Word 三条线上上传主链路，实际都走：`https://hzyhmz.top/api/storage/upload`
- 上传结果实际落到本地文件系统：`/uploads/...`
- 上传完成后，再由 `POST /api/register-cloud-file` 写入 `cloud_files`
- **当前线上上传主链路 = 8787 + 本地 `/uploads/`**
- **当前线上上传不依赖 TOS**

## 云端文件管理数据源（2026-04-21 确立）

- **sole data source**: `cloud_files` 数据库（`deleted_at IS NULL` 的记录）
- **list API**: `GET /api/storage/files`（查询 cloud_files 表）
- **不再依赖**: `listTosObjects('case-images/')` / TOS 直列对象 / localStorage 兜底
- **列表字段**: `url`, `Key`, `name`, `uploadedAt` 均来自 DB 记录
- **删除链路**: `DELETE /api/storage/file?urlOrKey=...` → DB 软删除（`deleted_at` 写入）→ 列表自动过滤
- **闭环已验**: 数据库软删除 + 列表消失（2026-04-21 测试通过，ID: 95133362-6825-43ca-8a25-0e4636970937）
- **物理文件删除**: 将在后续用真实本地文件样本补测

## 回滚目标

如需回滚到上一版本，执行：

```bash
# 1. 源码回滚
git stash
git checkout <目标 commit>
npm run build

# 2. 部署 dist/ 到服务器
scp dist/assets/index-*.js root@hzyhmz.top:/var/www/case-management/assets/

# 3. 如需恢复 nginx
cp /etc/nginx/conf.d/case-management-ssl.conf.bak /etc/nginx/conf.d/case-management-ssl.conf
nginx -t && nginx -s reload
```

**当前部署 bundle**（2026-04-21）: `index-CP0fHGGy.js`（= 源码 build `index-3kbFiamx.js`，修复云端列表数据源）
**CSS**: `index-_zZAD9Z_.css`
**上一稳定 bundle**: `index-CP0fHGGy.js`（修复前版本，列表含 TOS 孤儿）

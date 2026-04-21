# BASELINE.md - 稳定基线记录

## 当前稳定 Bundle

- **JS**: `index-0Bgdfb86.js`
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

## 回滚目标

如需回滚，执行：

```bash
# 1. 恢复源码
git log --oneline -5
git checkout <目标 commit>
npm run build

# 2. 重新部署 dist/
tar -czf /tmp/case-dist.tar.gz -C dist .
scp /tmp/case-dist.tar.gz root@hzyhmz.top:/tmp/
ssh root@hzyhmz.top "tar -xzf /tmp/case-dist.tar.gz -C /var/www/case-management/"

# 3. 回滚 nginx（如需）
cp /etc/nginx/conf.d/case-management-ssl.conf.bak /etc/nginx/conf.d/case-management-ssl.conf
nginx -t && nginx -s reload
```

**当前稳定 bundle**: `index-0Bgdfb86.js`（CSS `index-_zZAD9Z_.css`）
**上一个稳定 bundle**: `index-CP0fHGGy.js`（CSS `index-_zZAD9Z_.css`）

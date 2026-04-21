# CHANGE_GUARD.md - 主链路封板规则

> 生效时间：2026-04-21
> 目标：冻结当前已跑通主链路，后续新增功能不得破坏现有运转。

## 一、冻结区（默认禁止改）

以下模块列为**冻结区**，默认禁止改动：

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

---

## 二、触碰冻结区的强制规则

只要未来改动触碰冻结区，必须先提供以下 5 项，未经确认不得直接改：

1. 改动范围
2. 风险点
3. 回滚方案
4. 全链路回归清单
5. 上线后验证项

---

## 三、固定冒烟测试清单

每次改动前后都必须验证以下项目：

1. 上传信封
2. 上传文书
3. 上传 Word
4. `/api/register-cloud-file` 入库
5. 云端文件管理列表
6. 云端单个删除
7. 云端批量删除
8. 材料中心预览

---

## 四、新功能开发原则

以后新增功能必须遵守：

- 默认不侵入主链路
- 优先新组件 / 新接口 / 新字段
- 不允许为了新功能顺手改上传、删除、列表、预览主逻辑
- 能加开关就加开关
- 能旁路实现就不要侵入实现

---

## 五、部署规则

- 不允许同名 bundle 覆盖作为长期方案
- 每次 build 生成新 bundle 文件名
- 部署后必须核对 `index.html` 实际引用
- 必须保留上一个可回滚版本
- nginx 配置必须保留备份

---

## 六、当前冻结基线（2026-04-21）

### 1. 上传主链路基线

- 前端上传入口统一走：`/api/storage/upload`
- nginx：`location /api/storage/` → `127.0.0.1:8787`
- 本地文件落盘：`/var/www/case-management/uploads/...`
- 上传后由 `/api/register-cloud-file` 写入 `cloud_files`

### 2. 云端文件管理基线

- 列表数据源：`cloud_files` 数据库记录
- 列表接口：`GET /api/storage/files` → `127.0.0.1:3001`
- 删除接口：`DELETE /api/storage/file` → `127.0.0.1:3001`
- 列表默认只显示：`deleted_at IS NULL`
- 不再依赖 TOS 直列对象作为云端管理数据源

### 3. 关键 nginx 路由基线

```nginx
location = /api/storage/files {
    proxy_pass http://127.0.0.1:3001;
}

location = /api/storage/file {
    proxy_pass http://127.0.0.1:3001;
}

location /api/storage/ {
    proxy_pass http://127.0.0.1:8787;
}
```

---

## 七、当前回滚点清单

### 源码回滚点

- Git commit: `4ea7c0b`
  - 含义：云端文件列表统一到 DB 数据源，移除 TOS 直列兜底

### 前端静态资源回滚点

- 当前线上 JS：`index-3kbFiamx.js`
- 当前线上 CSS：`index-_zZAD9Z_.css`
- 上一可回滚 JS：`index-CP0fHGGy.js`

### nginx 回滚点

- 当前配置：`/etc/nginx/conf.d/case-management-ssl.conf`
- 备份文件：
  - `/etc/nginx/conf.d/case-management-ssl.conf.bak`
  - `/etc/nginx/conf.d/case-management-ssl.conf.bak-20260421-*`

---

## 八、执行要求

以后所有需求默认按以下顺序处理：

1. 先判断是否触碰冻结区
2. 若触碰，先提交变更说明与回滚方案
3. 先做最小改动
4. 必须跑固定冒烟清单
5. 验证通过后才允许继续扩展功能

未经明确确认，不允许再随意改主链路。
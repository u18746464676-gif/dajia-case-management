# 打假案件管理系统

案件上传 → OCR识别 → 智能匹配 → 统一存储

## 技术架构

**前端：** Vue 3 + Vite + Pinia + Tailwind CSS
**后端：** Node.js + Express + Supabase (service_role)
**对象存储：** 火山引擎 TOS
**OCR：** 字节豆包

## 目录结构

```
├── src/
│   ├── lib/
│   │   ├── cloudFiles.js    # 云端文件注册（调后端 API）
│   │   ├── doubao.js        # 豆包 OCR
│   │   └── tos.js          # 火山引擎 TOS 上传
│   ├── pages/
│   │   └── CaseList.vue    # 案件列表 + 上传入口
│   └── stores/
│       └── case.js         # 案件状态管理
├── server-api.js           # 后端 API（仓库名，部署到 /var/www/case-management-api/server.js）
├── case-management.conf     # Nginx 配置模板
├── case-management-api.service  # systemd 服务模板
└── supabase/               # Supabase 函数（已废弃，改走自有后端）
```

## 上传链路（2026-04-19 重构后）

```
用户上传 → TOS 上传 → OCR 识别 → 案件匹配
  ├─ 匹配成功 → 写入 cases.images ✅
  └─ 未匹配 → POST /api/register-cloud-file
                → 后端用 Supabase service_role 写 cloud_files 表
                → 返回成功/失败
```

## 后端 API

| 路径 | 方法 | 说明 |
|------|------|------|
| `/api/register-cloud-file` | POST | 写入 cloud_files |
| `/api/health` | GET | 健康检查 |

## 部署

### 前端
```bash
npm install
npm run build
# 部署 dist/ 到 /var/www/case-management/
```

### 后端
```bash
cp case-management-api.service.example /etc/systemd/system/case-management-api.service
# 编辑 service 文件，填入真实 SUPABASE_SERVICE_ROLE_KEY
systemctl daemon-reload
systemctl enable case-management-api
systemctl start case-management-api
```

### Nginx
```bash
cp case-management.conf.example /etc/nginx/conf.d/case-management.conf
nginx -t && systemctl reload nginx
```

## 环境变量（请勿提交到 GitHub）

```bash
# .env.local（已 gitignore，不会提交）
VITE_DOUBAO_API_KEY=你的豆包API_Key
VITE_TOS_BUCKET=你的桶
VITE_TOS_REGION=cn-beijing
VITE_TOS_ENDPOINT=tos-cn-beijing.volces.com
VITE_TOS_ACCESS_KEY_ID=你的AK
VITE_TOS_SECRET_ACCESS_KEY=你的SK
```

## 部署文件名映射

| 仓库文件名 | 服务器实际路径 |
|-----------|---------------|
| `server-api.js` | `/var/www/case-management-api/server.js` |
| `case-management.conf` | `/etc/nginx/conf.d/case-management.conf` |
| `case-management-api.service` | `/etc/systemd/system/case-management-api.service` |

## Supabase 配置

- 项目 ID：`hsfovbgeeqomtvaegfqb`
- 表：`cloud_files`（RLS 开启，仅 service_role 可写）
- service_role key 仅保存在服务器 systemd service 环境变量中

## License

Private

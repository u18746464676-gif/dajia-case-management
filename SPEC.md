# 打假案件管理系统 - 规格文档

## 1. 项目概述

- **项目名称**：打假案件管理系统
- **核心功能**：打假案源录入、举报进度跟踪、文书存储、时限提醒
- **用户**：个人打假从业者（月均400-500案件）
- **技术栈**：Vue3 + 阿里云盘API + 微信登录

## 2. 数据模型

### 2.1 案件（Case）

```typescript
interface Case {
  id: string;                    // UUID
  createdAt: string;             // ISO时间
  updatedAt: string;             // ISO时间

  // 录入信息
  shopName: string;              // 店铺名称
  productName: string;           // 商品名称
  productPrice: number;          // 商品价格（元）
  licenseName: string;           // 执照名称

  // 流程状态
  status: CaseStatus;            // 当前状态
  statusHistory: StatusChange[]; // 状态变更记录

  // 举报信息
  reportDate?: string;           // 举报日期
  reportPlatform?: string;       // 举报平台（抖店/京东/淘宝等）

  // 受理信息
  acceptanceDate?: string;      // 受理日期
  acceptanceWay?: AcceptanceWay; // 受理方式
  decisionDate?: string;         // 决定日期（不予立案/已立案/责令改正日期）

  // 答复记录
  replies: Reply[];               // 答复记录列表

  // 文书
  documents: Document[];          // 上传的文书文件

  // 倒计时
  deadlines: Deadline[];          // 各阶段时限提醒

  // 备注
  notes: string;
}

type CaseStatus =
  | 'pending_report'    // 待举报
  | 'reported'          // 已举报
  | 'accepted'          // 已受理（受理中）
  | 'decided'           // 已决定
  | 'closed';           // 已结案

type AcceptanceWay =
  | '不予立案'
  | '已立案'
  | '责令改正';

interface StatusChange {
  from: CaseStatus;
  to: CaseStatus;
  changedAt: string;
  reason?: string;
}

interface Reply {
  id: string;
  date: string;
  content: string;
  attachmentUrls: string[];
}

interface Document {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'other';
  url: string;           // 阿里云盘分享链接
  uploadedAt: string;
  caseId: string;
}

interface Deadline {
  name: string;          // 时限名称
  date: string;          // 截止日期
  type: 'legal' | 'self'; // 法律时限/自设时限
  alertDays: number;      // 提前几天提醒
}
```

## 3. 核心功能

### 3.1 案件录入
- 表单填写：店铺名称、商品名称、商品价格、执照名称
- 状态初始化为"待举报"
- 自动生成UUID和时间戳

### 3.2 案件状态流转

```
待举报 → 已举报 → 已受理 → 已决定 → 已结案
              ↓
         （受理方式：不予立案/已立案/责令改正）
```

### 3.3 答复记录
- 按时间倒序展示答复列表
- 每条答复包含：日期、内容、附件
- 支持追加新答复

### 3.4 文书上传
- 支持图片（截图、照片）和PDF
- 文件存储到阿里云盘指定目录
- 每个案件一个文件夹：`/打假案件/{案件ID}/`

### 3.5 倒计时提醒
- **法定时限**（自动计算）：
  - 受理答复：7个工作日
  - 立案后结案：90日（复杂可延至180日）
  - 责令改正：15日
- **自定义提醒**：可添加任意截止日期
- 提前N天提醒（默认3天）

### 3.6 案件查询与筛选
- 按状态筛选
- 按时间范围筛选
- 关键字搜索（店铺名/商品名称）
- 过期案件高亮

## 4. 阿里云盘集成

### 4.1 授权流程
1. 用户访问授权页面
2. 扫码登录阿里云盘
3. 获取Refresh Token
4. 保存Token到本地配置
5. 自动刷新Access Token

### 4.2 文件存储结构
```
阿里云盘
└── 应用数据
    └── 打假案件管理
        ├── cases.json          # 案件索引
        └── cases
            └── {case_id}
                ├── documents    # 文书文件夹
                │   ├── img1.jpg
                │   └── doc.pdf
                └── case.json    # 单个案件详情
```

## 5. 技术架构

### 5.1 前端
- **框架**：Vue3 + Vite
- **UI**：TailwindCSS
- **状态**：Pinia
- **路由**：Vue Router

### 5.2 后端（可选，轻量方案用本地服务）
- Node.js 简单服务处理Token刷新
- 或者纯前端 + 阿里云盘开放API直连

### 5.3 微信登录
- 接入微信开放平台（需要已认证的公众号）
- 简化方案：先做本地存储，微信登录作为可选项

## 6. MVP第一版优先级

### P0（核心必须）
1. 案件录入表单（店铺名、商品名、价格、执照名）
2. 案件状态管理（待举报→已举报→已受理→已决定→已结案）
3. 受理方式（不予立案/已立案/责令改正）
4. 答复记录（时间+内容）
5. 文书上传（图片）
6. 倒计时提醒

### P1（第二版）
- 案件列表查询与筛选
- 案件统计看板
- 违规词自动识别

### P2（后续迭代）
- 微信登录
- 微信通知提醒
- 数据导出Excel
- 多条件搜索

## 7. 页面结构

```
/                   # 首页（案件列表）
/case/new          # 新增案件
/case/:id          # 案件详情
/case/:id/edit     # 编辑案件
/settings          # 阿里云盘授权设置
```
